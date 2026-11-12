import React, { useEffect, useState, useMemo } from "react";
import { ScrollView } from "react-native";
import { YStack, XStack, Text, Image, Spinner } from "tamagui";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise, ExerciseHistoryLog } from "../types";
import { getExerciseById } from "../services/exerciseService";
import { getLogsByExercise } from "../services/logService";
import { TopHeader } from "../components";

type ParamList = {
  ExerciseDetail: {
    exerciseId: string;
    exercise?: Exercise;
  };
};

export default function ExerciseDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, "ExerciseDetail">>();
  const { exerciseId, exercise: initialExercise } = route.params;

  const [exercise, setExercise] = useState<Exercise | null>(
    initialExercise || null,
  );
  const [logs, setLogs] = useState<ExerciseHistoryLog[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialExercise);
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      try {
        // Luôn gọi getExerciseById để đảm bảo lấy mảng images mới nhất từ MongoDB
        const [exData, logData] = await Promise.all([
          getExerciseById(exerciseId).catch(() => initialExercise || null),
          getLogsByExercise(exerciseId).catch(() => []),
        ]);

        if (isMounted) {
          if (exData) {
            setExercise(exData);
            setImgError(false);
          }
          setLogs(Array.isArray(logData) ? logData : []);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết bài tập:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [exerciseId, initialExercise]);

  const images = useMemo(() => exercise?.images || [], [exercise?.images]);

  // Hiệu ứng chuyển pha mượt mà giữa 2 tư thế mỗi 850ms
  useEffect(() => {
    if (images.length < 2 || imgError) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % images.length);
    }, 850);
    return () => clearInterval(interval);
  }, [images.length, imgError]);

  // Tính toán Personal Best (Mức tạ cao nhất & Tổng số hiệp đã tập)
  const stats = useMemo(() => {
    let maxWeight = 0;
    let totalCompletedSets = 0;

    logs.forEach((log) => {
      log.sets?.forEach((s) => {
        if (s.isCompleted) {
          totalCompletedSets += 1;
          if (s.weight > maxWeight) maxWeight = s.weight;
        }
      });
    });

    return { maxWeight, totalCompletedSets };
  }, [logs]);

  if (loading) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center">
        <Spinner size="large" color="$primary" />
      </YStack>
    );
  }

  if (!exercise) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <TopHeader
          title="Chi tiết bài tập"
          onBack={() => navigation.goBack()}
        />
        <YStack
          flex={1}
          padding="$4"
          justifyContent="center"
          alignItems="center"
          gap="$3">
          <Text color="$textPrimary" fontSize="$5" fontWeight="700">
            Không tìm thấy thông tin bài tập
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* TopHeader chuẩn đồng bộ SafeArea và thiết kế toàn app */}
      <TopHeader
        title={exercise.name}
        subtitle={`${exercise.muscleGroup} • ${exercise.equipmentRequired || "Cơ bản"}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <YStack gap="$4">
          {/* 1. Khung Minh Họa Động Tác (Xếp chồng 2 khung hình) */}
          <YStack
            backgroundColor="$white"
            borderRadius="$4"
            overflow="hidden"
            borderWidth={1}
            borderColor="$borderColor"
            height={230}
            justifyContent="center"
            alignItems="center"
            position="relative">
            {images.length > 0 && !imgError ? (
              <>
                {images.map((uri, idx) => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    width="100%"
                    height="100%"
                    resizeMode="contain"
                    opacity={frameIndex === idx ? 1 : 0}
                    onError={() => setImgError(true)}
                  />
                ))}
                {images.length > 1 && (
                  <XStack
                    position="absolute"
                    bottom="$2.5"
                    right="$2.5"
                    backgroundColor="rgba(0,0,0,0.65)"
                    paddingHorizontal="$2.5"
                    paddingVertical="$1"
                    borderRadius="$pill">
                    <Text color="$white" fontSize="$1" fontWeight="600">
                      {frameIndex === 0 ? "Tư thế chuẩn bị" : "Tư thế phát lực"}
                    </Text>
                  </XStack>
                )}
              </>
            ) : (
              <YStack alignItems="center" gap="$2" padding="$4">
                <Ionicons name="barbell-outline" size={40} color="#6B7280" />
                <Text color="$textSecondary" fontSize="$3" textAlign="center">
                  Minh họa động tác đang cập nhật hoặc thiết bị ngoại tuyến
                </Text>
              </YStack>
            )}
          </YStack>

          {/* 2. Mức tập khuyến nghị */}
          <XStack
            backgroundColor="$surfaceBg"
            padding="$3.5"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            alignItems="center"
            gap="$3">
            <Ionicons name="flame-outline" size={22} color="#EA580C" />
            <YStack flex={1} gap="$1">
              <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                MỨC TẬP KHUYẾN NGHỊ
              </Text>
              <Text color="$textPrimary" fontSize="$4" fontWeight="700">
                {exercise.recommendedSetsReps ||
                  "3 - 4 sets • 8 - 12 reps • Nghỉ 60s"}
              </Text>
            </YStack>
          </XStack>

          {/* 3. Thành tích cá nhân (Personal Best) */}
          <YStack
            backgroundColor="$surfaceBg"
            padding="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$3">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="trophy-outline" size={18} color="#EA580C" />
              <Text color="$textPrimary" fontSize="$4" fontWeight="700">
                Thành tích cá nhân của bạn
              </Text>
            </XStack>

            <XStack gap="$3">
              <YStack
                flex={1}
                backgroundColor="$background"
                padding="$3"
                borderRadius="$3"
                gap="$1">
                <Text color="$textSecondary" fontSize="$2">
                  Mức tạ cao nhất
                </Text>
                <Text color="$primary" fontSize="$6" fontWeight="800">
                  {stats.maxWeight > 0 ? `${stats.maxWeight} kg` : "--"}
                </Text>
              </YStack>
              <YStack
                flex={1}
                backgroundColor="$background"
                padding="$3"
                borderRadius="$3"
                gap="$1">
                <Text color="$textSecondary" fontSize="$2">
                  Tổng số hiệp đã tập
                </Text>
                <Text color="$textPrimary" fontSize="$6" fontWeight="800">
                  {stats.totalCompletedSets}
                </Text>
              </YStack>
            </XStack>
          </YStack>

          {/* 4. Hướng dẫn kỹ thuật từng bước */}
          <YStack
            backgroundColor="$surfaceBg"
            padding="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$3">
            <XStack alignItems="center" gap="$2">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#EA580C"
              />
              <Text color="$textPrimary" fontSize="$4" fontWeight="700">
                Hướng dẫn kỹ thuật
              </Text>
            </XStack>

            {exercise.description ? (
              <Text color="$textSecondary" fontSize="$3" lineHeight={20}>
                {exercise.description}
              </Text>
            ) : null}

            {exercise.instructions && exercise.instructions.length > 0 && (
              <YStack gap="$2.5" marginTop="$1">
                {exercise.instructions.map((step, index) => (
                  <XStack key={index} gap="$2.5" alignItems="flex-start">
                    <YStack
                      width={22}
                      height={22}
                      borderRadius={11}
                      backgroundColor="$primary"
                      justifyContent="center"
                      alignItems="center"
                      marginTop={2}>
                      <Text color="$white" fontSize="$2" fontWeight="700">
                        {index + 1}
                      </Text>
                    </YStack>
                    <Text
                      flex={1}
                      color="$textPrimary"
                      fontSize="$3"
                      lineHeight={20}>
                      {step.replace(/^Step:\d+\s*/i, "")}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
