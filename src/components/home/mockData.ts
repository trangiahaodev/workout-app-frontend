export const mockProfile = {
  _id: "pf1",
  userId: "u1",
  goal: "Tăng cơ",
  level: "Beginner",
  trainingDaysPerWeek: 4,
};

export const mockPlans = [
  {
    _id: "p1",
    profileId: "pf1",
    name: "Calisthenics Fundamentals",
    generatedByAI: true,
  },
  {
    _id: "p2",
    profileId: "pf1",
    name: "Upper Body Strength",
    generatedByAI: false,
  },
];

export const mockSessions = [
  {
    _id: "s1",
    planId: "p1",
    name: "Ngực & Tay Sau",
    scheduledDate: "2026-10-06T13:24:09.691Z",
  },
  {
    _id: "s2",
    planId: "p1",
    name: "Lưng & Tay Trước",
    scheduledDate: "2026-10-08T13:24:09.691Z",
  },
];

export const mockExercises = [
  {
    _id: "6abc93738a6b7b585e251481",
    name: "Barbell Bench Press",
    muscleGroup: "Ngực",
    equipmentRequired: "Barbell",
  },
  {
    _id: "6abc93738a6b7b585e251482",
    name: "Squat",
    muscleGroup: "Chân",
    equipmentRequired: "Barbell",
  },
  {
    _id: "6abc93738a6b7b585e251483",
    name: "Deadlift",
    muscleGroup: "Lưng",
    equipmentRequired: "Barbell",
  },
  {
    _id: "6abc93738a6b7b585e251484",
    name: "Pull-up",
    muscleGroup: "Lưng",
    equipmentRequired: "Bodyweight",
  },
  {
    _id: "6abc93738a6b7b585e251485",
    name: "Push-up",
    muscleGroup: "Ngực",
    equipmentRequired: "Bodyweight",
  },
  {
    _id: "6abc93738a6b7b585e251486",
    name: "Muscle-up",
    muscleGroup: "Toàn thân",
    equipmentRequired: "Bodyweight",
  },
  {
    _id: "6abc93738a6b7b585e251487",
    name: "Dumbbell Curl",
    muscleGroup: "Tay trước",
    equipmentRequired: "Dumbbell",
  },
];

// Chưa có schema thật của logs, tạm đoán
export const MOCK_LOGS = [
  {
    _id: "l1",
    exercise: "Push-up",
    sets: 3,
    reps: 12,
    weight: 0,
    date: "05/10",
  },
  {
    _id: "l2",
    exercise: "Barbell Bench Press",
    sets: 4,
    reps: 8,
    weight: 40,
    date: "03/10",
  },
];
