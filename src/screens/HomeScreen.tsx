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
import {
  mockProfile,
  mockPlans,
  mockSessions,
  mockExercises,
  MOCK_LOGS,
} from "../components/home/mockData";
import { startWorkout } from "../store/slices/workoutSlice";
import { getPlansByProfile, getPlanSessions } from "../services/planService";
import axiosClient from "../api/axiosClient";
import {
  Exercise,
  GoalType,
  WorkoutLog,
  WorkoutPlan,
  WorkoutSession,
} from "../types";

const DEMO_PROFILE_ID = "670c1a111111111111111101";

const defaultHomeData: HomeData = {
  profile: mockProfile,
  plans: mockPlans,
  sessions: mockSessions,
  exercises: mockExercises,
  logs: MOCK_LOGS,
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

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

  // Bỏ qua lần mount đầu (ProfileGate vừa tải xong), chỉ làm mới khi quay lại Home sau đó
  useFocusEffect(
    useCallback(() => {
      if (didInitialFocus.current) {
        void reloadRef.current();
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
    }, [route.params?.tab]),
  );

  // 1. Tải danh sách bài tập từ GET /api/v1/exercises
  useEffect(() => {
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
      .catch(() => {
        // Fallback an toàn về mockExercises
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải plans & sessions theo đúng endpoint có sẵn trong planService.ts
  useEffect(() => {
    if (!profile?._id) return;
    let isMounted = true;

    async function loadPlanAndSessionData() {
      const fetchedPlans = await getPlansByProfile(profile!._id).catch(
        () => [],
      );
      const activeGoal: GoalType = profile?.goal || "Tăng cơ";

      const targetPlans =
        fetchedPlans.length > 0
          ? fetchedPlans
          : mockPlans.filter((p) => p.goal === activeGoal);

      const sessionGroups = await Promise.all(
        targetPlans.map((p) => getPlanSessions(p._id).catch(() => [])),
      );
      const fetchedSessions = sessionGroups.flat();

      if (isMounted) {
        setHomeData((prev) => ({
          ...prev,
          plans: fetchedPlans.length > 0 ? fetchedPlans : prev.plans,
          sessions:
            fetchedSessions.length > 0 ? fetchedSessions : prev.sessions,
        }));
      }
    }

    void loadPlanAndSessionData();

    return () => {
      isMounted = false;
    };
  }, [profile?._id, profile?.goal]);

  // Lọc tối đa 3 chương trình tập tương ứng với mục tiêu của user
  const userPlans = useMemo<WorkoutPlan[]>(() => {
    const activeGoal: GoalType = profile?.goal || "Tăng cơ";
    const matched = homeData.plans.filter((p) => p.goal === activeGoal);
    return matched.length > 0
      ? matched.slice(0, 3)
      : homeData.plans.slice(0, 3);
  }, [homeData.plans, profile?.goal]);

  // Lọc các buổi tập thuộc 3 chương trình trên & neo buổi pending đầu tiên vào hôm nay
  const userSessions = useMemo<WorkoutSession[]>(() => {
    const planIds = new Set(userPlans.map((p) => p._id));
    const filtered = homeData.sessions.filter((s) => planIds.has(s.planId));

    const hasTodaySession = filtered.some(
      (s) =>
        s.status === "pending" &&
        isSameLocalDay(new Date(s.scheduledDate), now),
    );

    if (hasTodaySession) return filtered;

    let promoted = false;
    return filtered.map((s) => {
      if (!promoted && s.status === "pending") {
        promoted = true;
        return { ...s, scheduledDate: now.toISOString() };
      }
      return s;
    });
  }, [homeData.sessions, userPlans, now]);

  // Chỉ hiển thị nhật ký mẫu cho tài khoản demo; tài khoản mới bắt đầu trống
  const userLogs = useMemo<WorkoutLog[]>(() => {
    if (!profile) return [];
    const isDemoAccount = profile._id === DEMO_PROFILE_ID;
    const validSessionIds = new Set(userSessions.map((s) => s._id));

    return homeData.logs.filter((log) => {
      if (!isDemoAccount && log._id.startsWith("670c1a4444444444444444")) {
        return false;
      }
      const sid =
        typeof log.sessionId === "string"
          ? log.sessionId
          : ((log.sessionId as { _id?: string })?._id ?? "");
      return validSessionIds.has(sid);
    });
  }, [homeData.logs, userSessions, profile]);

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
          sessions={userSessions}
          now={now}
          onStartSession={handleStartWorkout}
          onSessionPress={(session) =>
            setDetail({
              label: "Lịch tập",
              title: session.name,
              lines: [
                `Ngày tập: ${formatDate(session.scheduledDate)}`,
                `Chương trình: ${
                  userPlans.find((p) => p._id === session.planId)?.name ??
                  "Chưa có thông tin"
                }`,
                "Nhấn Bắt đầu tập để ghi nhận các hiệp tập ngay bây giờ.",
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
            plans={userPlans}
            sessions={userSessions}
            onPlanPress={(plan, coverUri) => {
              const planSessions = userSessions.filter(
                (session) => session.planId === plan._id,
              );
              navigation.navigate("PlanDetail", {
                plan,
                sessions: planSessions,
                coverUri,
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
          <RecentLogsSection logs={userLogs} />
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
            const activePlanId = userPlans[0]?._id;
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
