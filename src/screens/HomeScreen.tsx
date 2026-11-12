import React, { useCallback, useEffect, useRef, useState } from "react";
import { YStack, ScrollView } from "tamagui";
import { StatusBar } from "expo-status-bar";
import { useDispatch } from "react-redux";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { BaseText } from "../components/BaseText";
import { BottomNav, Card, PrimaryButton, TopHeader } from "../components";
import {
  HomeScreenNavigationProp,
  RootStackParamList,
} from "../navigation/types";
import { useProfile } from "../hooks/useProfile";
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
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "Home">>();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    reload,
  } = useProfile();
  const scroll = useRef<any>(null);
  const positions = useRef<Record<string, number>>({ home: 0 });
  const [activeTab, setActiveTab] = useState("home");
  const [detail, setDetail] = useState<HomeDetail | null>(null);
  const [homeData, setHomeData] = useState<HomeData>(
    initialData ?? defaultHomeData,
  );

  // Until the Plan module is integrated, the plan tab targets this section.
  useFocusEffect(
    useCallback(() => {
      const tab = route.params?.tab ?? "home";
      setActiveTab(tab);
      const frame = requestAnimationFrame(() => {
        scroll.current?.scrollTo({
          y: positions.current[tab] ?? 0,
          animated: true,
        });
      });
      return () => cancelAnimationFrame(frame);
    }, [route.params?.tab]),
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
    dispatch(
      startWorkout({
        planId: session.planId,
        sessionId: session._id,
      }),
    );

    // Tự động chuyển hướng sang màn hình WorkoutSessionScreen
    if (navigation?.navigate) {
      navigation.navigate("WorkoutSession", {
        planId: session.planId,
        sessionId: session._id,
      });
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="dark" />
      <TopHeader
        subtitle="Chào bạn, hôm nay cùng tiến bộ!"
        onProfilePress={() => navigation.navigate("Profile")}
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
          {now.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </BaseText>

        {profile ? (
          <ProfileOverview profile={profile} />
        ) : (
          <Card marginTop="$4" gap="$3">
            <BaseText>
              {profileLoading
                ? "Đang tải hồ sơ…"
                : (profileError ?? "Bạn chưa thiết lập hồ sơ tập luyện.")}
            </BaseText>
            {!profileLoading && (
              <PrimaryButton
                title={profileError ? "Thử lại" : "Thiết lập hồ sơ"}
                onPress={() => {
                  if (profileError) void reload();
                  else navigation.navigate("Profile");
                }}
              />
            )}
          </Card>
        )}

        <SectionHeading title="Buổi tập hôm nay" />
        <TodaySessionSection
          sessions={homeData.sessions}
          now={now}
          onStartSession={handleStartWorkout}
          onSessionPress={(session) =>
            setDetail({
              label: "Lịch tập",
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
            if (route.params?.tab === "plan") {
              scroll.current?.scrollTo({
                y: positions.current.plan,
                animated: true,
              });
            }
          }}>
          <SectionHeading title="Chương trình của bạn" />
          <PlanSection
            plans={homeData.plans}
            sessions={homeData.sessions}
            onPlanPress={(plan) => {
              const sessions = homeData.sessions.filter(
                (session) => session.planId === plan._id,
              );
              setDetail({
                label: plan.generatedByAI
                  ? "Chương trình AI"
                  : "Chương trình tự tạo",
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

        <SectionHeading title="Thư viện bài tập" />
        <ExerciseSection
          exercises={homeData.exercises}
          onExercisePress={(exercise) =>
            navigation.navigate("ExerciseDetail", {
              exerciseId: exercise._id,
              exercise,
            })
          }
        />

        <YStack
          onLayout={(event) => {
            positions.current.history = event.nativeEvent.layout.y;
          }}>
          <SectionHeading title="Nhật ký gần đây" />
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
          if (tab === "history") {
            const activePlanId = homeData.plans[0]?._id;
            navigation.navigate("History", { planId: activePlanId });
            return;
          }
          setActiveTab(tab);
          navigation.setParams({ tab: tab === "plan" ? "plan" : "home" });
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
