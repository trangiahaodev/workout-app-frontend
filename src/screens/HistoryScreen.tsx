import React, { useEffect, useState, useCallback } from "react";
import { RefreshControl } from "react-native";
import { YStack, XStack, ScrollView, Spinner } from "tamagui";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Card,
  BaseText,
  TopHeader,
  BottomNav,
  PrimaryButton,
  AnalyticsKpiCards,
  VolumeTrendChart,
  MuscleDistributionSection,
  AnalyticsEmptyState,
} from "../components";
import { getSessionsByPlan, getLogsBySession } from "../services/logService";
import { useProgressAnalytics } from "../hooks/useProgressAnalytics";
import { WorkoutSession, WorkoutLog } from "../types";
import {
  HistoryScreenNavigationProp,
  HistoryScreenRouteProp,
} from "../navigation/types";
import {
  mockPlans,
  mockSessions,
  MOCK_LOGS,
} from "../components/home/mockData";

interface Props {
  planId?: string;
  sessionId?: string;
}

export default function HistoryScreen({
  planId: propPlanId,
  sessionId: propSessionId,
}: Props) {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const route = useRoute<HistoryScreenRouteProp>();

  // Ưu tiên đọc params từ route, fallback về props hoặc mock default
  const activePlanId = propPlanId ?? route.params?.planId ?? mockPlans[0]?._id;
  const activeSessionId = propSessionId ?? route.params?.sessionId;

  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "history">(
    route.params?.tab ?? (activeSessionId ? "history" : "analytics"),
  );

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  // Hook tiến độ phân tích
  const {
    data: analyticsData,
    loading: analyticsLoading,
    isRefreshing: analyticsRefreshing,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useProgressAnalytics(activePlanId);

  const loadLogsForSession = useCallback(async (sessionId: string) => {
    try {
      const res = await getLogsBySession(sessionId);
      if (Array.isArray(res) && res.length > 0) {
        setLogs(res);
        return;
      }
    } catch {}
    const filteredMock = MOCK_LOGS.filter(
      (item) => item.sessionId === sessionId,
    );
    setLogs(filteredMock.length > 0 ? filteredMock : MOCK_LOGS);
  }, []);

  const loadSessionsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let loadedSessions: WorkoutSession[] = [];

    if (activePlanId) {
      try {
        const res = await getSessionsByPlan(activePlanId);
        if (Array.isArray(res) && res.length > 0) {
          loadedSessions = res;
        }
      } catch {
        // Lỗi gọi server, sẽ xử lý bằng fallback bên dưới
      }
    }

    // Nếu API rỗng hoặc lỗi, fallback về mockSessions
    if (loadedSessions.length === 0) {
      loadedSessions = mockSessions.filter(
        (s) => !activePlanId || s.planId === activePlanId,
      );
      if (loadedSessions.length === 0) {
        loadedSessions = mockSessions;
      }
    }

    // Nếu có sessionId vừa tập xong mà chưa nằm trong danh sách, chèn lên đầu
    if (
      activeSessionId &&
      !loadedSessions.some((s) => s._id === activeSessionId)
    ) {
      loadedSessions = [
        {
          _id: activeSessionId,
          planId: activePlanId ?? mockPlans[0]._id,
          name: "Buổi tập vừa hoàn thành",
          scheduledDate: new Date().toISOString(),
          status: "completed",
        },
        ...loadedSessions,
      ];
    }

    setSessions(loadedSessions);
    setLoading(false);

    // Tự động mở chi tiết buổi tập vừa hoàn thành (nếu có)
    const targetId = activeSessionId ?? loadedSessions[0]?._id;
    if (targetId) {
      setOpenId(targetId);
      loadLogsForSession(targetId);
    }
  }, [activePlanId, activeSessionId, loadLogsForSession]);

  useEffect(() => {
    loadSessionsData();
  }, [loadSessionsData]);

  const onRefresh = useCallback(async () => {
    await Promise.all([loadSessionsData(), refetchAnalytics()]);
  }, [loadSessionsData, refetchAnalytics]);

  const toggleSession = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      setLogs([]);
      return;
    }
    setOpenId(id);
    await loadLogsForSession(id);
  };

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const hasEmptyAnalytics =
    !analyticsLoading &&
    analyticsData &&
    analyticsData.totalVolumeKg === 0 &&
    analyticsData.completedSessionsCount === 0;

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader
        title={
          activeSubTab === "analytics"
            ? "Thống kê tiến độ"
            : "Nhật ký luyện tập"
        }
        onBack={handleBack}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        flex={1}
        padding="$4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={analyticsRefreshing || loading}
            onRefresh={onRefresh}
            tintColor="#111111"
            colors={["#111111"]}
          />
        }>
        <XStack
          backgroundColor="$surfaceSubtle"
          padding="$1"
          borderRadius={12}
          marginBottom="$4"
          borderWidth={1}
          borderColor="$borderColor">
          <YStack
            flex={1}
            paddingVertical="$2"
            borderRadius={10}
            backgroundColor={
              activeSubTab === "analytics" ? "$cardBg" : "transparent"
            }
            shadowColor={activeSubTab === "analytics" ? "#000000" : "transparent"}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={activeSubTab === "analytics" ? 0.04 : 0}
            shadowRadius={8}
            elevation={activeSubTab === "analytics" ? 1 : 0}
            alignItems="center"
            onPress={() => setActiveSubTab("analytics")}>
            <BaseText
              color={activeSubTab === "analytics" ? "$textPrimary" : "$textSecondary"}
              fontWeight={activeSubTab === "analytics" ? "700" : "500"}
              fontSize={14}>
              Thống kê tiến độ
            </BaseText>
          </YStack>

          <YStack
            flex={1}
            paddingVertical="$2"
            borderRadius={10}
            backgroundColor={
              activeSubTab === "history" ? "$cardBg" : "transparent"
            }
            shadowColor={activeSubTab === "history" ? "#000000" : "transparent"}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={activeSubTab === "history" ? 0.04 : 0}
            shadowRadius={8}
            elevation={activeSubTab === "history" ? 1 : 0}
            alignItems="center"
            onPress={() => setActiveSubTab("history")}>
            <BaseText
              color={activeSubTab === "history" ? "$textPrimary" : "$textSecondary"}
              fontWeight={activeSubTab === "history" ? "700" : "500"}
              fontSize={14}>
              Nhật ký buổi tập
            </BaseText>
          </YStack>
        </XStack>

        {/* TAB 1: THỐNG KÊ TIẾN ĐỘ */}
        {activeSubTab === "analytics" && (
          <YStack paddingBottom="$6">
            {analyticsLoading && (
              <Spinner size="large" color="$textPrimary" marginVertical="$6" />
            )}

            {analyticsError && (
              <Card gap="$2">
                <BaseText color="$textSecondary">{analyticsError}</BaseText>
                <PrimaryButton
                  title="Thử lại"
                  onPress={() => refetchAnalytics()}
                />
              </Card>
            )}

            {!analyticsLoading && !analyticsError && analyticsData && (
              <>
                {hasEmptyAnalytics ? (
                  <AnalyticsEmptyState
                    onStartWorkout={() =>
                      navigation.navigate("WorkoutSession", {
                        planId: activePlanId,
                      })
                    }
                  />
                ) : (
                  <>
                    <AnalyticsKpiCards data={analyticsData} />
                    <VolumeTrendChart
                      volumeHistory={analyticsData.volumeHistory}
                    />
                    <MuscleDistributionSection
                      distribution={analyticsData.muscleDistribution}
                    />
                  </>
                )}
              </>
            )}
          </YStack>
        )}

        {/* TAB 2: NHẬT KÝ BUỔI TẬP */}
        {activeSubTab === "history" && (
          <YStack gap="$3" paddingBottom="$6">
            <BaseText
              fontSize={18}
              fontWeight="800"
              marginBottom="$2"
              color="$textPrimary">
              Danh sách buổi tập
            </BaseText>

            {loading && (
              <Spinner size="large" color="$textPrimary" marginVertical="$4" />
            )}
            {error && (
              <BaseText color="$textSecondary" marginBottom="$3">
                {error}
              </BaseText>
            )}
            {!loading && sessions.length === 0 && (
              <BaseText color="$textSecondary">Chưa có buổi tập nào.</BaseText>
            )}

            {sessions.map((s, index) => {
              const id = String(s._id ?? index);
              const isOpen = openId === id;
              return (
                <YStack key={id} onPress={() => toggleSession(id)}>
                  <Card gap="$2" marginBottom="$3">
                    <BaseText fontWeight="700" fontSize={16} color="$textPrimary">
                      {s.name ?? `Buổi tập ${index + 1}`}
                    </BaseText>
                    <BaseText color="$textSecondary" fontSize={13}>
                      {s.scheduledDate
                        ? new Date(s.scheduledDate).toLocaleDateString("vi-VN")
                        : ""}
                    </BaseText>

                    {isOpen && (
                      <YStack
                        gap="$2"
                        marginTop="$2"
                        paddingTop="$2"
                        borderTopWidth={1}
                        borderColor="$borderColor">
                        {logs.length === 0 ? (
                          <BaseText color="$textSecondary" fontSize={13}>
                            Chưa có dữ liệu bài tập ghi nhận.
                          </BaseText>
                        ) : (
                          logs.map((l, i) => {
                            const exerciseName =
                              typeof l.exerciseId === "object"
                                ? l.exerciseId.name
                                : String(l.exerciseId);
                            const muscleGroup =
                              typeof l.exerciseId === "object" &&
                              l.exerciseId.muscleGroup
                                ? ` (${l.exerciseId.muscleGroup})`
                                : "";
                            const completedSets =
                              l.sets?.filter((set) => set.isCompleted).length ??
                              0;

                            return (
                              <YStack key={l._id ?? i} gap="$1">
                                <BaseText
                                  color="$textPrimary"
                                  fontSize={14}
                                  fontWeight="600">
                                  • {exerciseName}
                                  <BaseText
                                    color="$textSecondary"
                                    fontSize={12}>
                                    {muscleGroup}
                                  </BaseText>
                                </BaseText>
                                <BaseText
                                  color="$textSecondary"
                                  fontSize={12}
                                  paddingLeft="$3">
                                  Đã hoàn thành {completedSets}/
                                  {l.sets?.length ?? 0} set
                                </BaseText>
                              </YStack>
                            );
                          })
                        )}
                      </YStack>
                    )}
                  </Card>
                </YStack>
              );
            })}
          </YStack>
        )}
      </ScrollView>

      <BottomNav
        tabs={[
          { id: "home", icon: "home", label: "Home" },
          { id: "plan", icon: "calendar", label: "Lịch tập" },
          { id: "history", icon: "clock", label: "Nhật ký" },
        ]}
        activeTabId="history"
        onTabChange={(tabId) => {
          if (tabId === "home") {
            navigation.popTo("Home", { tab: "home" });
          } else if (tabId === "plan") {
            navigation.popTo("Home", { tab: "plan" });
          }
        }}
      />
    </YStack>
  );
}
