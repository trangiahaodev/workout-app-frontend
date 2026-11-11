import {
  Profile,
  WorkoutPlan,
  WorkoutSession,
  Exercise,
  WorkoutLog,
} from "../../types";
import { HomeData } from "./types";

export const DEFAULT_PROFILE_ID = "670c1a111111111111111101";
export const DEFAULT_PLAN_ID = "670c1a222222222222222201";
export const DEFAULT_SESSION_ID = "670c1a333333333333333301";

// 1. Profile: Mục tiêu "Tăng cơ", Level "Beginner", 4 buổi/tuần
export const mockProfile: Profile = {
  _id: DEFAULT_PROFILE_ID,
  userId: "user_2test1234567890abcdef",
  goal: "Tăng cơ",
  level: "Beginner",
  trainingDaysPerWeek: 4,
};

// 2. Thư viện bài tập
export const mockExercises: Exercise[] = [
  {
    _id: "6abc93738a6b7b585e251481",
    name: "Barbell Bench Press",
    muscleGroup: "Ngực",
    equipmentRequired: "Barbell",
    description: "Nằm ghế phẳng đẩy tạ đòn phát triển ngực toàn diện",
  },
  {
    _id: "6abc93738a6b7b585e251482",
    name: "Incline Dumbbell Press",
    muscleGroup: "Ngực",
    equipmentRequired: "Dumbbell",
    description: "Nằm ghế dốc lên đẩy tạ đơn tập trung cơ ngực trên",
  },
  {
    _id: "6abc93738a6b7b585e251485",
    name: "Lat Pulldown",
    muscleGroup: "Lưng",
    equipmentRequired: "Cable Machine",
    description: "Kéo cáp rộng tay trên máy phát triển độ rộng lưng xô",
  },
  {
    _id: "6abc93738a6b7b585e251486",
    name: "Seated Cable Row",
    muscleGroup: "Lưng",
    equipmentRequired: "Cable Machine",
    description: "Ngồi kéo cáp hẹp tay phát triển độ dày lưng giữa",
  },
  {
    _id: "6abc93738a6b7b585e251489",
    name: "Barbell Back Squat",
    muscleGroup: "Chân",
    equipmentRequired: "Barbell",
    description: "Gánh tạ đòn phát triển cơ đùi trước, đùi sau và mông",
  },
  {
    _id: "6abc93738a6b7b585e251490",
    name: "Leg Press",
    muscleGroup: "Chân",
    equipmentRequired: "Machine",
    description: "Đạp đùi trên máy 45 độ, an toàn cho cột sống người mới",
  },
  {
    _id: "6abc93738a6b7b585e251494",
    name: "Dumbbell Shoulder Press",
    muscleGroup: "Vai",
    equipmentRequired: "Dumbbell",
    description: "Ngồi ghế đẩy tạ đơn qua đầu phát triển cơ vai trước và giữa",
  },
  {
    _id: "6abc93738a6b7b585e251497",
    name: "Dumbbell Bicep Curl",
    muscleGroup: "Tay trước",
    equipmentRequired: "Dumbbell",
    description: "Đứng cuốn tạ đơn phát triển bắp tay trước săn chắc",
  },
  {
    _id: "6abc93738a6b7b585e251499",
    name: "Tricep Rope Pushdown",
    muscleGroup: "Tay sau",
    equipmentRequired: "Cable Machine",
    description: "Đứng nhấn dây cáp xuống siết chặt cơ bắp tay sau",
  },
];

// 3. Workout Plans
export const mockPlans: WorkoutPlan[] = [
  {
    _id: DEFAULT_PLAN_ID,
    profileId: DEFAULT_PROFILE_ID,
    name: "Upper / Lower Strength (4 Buổi)",
    generatedByAI: true,
    status: "active",
    startDate: "2026-10-01T00:00:00.000Z",
    endDate: "2026-11-01T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222202",
    profileId: DEFAULT_PROFILE_ID,
    name: "Push - Pull - Legs Sinh Viên",
    generatedByAI: false,
    status: "active",
    startDate: "2026-10-05T00:00:00.000Z",
    endDate: "2026-11-05T00:00:00.000Z",
  },
];

// 4. Workout Sessions
export const mockSessions: WorkoutSession[] = [
  {
    _id: DEFAULT_SESSION_ID,
    planId: DEFAULT_PLAN_ID,
    name: "Thân Trên Sức Mạnh (Upper A)",
    scheduledDate: "2026-10-05T08:00:00.000Z",
    completedDate: "2026-10-05T09:15:00.000Z",
    status: "completed",
  },
  {
    _id: "670c1a333333333333333302",
    planId: DEFAULT_PLAN_ID,
    name: "Thân Dưới & Bụng (Lower A)",
    scheduledDate: "2026-10-07T08:00:00.000Z",
    completedDate: "2026-10-07T09:20:00.000Z",
    status: "completed",
  },
  {
    _id: "670c1a333333333333333303",
    planId: DEFAULT_PLAN_ID,
    name: "Thân Trên Phì Đại (Upper B)",
    scheduledDate: "2026-10-09T08:00:00.000Z",
    completedDate: "2026-10-09T09:10:00.000Z",
    status: "completed",
  },
];

// 5. Workout Logs
export const MOCK_LOGS: WorkoutLog[] = [
  {
    _id: "670c1a444444444444444401",
    sessionId: DEFAULT_SESSION_ID,
    exerciseId: {
      _id: "6abc93738a6b7b585e251481",
      name: "Barbell Bench Press",
      muscleGroup: "Ngực",
    },
    sets: [
      { setId: "set_1", reps: 12, weight: 30, isCompleted: true },
      { setId: "set_2", reps: 10, weight: 35, isCompleted: true },
      { setId: "set_3", reps: 8, weight: 40, isCompleted: true },
      { setId: "set_4", reps: 6, weight: 42.5, isCompleted: true },
    ],
    notes: "Đẩy ngực tạ đòn khởi động tốt, mức 42.5kg giữ form chuẩn",
    createdAt: "2026-10-05T08:15:00.000Z",
  },
  {
    _id: "670c1a444444444444444402",
    sessionId: DEFAULT_SESSION_ID,
    exerciseId: {
      _id: "6abc93738a6b7b585e251485",
      name: "Lat Pulldown",
      muscleGroup: "Lưng",
    },
    sets: [
      { setId: "set_1", reps: 12, weight: 35, isCompleted: true },
      { setId: "set_2", reps: 10, weight: 40, isCompleted: true },
      { setId: "set_3", reps: 10, weight: 40, isCompleted: true },
    ],
    notes: "Kéo xô máy mở ngực đón tạ, lưng xô siết tốt",
    createdAt: "2026-10-05T08:35:00.000Z",
  },
  {
    _id: "670c1a444444444444444403",
    sessionId: DEFAULT_SESSION_ID,
    exerciseId: {
      _id: "6abc93738a6b7b585e251494",
      name: "Dumbbell Shoulder Press",
      muscleGroup: "Vai",
    },
    sets: [
      { setId: "set_1", reps: 12, weight: 10, isCompleted: true },
      { setId: "set_2", reps: 10, weight: 12, isCompleted: true },
      { setId: "set_3", reps: 8, weight: 12, isCompleted: true },
    ],
    notes: "Đẩy vai tạ đơn ngồi ghế tựa thẳng lưng",
    createdAt: "2026-10-05T08:55:00.000Z",
  },
];

export const mockLogs = MOCK_LOGS;

export const defaultHomeData: HomeData = {
  profile: mockProfile,
  plans: mockPlans,
  sessions: mockSessions,
  exercises: mockExercises,
  logs: MOCK_LOGS,
};
