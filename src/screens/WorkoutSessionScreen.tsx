import React, { useEffect, useState, useCallback } from "react";
import { Alert, Platform, Vibration } from "react-native";
import { YStack, XStack, ScrollView, Input, Image, useTheme } from "tamagui";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigation,
  useRoute,
  usePreventRemove,
} from "@react-navigation/native";
import { RootState } from "../store";
import { startWorkout, logSet } from "../store/slices/workoutSlice";
import axiosClient from "../api/axiosClient";
import { Card, BaseText, PrimaryButton, TopHeader } from "../components";
import { Exercise, WorkoutSession } from "../types";
import {
  mockExercises,
  mockSessions,
  DEFAULT_PLAN_ID,
  DEFAULT_SESSION_ID,
} from "../components/home/mockData";
import { useCompleteWorkout } from "../hooks/useCompleteWorkout";
import { ExerciseExtras } from "../services/logService";
import {
  WorkoutSessionScreenNavigationProp,
  WorkoutSessionScreenRouteProp,
} from "../navigation/types";

interface Props {
  planId?: string;
  sessionId?: string;
  exercises?: Exercise[];
  onComplete?: () => void;
  onBack?: () => void;
}

const SETS = ["set_1", "set_2", "set_3"];

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (
    res &&
    typeof res === "object" &&
    "data" in res &&
    Array.isArray((res as { data: unknown }).data)
  ) {
    return (res as { data: T[] }).data;
  }
  return [];
}

function resolveSessionExercises(
  session: WorkoutSession | undefined,
  allExercises: Exercise[],
): Exercise[] {
  // 1. Ưu tiên lấy đúng theo danh sách exercises gắn trong WorkoutSession
  if (session?.exercises && session.exercises.length > 0) {
    const resolved = session.exercises
      .map((item) => {
        if (typeof item === "string") {
          return allExercises.find((ex) => ex._id === item);
        }
        return item;
      })
      .filter((ex): ex is Exercise => Boolean(ex));

    if (resolved.length > 0) return resolved;
  }

  // 2. Fallback thông minh theo tên buổi tập nếu session chưa có mảng exercises
  const name = (session?.name ?? "").toLowerCase();
  if (
    name.includes("lower") ||
    name.includes("hamstring") ||
    name.includes("squat")
  ) {
    const legs = allExercises.filter(
      (ex) =>
        ex.muscleGroup === "Chân" || ex._id === "6abc93738a6b7b585e251503",
    );
    if (legs.length > 0) return legs.slice(0, 4);
  }
  if (name.includes("pull") || name.includes("deadlift")) {
    const pull = allExercises.filter(
      (ex) => ex.muscleGroup === "Lưng" || ex.muscleGroup === "Tay trước",
    );
    if (pull.length > 0) return pull.slice(0, 4);
  }
  if (name.includes("push")) {
    const push = allExercises.filter(
      (ex) =>
        ex.muscleGroup === "Ngực" ||
        ex.muscleGroup === "Vai" ||
        ex.muscleGroup === "Tay sau",
    );
    if (push.length > 0) return push.slice(0, 4);
  }
  if (name.includes("upper")) {
    const upper = allExercises.filter((ex) =>
      ["Ngực", "Lưng", "Vai"].includes(ex.muscleGroup),
    );
    if (upper.length > 0) return upper.slice(0, 4);
  }

  return allExercises.slice(0, 3);
}

export default function WorkoutSessionScreen({
  planId: propPlanId,
  sessionId: propSessionId,
  exercises: propExercises = [],
  onComplete: propOnComplete,
  onBack: propOnBack,
}: Props) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation<WorkoutSessionScreenNavigationProp>();
  const route = useRoute<WorkoutSessionScreenRouteProp>();

  const workoutState = useSelector((state: RootState) => state.workout);
  const { isActive, logs } = workoutState;

  const planId =
    propPlanId ??
    route.params?.planId ??
    workoutState.planId ??
    DEFAULT_PLAN_ID;
  const sessionId =
    propSessionId ??
    route.params?.sessionId ??
    workoutState.sessionId ??
    DEFAULT_SESSION_ID;

  const [list, setList] = useState<Exercise[]>(propExercises);
  const [sessionTitle, setSessionTitle] = useState<string>("Đang tập");
  const [inputs, setInputs] = useState<
    Record<string, { kg: string; reps: string }>
  >({});
  const [current, setCurrent] = useState(0);
  const [restLength, setRestLength] = useState(60);
  const [restLeft, setRestLeft] = useState(0);
  const [extras, setExtras] = useState<ExerciseExtras>({});

  useEffect(() => {
    if (restLeft <= 0) return;
    const timer = setTimeout(() => {
      if (restLeft === 1) {
        Vibration.vibrate([0, 500, 200, 500]);
      }
      setRestLeft(restLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [restLeft]);

  useEffect(() => {
    if (!isActive) {
      dispatch(startWorkout({ planId, sessionId }));
    }

    if (list.length === 0) {
      let isMounted = true;
      Promise.all([
        axiosClient.get("/exercises").catch(() => null),
        axiosClient.get(`/sessions/plan/${planId}`).catch(() => null),
      ])
        .then(([exRes, sessionsRes]) => {
          const fetchedExercises = unwrapList<Exercise>(exRes);
          const fetchedSessions = unwrapList<WorkoutSession>(sessionsRes);

          const allExercises =
            fetchedExercises.length > 0 ? fetchedExercises : mockExercises;
          const allSessions =
            fetchedSessions.length > 0 ? fetchedSessions : mockSessions;

          const activeSession =
            allSessions.find((s) => s._id === sessionId) ??
            mockSessions.find((s) => s._id === sessionId);

          if (isMounted) {
            if (activeSession?.name) {
              setSessionTitle(activeSession.name);
            }
            setList(resolveSessionExercises(activeSession, allExercises));
          }
        })
        .catch((err) => {
          console.error("Lỗi lấy bài tập, sử dụng mock fallback:", err);
          if (isMounted) {
            const fallbackSession = mockSessions.find(
              (s) => s._id === sessionId,
            );
            if (fallbackSession?.name) {
              setSessionTitle(fallbackSession.name);
            }
            setList(resolveSessionExercises(fallbackSession, mockExercises));
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isActive, dispatch, planId, sessionId, list.length]);

  const getSet = useCallback(
    (exId: string, setId: string) => logs[exId]?.find((s) => s.setId === setId),
    [logs],
  );

  const getInput = (exId: string, setId: string) => {
    const saved = getSet(exId, setId);
    return (
      inputs[exId + setId] ?? {
        kg: saved ? String(saved.weight) : "",
        reps: saved ? String(saved.reps) : "",
      }
    );
  };

  const changeInput = (
    exId: string,
    setId: string,
    field: "kg" | "reps",
    value: string,
  ) => {
    setInputs((prev) => ({
      ...prev,
      [exId + setId]: {
        ...getInput(exId, setId),
        [field]: value.replace(/[^0-9.]/g, ""),
      },
    }));
  };

  const toggleSet = (exId: string, setId: string) => {
    const { kg, reps } = getInput(exId, setId);
    const done = getSet(exId, setId)?.isCompleted ?? false;
    if (!done && !Number(reps)) return;
    dispatch(
      logSet({
        exerciseId: exId,
        setLog: {
          setId,
          reps: Number(reps),
          weight: Number(kg) || 0,
          isCompleted: !done,
        },
      }),
    );
    if (!done) {
      setRestLeft(restLength);
    }
  };

  const getExtra = (exId: string) =>
    extras[exId] ?? { notes: "", progressPhotoUrl: "" };

  const changeExtra = (
    exId: string,
    field: "notes" | "progressPhotoUrl",
    value: string,
  ) => {
    setExtras((prev) => ({
      ...prev,
      [exId]: { ...getExtra(exId), [field]: value },
    }));
  };

  const pickPhoto = async (exId: string, fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Chưa có quyền truy cập",
        "Hãy cho phép ứng dụng dùng camera hoặc thư viện ảnh trong Cài đặt.",
      );
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          quality: 0.7,
        });
    if (!result.canceled) {
      changeExtra(exId, "progressPhotoUrl", result.assets[0].uri);
    }
  };

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  const { complete, submitting } = useCompleteWorkout((result) => {
    if (propOnComplete) {
      propOnComplete();
    } else {
      navigation.navigate("History", {
        planId: result.planId ?? planId,
        sessionId: result.sessionId ?? sessionId,
      });
    }
  });

  const handleComplete = async () => {
    try {
      await complete(extras);
    } catch {
      if (propOnComplete) {
        propOnComplete();
      }
    }
  };

  const doneCount = Object.values(logs)
    .flat()
    .filter((s) => s.isCompleted).length;
  const totalSets = list.length * SETS.length;

  usePreventRemove(doneCount > 0, ({ data }) => {
    const leave = () => navigation.dispatch(data.action);
    const message =
      "Buổi tập chưa hoàn thành, các hiệp đã tick sẽ chưa được lưu. Bạn có chắc muốn thoát?";
    if (Platform.OS === "web") {
      if (window.confirm(message)) leave();
      return;
    }
    Alert.alert("Thoát buổi tập?", message, [
      { text: "Ở lại", style: "cancel" },
      { text: "Thoát", style: "destructive", onPress: leave },
    ]);
  });

  const ex = list[current];

  const iconActiveColor = "#FFFFFF";
  const iconInactiveColor = theme.textSecondary?.val ?? "#6E6E73";
  const primaryColor = theme.primary?.val ?? "#EA580C";

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader
        title={sessionTitle}
        subtitle={`${doneCount}/${totalSets} set hoàn thành`}
        onBack={handleBack}
      />

      <YStack height={4} backgroundColor="$borderColor">
        <YStack
          height={4}
          width={`${totalSets ? (doneCount / totalSets) * 100 : 0}%`}
          backgroundColor="$accent"
        />
      </YStack>

      <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        {restLeft > 0 && (
          <Card gap="$2" marginBottom="$3" alignItems="center">
            <BaseText fontSize={12} fontWeight="600" color="$textSecondary">
              Nghỉ giữa hiệp
            </BaseText>
            <BaseText fontSize={44} fontWeight="800" color="$accent">
              {restLeft}s
            </BaseText>
            <PrimaryButton
              title="Bỏ qua"
              variant="secondary"
              onPress={() => setRestLeft(0)}
            />
          </Card>
        )}

        <XStack gap="$2" marginBottom="$3" alignItems="center">
          <BaseText
            flex={1}
            fontSize={12}
            fontWeight="600"
            color="$textSecondary">
            Thời gian nghỉ
          </BaseText>
          {[60, 90].map((sec) => (
            <PrimaryButton
              key={sec}
              title={`${sec}s`}
              width={70}
              size="sm"
              variant={restLength === sec ? "primary" : "secondary"}
              onPress={() => setRestLength(sec)}
            />
          ))}
        </XStack>

        {ex && (
          <Card gap="$3" marginBottom="$3">
            <XStack
              alignItems="flex-start"
              justifyContent="space-between"
              gap="$2">
              <YStack flex={1} gap="$1">
                <BaseText fontSize={12} fontWeight="600" color="$textSecondary">
                  Bài {current + 1}/{list.length}
                </BaseText>
                <BaseText
                  fontSize={22}
                  fontWeight="800"
                  color="$textPrimary"
                  letterSpacing={-0.4}>
                  {ex.name}
                </BaseText>
              </YStack>

              <YStack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="$surfaceSubtle"
                borderWidth={1}
                borderColor="$borderColor"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.75, scale: 0.95 }}
                onPress={() =>
                  navigation.navigate("ExerciseDetail", {
                    exerciseId: ex._id,
                    exercise: ex,
                  })
                }>
                <Feather name="info" size={18} color={primaryColor} />
              </YStack>
            </XStack>

            <XStack gap="$2" paddingHorizontal="$2">
              <BaseText
                width={28}
                fontSize={12}
                fontWeight="600"
                color="$textSecondary">
                Hiệp
              </BaseText>
              <BaseText
                flex={1}
                fontSize={12}
                fontWeight="600"
                color="$textSecondary"
                textAlign="center">
                Kg
              </BaseText>
              <BaseText
                flex={1}
                fontSize={12}
                fontWeight="600"
                color="$textSecondary"
                textAlign="center">
                Reps
              </BaseText>
              <YStack width={40} />
            </XStack>

            {SETS.map((setId, i) => {
              const done = getSet(ex._id, setId)?.isCompleted ?? false;
              const value = getInput(ex._id, setId);
              return (
                <XStack
                  key={setId}
                  gap="$2"
                  padding="$2"
                  borderRadius={12}
                  alignItems="center"
                  backgroundColor={done ? "$surfaceSubtle" : "transparent"}>
                  <YStack
                    width={28}
                    height={28}
                    borderRadius={14}
                    backgroundColor="$surfaceSubtle"
                    borderWidth={1}
                    borderColor="$borderColor"
                    alignItems="center"
                    justifyContent="center">
                    <BaseText
                      fontWeight="700"
                      fontSize={13}
                      color="$textPrimary">
                      {i + 1}
                    </BaseText>
                  </YStack>
                  {(["kg", "reps"] as const).map((field) => (
                    <Input
                      key={field}
                      flex={1}
                      minWidth={0}
                      height={44}
                      paddingHorizontal={0}
                      fontSize={16}
                      fontWeight="700"
                      textAlign="center"
                      color="$textPrimary"
                      placeholder="0"
                      placeholderTextColor="$textTertiary"
                      backgroundColor="$surfaceSubtle"
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius={12}
                      focusStyle={{ borderColor: "$primary" }}
                      keyboardType="numeric"
                      maxLength={field === "kg" ? 5 : 3}
                      disabled={done}
                      value={value[field]}
                      onChangeText={(text) =>
                        changeInput(ex._id, setId, field, text)
                      }
                    />
                  ))}
                  <YStack
                    width={40}
                    height={44}
                    borderRadius={12}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={done ? "$primary" : "$surfaceSubtle"}
                    borderWidth={1}
                    borderColor={done ? "$primary" : "$borderColor"}
                    pressStyle={{ opacity: 0.8, scale: 0.95 }}
                    onPress={() => toggleSet(ex._id, setId)}>
                    <Feather
                      name="check"
                      size={20}
                      color={done ? iconActiveColor : iconInactiveColor}
                    />
                  </YStack>
                </XStack>
              );
            })}

            <Input
              height={80}
              padding="$3"
              fontSize={14}
              color="$textPrimary"
              placeholder="Ghi chú cho bài này..."
              placeholderTextColor="$textTertiary"
              backgroundColor="$surfaceSubtle"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={12}
              focusStyle={{ borderColor: "$primary" }}
              multiline
              textAlignVertical="top"
              value={getExtra(ex._id).notes}
              onChangeText={(text) => changeExtra(ex._id, "notes", text)}
            />
            <XStack gap="$2">
              <PrimaryButton
                flex={1}
                width="auto"
                size="sm"
                variant="secondary"
                title="Chụp ảnh"
                onPress={() => pickPhoto(ex._id, true)}
              />
              <PrimaryButton
                flex={1}
                width="auto"
                size="sm"
                variant="secondary"
                title="Chọn từ thư viện"
                onPress={() => pickPhoto(ex._id, false)}
              />
            </XStack>
            {getExtra(ex._id).progressPhotoUrl !== "" && (
              <Image
                src={getExtra(ex._id).progressPhotoUrl}
                width="100%"
                height={200}
                borderRadius={12}
              />
            )}
          </Card>
        )}

        <XStack gap="$2" marginBottom="$3">
          <PrimaryButton
            flex={1}
            width="auto"
            title="Bài trước"
            variant="secondary"
            disabled={current === 0}
            onPress={() => setCurrent(current - 1)}
          />
          <PrimaryButton
            flex={1}
            width="auto"
            title="Bài tiếp"
            variant="secondary"
            disabled={current >= list.length - 1}
            onPress={() => setCurrent(current + 1)}
          />
        </XStack>

        <PrimaryButton
          title={submitting ? "Đang lưu kết quả..." : "Hoàn thành buổi tập"}
          size="lg"
          variant="primary"
          marginBottom="$8"
          disabled={doneCount === 0 || submitting}
          onPress={handleComplete}
        />
      </ScrollView>
    </YStack>
  );
}
