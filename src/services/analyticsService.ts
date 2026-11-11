import {
  MuscleDistribution,
  ProgressAnalyticsData,
  VolumeHistoryPoint,
  WorkoutLog,
  WorkoutSession,
} from "../types";
import { getLogsBySession, getSessionsByPlan } from "./logService";
import {
  MOCK_LOGS,
  mockPlans,
  mockSessions,
} from "../components/home/mockData";

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
 * Service tích hợp: Fetch sessions + batch logs song song và tổng hợp dữ liệu thống kê
 */
export async function fetchPlanAnalytics(
  planId?: string,
): Promise<ProgressAnalyticsData> {
  const targetPlanId = planId || mockPlans[0]?._id;

  let loadedSessions: WorkoutSession[] = [];
  if (targetPlanId) {
    try {
      const res = await getSessionsByPlan(targetPlanId);
      if (Array.isArray(res) && res.length > 0) {
        loadedSessions = res;
      }
    } catch {
      // API offline hoặc lỗi mạng, fallback bên dưới
    }
  }

  // Fallback an toàn về mockSessions nếu API rỗng
  if (loadedSessions.length === 0) {
    loadedSessions = mockSessions.filter(
      (s) => !targetPlanId || s.planId === targetPlanId,
    );
    if (loadedSessions.length === 0) {
      loadedSessions = mockSessions;
    }
  }

  // Sắp xếp các buổi tập theo ngày
  loadedSessions.sort(
    (a, b) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
  );

  // Batch fetch logs của các buổi tập bằng Promise.allSettled
  const sessionLogResults = await Promise.allSettled(
    loadedSessions.map(async (session) => {
      try {
        const res = await getLogsBySession(session._id);
        if (Array.isArray(res) && res.length > 0) {
          return { sessionId: session._id, logs: res };
        }
      } catch {
        // Tiếp tục fallback bên dưới
      }

      // Fallback về MOCK_LOGS
      const matched = MOCK_LOGS.filter((l) => l.sessionId === session._id);
      return { sessionId: session._id, logs: matched };
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

  // Xây dựng volume history theo từng buổi
  const volumeHistory: VolumeHistoryPoint[] = [];
  let totalVolumeAccumulated = 0;

  for (const session of loadedSessions) {
    const sessionLogs = logsBySession[session._id] || [];
    const stats = calculateSessionVolume(sessionLogs);

    // Chỉ đưa vào history nếu buổi tập đã hoàn thành hoặc có volume > 0
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
  } = calculateFrequencyAndCompletion(loadedSessions);

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
