import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { mockProfile, mockExercises } from "../components/home/mockData";
import { startWorkout } from "../store/slices/workoutSlice";
import { getPlansByProfile, getPlanSessions } from "../services/planService";
import axiosClient from "../api/axiosClient";
import { Exercise, WorkoutLog, WorkoutPlan, WorkoutSession } from "../types";

const defaultHomeData: HomeData = {
  profile: mockProfile,
  plans: [],
  sessions: [],
  exercises: mockExercises,
  logs: [],
};

function unwrapArray<T>(res: unknown): T[] | null {
  if (Array.isArray(res)) return res as T[];
  if (
    res &&
    typeof res === "object" &&
    "data" in res &&
    Array.isArray((res as { data: unknown }).data)
  ) {
    return (res as { data: T[] }).data;
  }
  return null;
}

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
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  const didInitialFocus = useRef(false);

  const scroll = useRef<any>(null);
  const positions = useRef<Record<string, number>>({ home: 0 });
  const [activeTab, setActiveTab] = useState("home");
  const [detail, setDetail] = useState<HomeDetail | null>(null);
  const [homeData, setHomeData] = useState<HomeData>(
    initialData ?? defaultHomeData,
  );

  // 1. Tải danh sách bài tập từ GET /api/v1/exercises
  useEffect(() => {
    if (initialData) return;
    let isMounted = true;

    axiosClient
      .get("/exercises")
      .then((exRes: unknown) => {
        const fetchedExercises = unwrapArray<Exercise>(exRes);
        if (isMounted && fetchedExercises && fetchedExercises.length > 0) {
          setHomeData((prev) => ({
            ...prev,
            exercises: fetchedExercises,
          }));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [initialData]);

  // 2. Tải lộ trình, buổi tập và nhật ký thật của user đang đăng nhập
  const loadRoadmapData = useCallback(async () => {
    if (initialData || !profile?._id) return;

    const fetchedPlans = await getPlansByProfile(profile._id).catch(() => []);
    if (fetchedPlans.length === 0) {
      setHomeData((prev) => ({
        ...prev,
        plans: [],
        sessions: [],
        logs: [],
      }));
      return;
    }

    const sessionGroups = await Promise.all(
      fetchedPlans.map((p) => getPlanSessions(p._id).catch(() => [])),
    );
    const fetchedSessions = sessionGroups.flat();

    const logGroups = await Promise.all(
      fetchedSessions.map((s) =>
        axiosClient.get(`/logs/session/${s._id}`).catch(() => []),
      ),
    );
    const fetchedLogs = logGroups.flatMap(
      (res) => unwrapArray<WorkoutLog>(res) ?? [],
    );

    setHomeData((prev) => ({
      ...prev,
      plans: fetchedPlans,
      sessions: fetchedSessions,
      logs: fetchedLogs,
    }));
  }, [initialData, profile?._id]);

  useEffect(() => {
    void loadRoadmapData();
  }, [loadRoadmapData]);

  // Làm mới dữ liệu khi quay lại Home (từ Profile hoặc sau khi tập xong)
  useFocusEffect(
    useCallback(() => {
      if (didInitialFocus.current) {
        void reloadRef.current();
        void loadRoadmapData();
      } else {
        didInitialFocus.current = true;
      }

      const tab = route.params?.tab ?? "home";
      setActiveTab(tab);
      const frame = requestAnimationFrame(() => {
        scroll.current?.scrollTo({
          y: positions.current[tab] ?? 0,
          animated: true,
        });
      });
      return () => cancelAnimationFrame(frame);
    }, [route.params?.tab, loadRoadmapData]),
  );

  // Chỉ lấy các lộ trình đang active để hiển thị trên HomeScreen
  const activePlans = useMemo<WorkoutPlan[]>(() => {
    return homeData.plans.filter((p) => p.status === "active");
  }, [homeData.plans]);

  const activePlan = activePlans[0];

  const activeSessions = useMemo<WorkoutSession[]>(() => {
    if (!activePlan) return [];
    return homeData.sessions.filter((s) => s.planId === activePlan._id);
  }, [homeData.sessions, activePlan]);

  const handleStartWorkout = (session: Session) => {
    dispatch(
      startWorkout({
        planId: session.planId,
        sessionId: session._id,
      }),
    );

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
          sessions={activeSessions}
          now={now}
          onStartSession={handleStartWorkout}
          onSessionPress={(session) =>
            setDetail({
              label: "Lịch tập",
              title: session.name,
              lines: [
                `Ngày tập: ${formatDate(session.scheduledDate)}`,
                `Lộ trình: ${activePlan?.name ?? "Chưa có thông tin"}`,
                "Nhấn Bắt đầu tập ngay để ghi nhận các hiệp tập.",
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
          <SectionHeading title="Lộ trình của bạn" />
          {activePlans.length > 0 ? (
            <PlanSection
              plans={activePlans}
              sessions={homeData.sessions}
              onPlanPress={(plan, coverUri) => {
                const planSessions = homeData.sessions.filter(
                  (session) => session.planId === plan._id,
                );
                navigation.navigate("PlanDetail", {
                  plan,
                  sessions: planSessions,
                  coverUri,
                });
              }}
            />
          ) : (
            <Card gap="$3">
              <BaseText color="$textSecondary">
                Bạn chưa có lộ trình tập luyện nào.
              </BaseText>
              <PrimaryButton
                title="Thiết lập lộ trình"
                onPress={() => navigation.navigate("Profile")}
              />
            </Card>
          )}
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
            navigation.navigate("History", { planId: activePlan?._id });
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
