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

// 2. Thư viện bài tập: Đầy đủ các bài tập xuất hiện trên UI với _id 24-hex chuẩn ObjectId
export const mockExercises: Exercise[] = [
  {
    _id: "6abc93738a6b7b585e251481",
    name: "Barbell Bench Press",
    muscleGroup: "Ngực",
    equipmentRequired: "Barbell",
    description: "Nằm ghế đẩy tạ đòn phát triển ngực",
  },
  {
    _id: "6abc93738a6b7b585e251482",
    name: "Squat",
    muscleGroup: "Chân",
    equipmentRequired: "Barbell",
    description: "Gánh tạ đòn phát triển cơ đùi và mông",
  },
  {
    _id: "6abc93738a6b7b585e251483",
    name: "Deadlift",
    muscleGroup: "Lưng",
    equipmentRequired: "Barbell",
    description: "Kéo tạ đòn phát triển chuỗi cơ sau",
  },
  {
    _id: "6abc93738a6b7b585e251484",
    name: "Pull-up",
    muscleGroup: "Lưng",
    equipmentRequired: "Bodyweight",
    description: "Hít xà đơn phát triển lưng xô và tay trước",
  },
  {
    _id: "6abc93738a6b7b585e251485",
    name: "Push-up",
    muscleGroup: "Ngực",
    equipmentRequired: "Bodyweight",
    description: "Chống đẩy phát triển cơ ngực và tay sau",
  },
  {
    _id: "6abc93738a6b7b585e251486",
    name: "Muscle-up",
    muscleGroup: "Toàn thân",
    equipmentRequired: "Bodyweight",
    description: "Kéo xà lên đè xà toàn thân",
  },
  {
    _id: "6abc93738a6b7b585e251487",
    name: "Dumbbell Curl",
    muscleGroup: "Tay trước",
    equipmentRequired: "Dumbbell",
    description: "Cuốn tạ đơn phát triển bắp tay trước",
  },
];

// 3. Workout Plans: 2 chương trình trỏ profileId vào mockProfile._id
export const mockPlans: WorkoutPlan[] = [
  {
    _id: DEFAULT_PLAN_ID,
    profileId: DEFAULT_PROFILE_ID,
    name: "Calisthenics Fundamentals",
    generatedByAI: true,
    status: "active",
    startDate: "2026-10-01T00:00:00.000Z",
    endDate: "2026-11-01T00:00:00.000Z",
  },
  {
    _id: "670c1a222222222222222202",
    profileId: DEFAULT_PROFILE_ID,
    name: "Upper Body Strength",
    generatedByAI: false,
    status: "active",
    startDate: "2026-10-05T00:00:00.000Z",
    endDate: "2026-11-05T00:00:00.000Z",
  },
];

// 4. Workout Sessions: Trỏ planId vào mockPlans[0]._id
export const mockSessions: WorkoutSession[] = [
  {
    _id: DEFAULT_SESSION_ID,
    planId: DEFAULT_PLAN_ID,
    name: "Ngực & Tay Sau",
    scheduledDate: new Date().toISOString(),
    status: "pending",
  },
  {
    _id: "670c1a333333333333333302",
    planId: DEFAULT_PLAN_ID,
    name: "Lưng & Tay Trước",
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "pending",
  },
  {
    _id: "670c1a333333333333333303",
    planId: DEFAULT_PLAN_ID,
    name: "Chân & Bụng",
    scheduledDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: "pending",
  },
];

// 5. Workout Logs: Lịch sử tập luyện trỏ đúng sessionId và exerciseId
export const MOCK_LOGS: WorkoutLog[] = [
  {
    _id: "670c1a444444444444444401",
    sessionId: DEFAULT_SESSION_ID,
    exerciseId: {
      _id: "6abc93738a6b7b585e251485",
      name: "Push-up",
      muscleGroup: "Ngực",
    },
    sets: [
      { setId: "set_1", reps: 12, weight: 0, isCompleted: true },
      { setId: "set_2", reps: 10, weight: 0, isCompleted: true },
      { setId: "set_3", reps: 8, weight: 0, isCompleted: true },
    ],
    notes: "Hoàn thành tốt các hiệp Push-up bodyweight",
    createdAt: "2026-10-05T08:00:00.000Z",
  },
  {
    _id: "670c1a444444444444444402",
    sessionId: DEFAULT_SESSION_ID,
    exerciseId: {
      _id: "6abc93738a6b7b585e251481",
      name: "Barbell Bench Press",
      muscleGroup: "Ngực",
    },
    sets: [
      { setId: "set_1", reps: 8, weight: 40, isCompleted: true },
      { setId: "set_2", reps: 8, weight: 40, isCompleted: true },
      { setId: "set_3", reps: 8, weight: 40, isCompleted: true },
      { setId: "set_4", reps: 6, weight: 40, isCompleted: true },
    ],
    notes: "Đẩy ngực tạ đòn ổn định, chú ý ép bả vai",
    createdAt: "2026-10-03T08:00:00.000Z",
  },
  {
    _id: "670c1a444444444444444403",
    sessionId: "670c1a333333333333333302",
    exerciseId: {
      _id: "6abc93738a6b7b585e251484",
      name: "Pull-up",
      muscleGroup: "Lưng",
    },
    sets: [
      { setId: "set_1", reps: 10, weight: 0, isCompleted: true },
      { setId: "set_2", reps: 8, weight: 0, isCompleted: true },
      { setId: "set_3", reps: 6, weight: 0, isCompleted: true },
    ],
    notes: "Hít xà phát triển lưng xô, kéo cằm qua xà",
    createdAt: "2026-10-02T09:00:00.000Z",
  },
  {
    _id: "670c1a444444444444444404",
    sessionId: "670c1a333333333333333302",
    exerciseId: {
      _id: "6abc93738a6b7b585e251487",
      name: "Dumbbell Curl",
      muscleGroup: "Tay trước",
    },
    sets: [
      { setId: "set_1", reps: 12, weight: 12, isCompleted: true },
      { setId: "set_2", reps: 10, weight: 12, isCompleted: true },
      { setId: "set_3", reps: 10, weight: 12, isCompleted: true },
    ],
    notes: "Cuốn tạ tay trước chuẩn form, siết đỉnh 1 giây",
    createdAt: "2026-10-02T09:30:00.000Z",
  },
];

// Alias và bộ dữ liệu mặc định xuất ra dùng chung
export const mockLogs = MOCK_LOGS;

export const defaultHomeData: HomeData = {
  profile: mockProfile,
  plans: mockPlans,
  sessions: mockSessions,
  exercises: mockExercises,
  logs: MOCK_LOGS,
};
