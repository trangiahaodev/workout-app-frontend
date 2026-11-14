import {
  MuscleDistribution,
  ProgressAnalyticsData,
  VolumeHistoryPoint,
  WorkoutLog,
  WorkoutPlan,
  WorkoutSession,
} from "../types";
import { getLogsBySession, getSessionsByPlan } from "./logService";
import { getPlansByProfile } from "./planService";

/**
 * Sanitizer đảm bảo giá trị số không âm, không bị NaN hoặc null/undefined
 */
export function sanitizeNumber(val: unknown): number {
  if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
    return Math.max(0, val);
  }
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }
  return 0;
}

/**
 * Tính tổng Volume (kg) và số sets hoàn thành của một danh sách logs
 * RÀNG BUỘC KỸ THUẬT: Chỉ tính Volume khi set.isCompleted === true
 */
export function calculateSessionVolume(logs: WorkoutLog[]): {
  totalVolumeKg: number;
  completedSetsCount: number;
  exercisesCount: number;
} {
  let totalVolumeKg = 0;
  let completedSetsCount = 0;
  const exerciseIds = new Set<string>();

  for (const log of logs) {
    if (!log || !Array.isArray(log.sets)) continue;

    const exId =
      typeof log.exerciseId === "object"
        ? log.exerciseId?._id
        : String(log.exerciseId || "");
    if (exId) exerciseIds.add(exId);

    for (const set of log.sets) {
      if (set && set.isCompleted === true) {
        const weight = sanitizeNumber(set.weight);
        const reps = sanitizeNumber(set.reps);
        totalVolumeKg += weight * reps;
        completedSetsCount += 1;
      }
    }
  }

  return {
    totalVolumeKg: Math.round(totalVolumeKg),
    completedSetsCount,
    exercisesCount: exerciseIds.size,
  };
}

/**
 * Phân bổ nhóm cơ (Muscle Group Distribution)
 * Gom nhóm theo muscleGroup của bài tập và tính tỷ lệ phần trăm khối lượng
 */
export function aggregateMuscleStats(logs: WorkoutLog[]): MuscleDistribution[] {
  const muscleMap = new Map<string, { volumeKg: number; setsCount: number }>();
  let overallVolumeKg = 0;

  for (const log of logs) {
    if (!log || !Array.isArray(log.sets)) continue;

    const muscle =
      typeof log.exerciseId === "object" && log.exerciseId?.muscleGroup
        ? log.exerciseId.muscleGroup
        : "Toàn thân";

    const current = muscleMap.get(muscle) || { volumeKg: 0, setsCount: 0 };

    for (const set of log.sets) {
      if (set && set.isCompleted === true) {
        const weight = sanitizeNumber(set.weight);
        const reps = sanitizeNumber(set.reps);
        const vol = weight * reps;

        current.volumeKg += vol;
        current.setsCount += 1;
        overallVolumeKg += vol;
      }
    }

    muscleMap.set(muscle, current);
  }

  const list: MuscleDistribution[] = [];
  muscleMap.forEach((val, key) => {
    if (val.setsCount > 0 || val.volumeKg > 0) {
      const percentage =
        overallVolumeKg > 0
          ? Math.round((val.volumeKg / overallVolumeKg) * 100)
          : 0;
      list.push({
        muscleGroup: key,
        totalVolumeKg: Math.round(val.volumeKg),
        setsCount: val.setsCount,
        percentage,
      });
    }
  });

  return list.sort((a, b) => b.totalVolumeKg - a.totalVolumeKg);
}

/**
 * Tính toán tần suất tập và tỷ lệ hoàn thành buổi tập
 */
export function calculateFrequencyAndCompletion(sessions: WorkoutSession[]) {
  const totalSessionsCount = sessions.length;
  const completedSessions = sessions.filter(
    (s) => s.status === "completed" || Boolean(s.completedDate),
  );
  const completedSessionsCount = completedSessions.length;
  const completionRate =
    totalSessionsCount > 0
      ? Math.round((completedSessionsCount / totalSessionsCount) * 100)
      : 0;

  let weeklyFrequency = 0;
  if (completedSessionsCount > 0) {
    const timestamps = completedSessions
      .map((s) => new Date(s.completedDate || s.scheduledDate).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b);

    if (timestamps.length >= 2) {
      const diffMs = timestamps[timestamps.length - 1] - timestamps[0];
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      const weeks = Math.max(1, diffDays / 7);
      weeklyFrequency = Number((completedSessionsCount / weeks).toFixed(1));
    } else {
      weeklyFrequency = completedSessionsCount;
    }
  }

  return {
    totalSessionsCount,
    completedSessionsCount,
    completionRate,
    weeklyFrequency,
  };
}

/**
 * Tổng hợp thống kê tiến độ xuyên suốt tất cả lộ trình của người dùng (profileId)
 */
export async function fetchPlanAnalytics(
  planId?: string,
  profileId?: string,
): Promise<ProgressAnalyticsData> {
  let plans: WorkoutPlan[] = [];
  if (profileId) {
    plans = await getPlansByProfile(profileId).catch(() => []);
  }

  const planIds = new Set<string>(plans.map((p) => p._id));
  if (planId) planIds.add(planId);

  if (planIds.size === 0) {
    return {
      totalVolumeKg: 0,
      completedSessionsCount: 0,
      totalSessionsCount: 0,
      completionRate: 0,
      weeklyFrequency: 0,
      muscleDistribution: [],
      volumeHistory: [],
      dominantMuscleGroup: undefined,
    };
  }

  const sessionGroups = await Promise.all(
    Array.from(planIds).map((id) => getSessionsByPlan(id).catch(() => [])),
  );

  const uniqueSessions = new Map<string, WorkoutSession>();
  sessionGroups.flat().forEach((s) => {
    if (s?._id) uniqueSessions.set(s._id, s);
  });

  const allSessions = Array.from(uniqueSessions.values()).sort(
    (a, b) =>
      new Date(a.completedDate || a.scheduledDate).getTime() -
      new Date(b.completedDate || b.scheduledDate).getTime(),
  );

  const activePlan =
    plans.find((p) => p.status === "active") ??
    (planId ? plans.find((p) => p._id === planId) : undefined);

  // Giữ lịch sử các buổi đã hoàn thành ở lộ trình cũ + toàn bộ buổi của lộ trình hiện tại
  const scopedSessions = allSessions.filter(
    (s) =>
      s.status === "completed" ||
      Boolean(s.completedDate) ||
      (activePlan ? s.planId === activePlan._id : s.planId === planId),
  );

  const completedOrActiveSessions = scopedSessions;

  const sessionLogResults = await Promise.allSettled(
    completedOrActiveSessions.map(async (session) => {
      try {
        const res = await getLogsBySession(session._id);
        return {
          sessionId: session._id,
          logs: Array.isArray(res) ? res : [],
        };
      } catch {
        return { sessionId: session._id, logs: [] };
      }
    }),
  );

  const logsBySession: Record<string, WorkoutLog[]> = {};
  const allLogs: WorkoutLog[] = [];

  for (const item of sessionLogResults) {
    if (item.status === "fulfilled" && item.value) {
      logsBySession[item.value.sessionId] = item.value.logs;
      allLogs.push(...item.value.logs);
    }
  }

  const volumeHistory: VolumeHistoryPoint[] = [];
  let totalVolumeAccumulated = 0;

  for (const session of completedOrActiveSessions) {
    const sessionLogs = logsBySession[session._id] || [];
    const stats = calculateSessionVolume(sessionLogs);

    if (
      session.status === "completed" ||
      stats.totalVolumeKg > 0 ||
      Boolean(session.completedDate)
    ) {
      totalVolumeAccumulated += stats.totalVolumeKg;
      volumeHistory.push({
        sessionId: session._id,
        sessionName: session.name,
        date: session.completedDate || session.scheduledDate,
        totalVolumeKg: stats.totalVolumeKg,
        completedSetsCount: stats.completedSetsCount,
      });
    }
  }

  const {
    totalSessionsCount,
    completedSessionsCount,
    completionRate,
    weeklyFrequency,
  } = calculateFrequencyAndCompletion(completedOrActiveSessions);

  const muscleDistribution = aggregateMuscleStats(allLogs);
  const dominantMuscleGroup =
    muscleDistribution.length > 0
      ? muscleDistribution[0].muscleGroup
      : undefined;

  return {
    totalVolumeKg: totalVolumeAccumulated,
    completedSessionsCount,
    totalSessionsCount,
    completionRate,
    weeklyFrequency,
    muscleDistribution,
    volumeHistory,
    dominantMuscleGroup,
  };
}
