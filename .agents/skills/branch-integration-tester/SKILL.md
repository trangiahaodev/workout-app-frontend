---
name: branch-integration-tester
description: Simulate merging member branches (dev-hong-anh, dev-duc-trung, dev-anh-tuan, dev-vy) into dev, detect Git conflicts, and strictly validate Frontend code against Mongoose Schemas and Express Controllers.
---

# SKILL: BRANCH INTEGRATION & MONGOOSE CONTRACT TESTER

## 1. ROLE & OBJECTIVE

You are the Lead Integration Engineer AI assisting Tech Lead **Gia Hảo** (`dev-gia-hao`).
Your job is to simulate merging member branches (`dev-hong-anh`, `dev-duc-trung`, `dev-anh-tuan`, `dev-vy`) into `dev`, catch Git conflicts, and verify that all Frontend props, Redux states, and Axios payloads strictly match the Mongoose Models and Backend Controllers.

## 2. MONGOOSE SCHEMAS & CONTROLLERS (GROUND TRUTH)

1. **`Profile.js` & `profileController.js`**:
   - Fields: `_id` (ObjectId), `userId` (String, unique), `goal` (enum: `["Tăng cơ", "Giảm mỡ", "Sức mạnh", "Giữ dáng, giữ cân"]`), `level` (enum: `["Beginner", "Intermediate", "Advanced"]`), `trainingDaysPerWeek` (Number).
   - Endpoints: `getProfile` (`req.params.userId`), `upsertProfile` (`req.body.userId`).

2. **`WorkoutPlan.js` & `planController.js`**:
   - Fields: `_id` (ObjectId), `profileId` (ObjectId -> Profile), `name` (String, required), `generatedByAI` (Boolean), `status` (enum: `["active", "completed", "abandoned"]`), `startDate`, `endDate`.
   - ⚠️ **UI Mapping Trap:** `WorkoutPlan` uses `.name`, whereas `ProgramCard.tsx` expects `title`. Frontend MUST map `title={plan.name}`.
   - Endpoints: `getPlansByProfile` (`req.params.profileId`).

3. **`WorkoutSession.js` & `sessionController.js`**:
   - Fields: `_id` (ObjectId), `planId` (ObjectId -> WorkoutPlan), `name` (String, e.g., "Ngực - Tay sau"), `scheduledDate` (Date, required), `completedDate` (Date), `status` (enum: `["pending", "completed", "skipped"]`).
   - ⚠️ **Architecture Note:** `WorkoutSession` does NOT embed an array of exercises. Exercises must be fetched from `Exercise` API.
   - Endpoints: `getSessionsByPlan` (`req.params.planId`), `createSession` (`req.body`).

4. **`Exercise.js` & `exerciseController.js`**:
   - Fields: `_id` (ObjectId), `name` (String, unique), `muscleGroup` (String), `description` (String), `equipmentRequired` (String).
   - Endpoints: `getExercises` (returns all exercises), `getExerciseById` (`req.params.id`).

5. **`WorkoutLog.js` & `logController.js` (CRITICAL CONTRACT)**:
   - Fields:
     - `sessionId`: `ObjectId` (ref `WorkoutSession`, required) — MUST be a valid 24-hex MongoDB `_id`, NOT a mock string like `"session_1"`.
     - `exerciseId`: `ObjectId` (ref `Exercise`, required) — MUST be a valid 24-hex MongoDB `_id`.
     - `sets`: Array of `{ reps: Number, weight: Number, isCompleted: Boolean }`.
     - ⚠️ **Field Name Trap:** Mongoose schema uses **`isCompleted`** (Boolean), whereas early Redux drafts used `completed`. Payloads sent to `saveLog` MUST include `isCompleted`.
   - Endpoints:
     - `saveLog` (POST): Expects `{ sessionId, exerciseId, sets, notes?, progressPhotoUrl? }` for ONE exercise per call.
     - `getLogsBySession` (GET): Expects `req.params.sessionId`. Uses `.populate("exerciseId", "name muscleGroup")`.

---

## 3. EXECUTION WORKFLOW

### STEP 1: SANDBOX MERGE SIMULATION

1. Run `git fetch --all`.
2. Checkout `dev` and pull latest: `git checkout dev && git pull origin dev`.
3. Create sandbox branch: `git checkout -b temp/integration-check`.
4. Merge target branch without committing: `git merge origin/<branch-name> --no-commit --no-ff`.
   - Report any Git conflicts immediately and verify that core config files (`tamagui.config.ts`, `src/api/axiosClient.ts`, `src/store/index.ts`) are intact.

### STEP 2: MEMBER-SPECIFIC CONTRACT AUDIT

Inspect `git diff --cached` and audit based on the branch being merged:

- **When auditing `dev-hong-anh` (Ánh - HomeScreen):**
  1. Check API call: Does it pass `profileId` to fetch plans, or how does it fetch `WorkoutPlan` / `WorkoutSession` / `Exercise`?
  2. Check `axiosClient` usage: Ensure no double `.data` (`res.data`) since `axiosClient` interceptor already returns `response.data`.
  3. Check `ProgramCard` mapping: Does it map MongoDB's `plan.name` (or `session.name`) to `ProgramCard`'s `title` prop?
  4. Check Navigation & Redux handoff: When pressing a card or starting a workout, does it pass valid MongoDB `_id` values (`planId` / `sessionId`) to Redux `startWorkout` or route params for Trung's screen?

- **When auditing `dev-duc-trung` (Trung - SessionScreen):**
  1. How does the screen get the list of exercises (`_id`, `name`, `muscleGroup`)?
  2. When dispatching `logSet({ exerciseId, setLog })`, is `exerciseId` the real MongoDB `exercise._id`?
  3. Are `reps` and `weight` converted from `TextInput` strings to `Number` before dispatching?

- **When auditing `dev-anh-tuan` (Anh Tuấn - Network & HistoryScreen):**
  1. Does the submit service loop over `Object.entries(state.workout.logs)` and map `completed` -> `isCompleted` inside `sets` before calling `saveLog`?
  2. Does it send a valid 24-hex `sessionId` and `exerciseId`?
  3. In `HistoryScreen`, does it render `log.exerciseId.name` and `log.exerciseId.muscleGroup` properly from the populated `getLogsBySession` response?

### STEP 3: STATIC ANALYSIS & LINT

1. Check for forbidden UI imports (raw React Native `View`, `Text`, `StyleSheet`, or Tamagui `space` prop).
2. Run `npx tsc --noEmit`.
3. Run `npx expo lint`.

### STEP 4: CLEANUP & VIETNAMESE REPORT

1. Abort/reset sandbox and return to `dev`: `git merge --abort || git reset --hard`, `git checkout dev`, `git branch -D temp/integration-check`.
2. Present a clear report in Vietnamese to **Gia Hảo**:
   - **🟢/🔴 Trạng thái tích hợp:** (Sẵn sàng Merge / Chặn).
   - **🔍 Phân tích Data Contract (Mongoose vs Frontend):** Chỉ rõ lệch trường nào (`name` vs `title`, `completed` vs `isCompleted`, thiếu `ObjectId`, dư `.data`...).
   - **🛠️ Code Fix Đề Xuất:** Viết sẵn đoạn code patch để Hảo xử lý ngay.
