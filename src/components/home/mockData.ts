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
    _id: "670c1a222222222222222201",
    profileId: "670c1a111111111111111101",
    name: "Upper / Lower Split (4 Days)",
    goal: "Tăng cơ",
    coverImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "active",
    startDate: "2026-11-01T00:00:00.000Z",
    endDate: "2026-12-01T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222202",
    profileId: "670c1a111111111111111101",
    name: "Push - Pull - Legs (PPL)",
    goal: "Tăng cơ",
    coverImage:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
    generatedByAI: false,
    status: "active",
    startDate: "2026-11-05T00:00:00.000Z",
    endDate: "2026-12-05T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222203",
    profileId: "670c1a111111111111111101",
    name: "5-Day Hypertrophy Builder",
    goal: "Tăng cơ",
    coverImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "completed",
    startDate: "2026-10-01T00:00:00.000Z",
    endDate: "2026-10-30T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222204",
    profileId: "670c1a111111111111111101",
    name: "Metabolic Full Body Burn",
    goal: "Giảm mỡ",
    coverImage:
      "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "active",
    startDate: "2026-11-01T00:00:00.000Z",
    endDate: "2026-12-15T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222205",
    profileId: "670c1a111111111111111101",
    name: "Upper / Lower Cardio Circuit",
    goal: "Giảm mỡ",
    coverImage:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    generatedByAI: false,
    status: "active",
    startDate: "2026-11-05T00:00:00.000Z",
    endDate: "2026-12-05T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222206",
    profileId: "670c1a111111111111111101",
    name: "HIIT & Core Conditioning",
    goal: "Giảm mỡ",
    coverImage:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "active",
    startDate: "2026-11-10T00:00:00.000Z",
    endDate: "2026-12-10T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222207",
    profileId: "670c1a111111111111111101",
    name: "Powerlifting 5x5 Foundation",
    goal: "Sức mạnh",
    coverImage:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "active",
    startDate: "2026-11-01T00:00:00.000Z",
    endDate: "2026-12-15T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222208",
    profileId: "670c1a111111111111111101",
    name: "Heavy Compound Upper / Lower",
    goal: "Sức mạnh",
    coverImage:
      "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80",
    generatedByAI: false,
    status: "active",
    startDate: "2026-11-05T00:00:00.000Z",
    endDate: "2026-12-05T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222209",
    profileId: "670c1a111111111111111101",
    name: "Squat & Deadlift Peak Block",
    goal: "Sức mạnh",
    coverImage:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "active",
    startDate: "2026-11-10T00:00:00.000Z",
    endDate: "2026-12-10T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222210",
    profileId: "670c1a111111111111111101",
    name: "Balanced Full Body (3 Days)",
    goal: "Giữ dáng, giữ cân",
    coverImage:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "active",
    startDate: "2026-11-01T00:00:00.000Z",
    endDate: "2026-12-01T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222211",
    profileId: "670c1a111111111111111101",
    name: "Aesthetic Tone & Posture",
    goal: "Giữ dáng, giữ cân",
    coverImage:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80",
    generatedByAI: false,
    status: "active",
    startDate: "2026-11-05T00:00:00.000Z",
    endDate: "2026-12-05T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222212",
    profileId: "670c1a111111111111111101",
    name: "Athletic Mobility & Core",
    goal: "Giữ dáng, giữ cân",
    coverImage:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80",
    generatedByAI: true,
    status: "active",
    startDate: "2026-11-10T00:00:00.000Z",
    endDate: "2026-12-10T00:00:00.000Z",
  },
];

// 4. Workout Sessions
export const mockSessions: WorkoutSession[] = [
  {
    _id: "670c1a333333333333333301",
    planId: "670c1a222222222222222201",
    name: "Upper A - Chest & Back Focus",
    scheduledDate: "2026-11-06T08:00:00.000Z",
    completedDate: "2026-11-06T09:15:00.000Z",
    status: "completed",
  },
  {
    _id: "670c1a333333333333333302",
    planId: "670c1a222222222222222201",
    name: "Lower A - Quads & Core",
    scheduledDate: "2026-11-08T08:00:00.000Z",
    completedDate: "2026-11-08T09:20:00.000Z",
    status: "completed",
  },
  {
    _id: "670c1a333333333333333303",
    planId: "670c1a222222222222222201",
    name: "Upper B - Shoulders & Arms",
    scheduledDate: "2026-11-10T08:00:00.000Z",
    completedDate: "2026-11-10T09:10:00.000Z",
    status: "completed",
  },
  {
    _id: "670c1a333333333333333305",
    planId: "670c1a222222222222222201",
    name: "Lower B - Hamstrings & Calves",
    scheduledDate: "2026-11-13T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333306",
    planId: "670c1a222222222222222202",
    name: "Push Day - Chest, Shoulders & Triceps",
    scheduledDate: "2026-11-14T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333307",
    planId: "670c1a222222222222222202",
    name: "Pull Day - Back & Biceps",
    scheduledDate: "2026-11-16T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333308",
    planId: "670c1a222222222222222203",
    name: "Full Body - Foundation",
    scheduledDate: "2026-10-05T08:00:00.000Z",
    completedDate: "2026-10-05T09:00:00.000Z",
    status: "completed",
  },
  {
    _id: "670c1a333333333333333309",
    planId: "670c1a222222222222222204",
    name: "Metabolic Circuit A - Full Body",
    scheduledDate: "2026-11-13T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333310",
    planId: "670c1a222222222222222204",
    name: "Lower Body & Core Shred",
    scheduledDate: "2026-11-15T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333311",
    planId: "670c1a222222222222222205",
    name: "Upper High-Rep Superset",
    scheduledDate: "2026-11-14T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333312",
    planId: "670c1a222222222222222207",
    name: "Heavy Squat & Bench Press 5x5",
    scheduledDate: "2026-11-13T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333313",
    planId: "670c1a222222222222222207",
    name: "Deadlift & Overhead Press 5x5",
    scheduledDate: "2026-11-15T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333314",
    planId: "670c1a222222222222222208",
    name: "Heavy Lower & Posterior Chain",
    scheduledDate: "2026-11-14T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333315",
    planId: "670c1a222222222222222210",
    name: "Full Body Balance - Session A",
    scheduledDate: "2026-11-13T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333316",
    planId: "670c1a222222222222222210",
    name: "Full Body Balance - Session B",
    scheduledDate: "2026-11-15T08:00:00.000Z",
    completedDate: null,
    status: "pending",
  },
  {
    _id: "670c1a333333333333333317",
    planId: "670c1a222222222222222211",
    name: "Upper Aesthetic & Core Tone",
    scheduledDate: "2026-11-14T08:00:00.000Z",
    completedDate: null,
    status: "pending",
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
