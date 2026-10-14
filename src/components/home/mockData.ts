import { Profile, WorkoutPlan, WorkoutSession, Exercise, WorkoutLog } from "./types";

export const mockProfile: Profile = {
  _id: "670c1a111111111111111101",
  userId: "user_2test1234567890abcdef",
  goal: "Tăng cơ",
  level: "Beginner",
  trainingDaysPerWeek: 4,
};

export const mockPlans: WorkoutPlan[] = [
  {
    _id: "670c1a222222222222222201",
    profileId: "670c1a111111111111111101",
    name: "Calisthenics Fundamentals",
    generatedByAI: true,
    status: "active",
  },
  {
    _id: "670c1a222222222222222202",
    profileId: "670c1a111111111111111101",
    name: "Upper Body Strength",
    generatedByAI: false,
    status: "active",
  },
];

export const mockSessions: WorkoutSession[] = [
  {
    _id: "670c1a333333333333333301",
    planId: "670c1a222222222222222201",
    name: "Ngực & Tay Sau",
    scheduledDate: new Date().toISOString(),
    status: "pending",
  },
  {
    _id: "670c1a333333333333333302",
    planId: "670c1a222222222222222201",
    name: "Lưng & Tay Trước",
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "pending",
  },
];

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

export const MOCK_LOGS: WorkoutLog[] = [
  {
    _id: "670c1a444444444444444401",
    sessionId: "670c1a333333333333333301",
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
    createdAt: "2026-10-05T08:00:00.000Z",
  },
  {
    _id: "670c1a444444444444444402",
    sessionId: "670c1a333333333333333301",
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
    createdAt: "2026-10-03T08:00:00.000Z",
  },
];
