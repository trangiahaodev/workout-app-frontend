# Workout App System - AI Context

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Project Overview

Ứng dụng di động theo dõi và thực thi lịch trình tập luyện thể hình / Calisthenics (Thenx-inspired UI).

- Architecture: Client-Server (Mobile Frontend Repository)[cite: 6]
- Framework: React Native + Expo (SDK 54)
- Language: TypeScript
- UI / Design System: Tamagui (v2.7.7) - Sleek Dark Mode (`#0A0A0A` bg, `#1E90FF` primary)
- State Management: Redux Toolkit + React-Redux
- Navigation: React Navigation (`@react-navigation/native`, screens in `src/screens/`)
- HTTP Client: Axios (`src/api/axiosClient.ts`)
- Backend API: Node.js + Express + MongoDB (`https://workout-app-backend-1hjq.onrender.com/api/v1`)

---

## Architecture & Data Flow

Screen / UI Component (`src/screens/`, `src/components/`)[cite: 6]
↓ Dispatch / Selector
Redux Store (`src/store/slices/workoutSlice.ts`)[cite: 6]
↓ Typed Payload / Data Contract
API Service Layer (`src/api/`)[cite: 6]
↓ HTTP JSON (`axiosClient`)[cite: 6]
Backend REST API (Render) ➔ MongoDB Atlas[cite: 6]

### 1. Screen & UI Components (`src/screens/`, `src/components/`)

- BẮT BUỘC sử dụng các component của Tamagui (`XStack`, `YStack`, `Text`, `styled`) và hệ thống Design Token (`$primary`, `$background`, `$cardBg`, `$borderColor`).
- Sử dụng thuộc tính `gap="$1"`, `gap="$2"` để căn khoảng cách. TUYỆT ĐỐI KHÔNG dùng thuộc tính `space` (đã deprecated).
- TUYỆT ĐỐI KHÔNG sử dụng `<View>`, `<Text>`, `StyleSheet` thuần của React Native.
- Ưu tiên tái sử dụng các component đã xây dựng sẵn trong `src/components/`: `PrimaryButton`, `ProgramCard`, `Card`, `BaseText`, `TopHeader`, `BottomNav`.
- KHÔNG viết trực tiếp cấu hình Axios hoặc logic biến đổi dữ liệu phức tạp ngay trong file giao diện[cite: 6].

### 2. State Management - Redux (`src/store/`)

- `workoutSlice` quản lý trạng thái phiên tập đang diễn ra (`isActive`, `planId`, `logs`).
- Mọi thao tác đọc/ghi state trong component phải đi qua kiểu `RootState` và `AppDispatch`.

### 3. Workout Session State (Session Rule)

- Trạng thái buổi tập đang diễn ra (số Reps, mức tạ Kg, tích hoàn thành từng Set) ĐƯỢC LƯU TẠM THỜI trong Redux Store (`workoutSlice`)[cite: 6].
- TUYỆT ĐỐI KHÔNG gọi API lưu xuống Database mỗi khi người dùng bấm tick 1 set[cite: 6]. Chỉ gom toàn bộ `logs` trong Redux và gửi xuống Database một lần duy nhất khi kết thúc buổi tập ("Complete Workout" ➔ `POST /logs`)[cite: 6].

### 4. API Service Layer (`src/api/`)

- Giao tiếp với Backend bắt buộc phải thông qua `axiosClient`.
- Lưu ý quan trọng: `axiosClient` đã cấu hình response interceptor trả về trực tiếp `response.data`. Khi gọi API, không cần truy cập `.data` thêm lần nữa.

---

## Expo & CLI Rules (SDK 54)

### Expo has changed — do not trust training data blindly

Before writing any code that touches an unfamiliar Expo or React Native API:

1. Read the major version of the `expo` package in `package.json` (SDK 54).
2. Fetch matching docs: `https://docs.expo.dev/versions/v54.0.0/` or `https://docs.expo.dev/llms.txt`.

### Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint check
npx tsc --noEmit            # TypeScript compiler check
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

### Native & Build Guardrails

- If `ios/` and `android/` directories do not exist, never create or edit them by hand — configure native behavior in `app.json`.
- Do NOT use `expo-router` unless explicitly migrated. All screens reside in `src/screens/` and are managed via `@react-navigation/native` in `App.tsx`.

---

## AI Instructions

Before modifying code or merging branches[cite: 6]:

1. Inspect the existing implementation and folder structure[cite: 6].
2. Read relevant rules, skills, and data contracts between team branches (`dev` vs member branches)[cite: 6].
3. Follow existing project conventions (Thenx dark theme tokens, strict TypeScript typing)[cite: 6].
4. Prefer existing abstractions over introducing new ones[cite: 6].
5. Do not introduce new dependencies without justification[cite: 6].
6. **MANDATORY:** Run `npx tsc --noEmit` and `npx expo lint` before declaring any task or merge check done.

Never modify architecture-level files (`tamagui.config.ts`, `src/store/index.ts`, `src/api/axiosClient.ts`) without explicitly explaining the reason[cite: 6].

## Detailed Rules & Skills

Detailed rules and skills are located in[cite: 6]:

- `.agents/rules/common/`[cite: 6]
- `.agents/rules/frontend/`[cite: 6]
- `.agents/skills/`
