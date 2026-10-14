import React, { useEffect, useRef, useState } from "react";
import { YStack, ScrollView } from "tamagui";
import { Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useDispatch } from "react-redux";
import { BaseText } from "../components/BaseText";
import { BottomNav, TopHeader } from "../components";
import { TodaySessionSection } from "../components/home/TodaySessionSection";
import { PlanSection } from "../components/home/PlanSection";
import { ExerciseSection } from "../components/home/ExerciseSection";
import { RecentLogsSection } from "../components/home/RecentLogsSection";
import { ProfileOverview } from "../components/home/ProfileOverview";
import {
  HomeDetail,
  HomeDetailModal,
} from "../components/home/HomeDetailModal";
import { formatDate, SectionHeading, ui } from "../components/home/homeUi";
import { HomeData, Session } from "../components/home/types";
import {
  mockProfile,
  mockPlans,
  mockSessions,
  mockExercises,
  MOCK_LOGS,
} from "../components/home/mockData";
import { startWorkout } from "../store/slices/workoutSlice";
import axiosClient from "../api/axiosClient";
import { Exercise } from "../types";

const defaultHomeData: HomeData = {
  profile: mockProfile,
  plans: mockPlans,
  sessions: mockSessions,
  exercises: mockExercises,
  logs: MOCK_LOGS,
};

export default function HomeScreen({
  data: initialData,
  now = new Date(),
}: {
  data?: HomeData;
  now?: Date;
}) {
  const dispatch = useDispatch();
  const scroll = useRef<any>(null);
  const positions = useRef<Record<string, number>>({ home: 0 });
  const [activeTab, setActiveTab] = useState("home");
  const [detail, setDetail] = useState<HomeDetail | null>(null);
  const [homeData, setHomeData] = useState<HomeData>(
    initialData ?? defaultHomeData,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Gọi API backend với fallback an toàn
        // axiosClient đã unwrap response.data ở response interceptor
        const res: unknown = await axiosClient.get("/exercises");
        // Kiểm tra an toàn: API trả về mảng trực tiếp hoặc { data: [...] }
        let fetchedExercises: Exercise[] | null = null;
        if (Array.isArray(res)) {
          fetchedExercises = res as Exercise[];
        } else if (
          res &&
          typeof res === "object" &&
          "data" in res &&
          Array.isArray((res as { data: unknown }).data)
        ) {
          fetchedExercises = (res as { data: Exercise[] }).data;
        }

        if (isMounted && fetchedExercises && fetchedExercises.length > 0) {
          setHomeData((prev) => ({
            ...prev,
            exercises: fetchedExercises!,
          }));
        }
      } catch (err) {
        // Fallback an toàn về mockData khi offline hoặc lỗi API
        console.log("Using local mock exercises fallback:", err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartWorkout = (session: Session) => {
    // Redux Handoff chuẩn bị dữ liệu cho màn hình SessionScreen của Trung
    dispatch(
      startWorkout({
        planId: session.planId,
        sessionId: session._id,
      }),
    );

    Alert.alert(
      "Bắt đầu buổi tập",
      `Đã kích hoạt buổi tập: "${session.name}"\n(Session ID: ${session._id} đã sẵn sàng trong Redux store)`,
      [{ text: "OK" }],
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="light" />
      <TopHeader
        subtitle="Chào bạn, hôm nay cùng tiến bộ!"
        onProfilePress={() =>
          setDetail({
            label: "HỒ SƠ TẬP LUYỆN",
            title: homeData.profile.goal,
            lines: [
              `Trình độ: ${homeData.profile.level}`,
              `Mục tiêu: ${homeData.profile.trainingDaysPerWeek} buổi / tuần`,
            ],
          })
        }
      />

      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
        }}>
        <BaseText {...ui.label} marginTop="$5">
          {now
            .toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .toUpperCase()}
        </BaseText>

        <ProfileOverview profile={homeData.profile} />

        <SectionHeading title="Buổi tập hôm nay" />
        <TodaySessionSection
          sessions={homeData.sessions}
          now={now}
          onStartSession={handleStartWorkout}
          onSessionPress={(session) =>
            setDetail({
              label: "LỊCH TẬP",
              title: session.name,
              lines: [
                `Ngày tập: ${formatDate(session.scheduledDate)}`,
                `Chương trình: ${
                  homeData.plans.find((p) => p._id === session.planId)?.name ??
                  "Chưa có thông tin"
                }`,
                "Chi tiết bài tập của buổi này chưa có trong dữ liệu hiện tại.",
              ],
            })
          }
        />

        <YStack
          onLayout={(event) => {
            positions.current.plan = event.nativeEvent.layout.y;
          }}>
          <SectionHeading
            title="Chương trình của bạn"
            count={homeData.plans.length}
          />
          <PlanSection
            plans={homeData.plans}
            sessions={homeData.sessions}
            onPlanPress={(plan) => {
              const sessions = homeData.sessions.filter(
                (session) => session.planId === plan._id,
              );
              setDetail({
                label: plan.generatedByAI
                  ? "CHƯƠNG TRÌNH AI"
                  : "CHƯƠNG TRÌNH TỰ TẠO",
                title: plan.name,
                lines: sessions.length
                  ? sessions.map(
                      (session) =>
                        `${formatDate(session.scheduledDate)} · ${session.name}`,
                    )
                  : ["Chưa có buổi tập trong chương trình này."],
              });
            }}
          />
        </YStack>

        <SectionHeading
          title="Thư viện bài tập"
          count={homeData.exercises.length}
        />
        <ExerciseSection
          exercises={homeData.exercises}
          onExercisePress={(exercise) =>
            setDetail({
              label: "THƯ VIỆN BÀI TẬP",
              title: exercise.name,
              lines: [
                `Nhóm cơ: ${exercise.muscleGroup}`,
                `Dụng cụ: ${exercise.equipmentRequired}`,
                exercise.description
                  ? `Mô tả: ${exercise.description}`
                  : "Hướng dẫn kỹ thuật đang được cập nhật.",
              ],
            })
          }
        />

        <YStack
          onLayout={(event) => {
            positions.current.history = event.nativeEvent.layout.y;
          }}>
          <SectionHeading
            title="Nhật ký gần đây"
            count={homeData.logs.length}
          />
          <RecentLogsSection logs={homeData.logs} />
        </YStack>
      </ScrollView>

      <BottomNav
        tabs={[
          { id: "home", icon: "home", label: "Home" },
          { id: "plan", icon: "calendar", label: "Lịch tập" },
          { id: "history", icon: "clock", label: "Nhật ký" },
        ]}
        activeTabId={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          scroll.current?.scrollTo({
            y: positions.current[tab] ?? 0,
            animated: true,
          });
        }}
      />

      <HomeDetailModal detail={detail} onClose={() => setDetail(null)} />
    </YStack>
  );
}
