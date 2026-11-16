import React, { useEffect, useState, useCallback } from "react";
import { RefreshControl, Pressable } from "react-native";
import { YStack, XStack, ScrollView, Spinner } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
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
import { getPlansByProfile } from "../services/planService";
import { fetchProgressInsights } from "../services/aiService";
import { useProfile } from "../hooks/useProfile";
import { useProgressAnalytics } from "../hooks/useProgressAnalytics";
import { WorkoutSession, WorkoutLog, AIInsightResponse } from "../types";
import {
  HistoryScreenNavigationProp,
  HistoryScreenRouteProp,
} from "../navigation/types";

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
  const { profile } = useProfile();

  const activePlanId = propPlanId ?? route.params?.planId;
  const activeSessionId = propSessionId ?? route.params?.sessionId;

  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "history">(
    route.params?.tab ?? (activeSessionId ? "history" : "analytics"),
  );

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const [insightOpen, setInsightOpen] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightData, setInsightData] = useState<AIInsightResponse | null>(
    null,
  );

  const handleToggleInsight = async () => {
    const nextState = !insightOpen;
    setInsightOpen(nextState);
    if (nextState && !insightData && !insightLoading) {
      setInsightLoading(true);
      try {
        const res = await fetchProgressInsights({
          profileId: profile?._id,
          userId: profile?.userId,
        });
        setInsightData(res);
      } catch {
        // Giữ trạng thái an toàn nếu lỗi mạng
      } finally {
        setInsightLoading(false);
      }
    }
  };

  const {
    data: analyticsData,
    loading: analyticsLoading,
    isRefreshing: analyticsRefreshing,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useProgressAnalytics(activePlanId, profile?._id);

  const loadLogsForSession = useCallback(async (sessionId: string) => {
    try {
      const res = await getLogsBySession(sessionId);
      setLogs(Array.isArray(res) ? res : []);
    } catch {
      setLogs([]);
    }
  }, []);

  const loadSessionsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Tổng hợp toàn bộ lộ trình của user để không mất lịch sử khi đổi mục tiêu
      let planIds: string[] = [];
      if (profile?._id) {
        const allPlans = await getPlansByProfile(profile._id).catch(() => []);
        planIds = allPlans.map((p) => p._id);
      }
      if (activePlanId && !planIds.includes(activePlanId)) {
        planIds.push(activePlanId);
      }

      if (planIds.length === 0) {
        setSessions([]);
        return;
      }

      const sessionGroups = await Promise.all(
        planIds.map((id) => getSessionsByPlan(id).catch(() => [])),
      );

      const uniqueMap = new Map<string, WorkoutSession>();
      sessionGroups.flat().forEach((s) => {
        if (s.status === "completed" || s._id === activeSessionId) {
          uniqueMap.set(s._id, s);
        }
      });

      const completed = Array.from(uniqueMap.values()).sort(
        (a, b) =>
          Date.parse(b.completedDate || b.scheduledDate) -
          Date.parse(a.completedDate || a.scheduledDate),
      );

      setSessions(completed);

      const targetId = activeSessionId ?? completed[0]?._id;
      if (targetId) {
        setOpenId(targetId);
        await loadLogsForSession(targetId);
      } else {
        setOpenId(null);
        setLogs([]);
      }
    } catch {
      setError("Không tải được nhật ký buổi tập.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [profile?._id, activePlanId, activeSessionId, loadLogsForSession]);

  useEffect(() => {
    void loadSessionsData();
  }, [loadSessionsData]);

  const onRefresh = useCallback(async () => {
    setInsightOpen(false);
    setInsightData(null);
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
            shadowColor={
              activeSubTab === "analytics" ? "#000000" : "transparent"
            }
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={activeSubTab === "analytics" ? 0.04 : 0}
            shadowRadius={8}
            elevation={activeSubTab === "analytics" ? 1 : 0}
            alignItems="center"
            onPress={() => setActiveSubTab("analytics")}>
            <BaseText
              color={
                activeSubTab === "analytics" ? "$textPrimary" : "$textSecondary"
              }
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
              color={
                activeSubTab === "history" ? "$textPrimary" : "$textSecondary"
              }
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
                    <Card gap="$2.5" marginBottom="$3">
                      <Pressable onPress={() => void handleToggleInsight()}>
                        <XStack
                          alignItems="center"
                          justifyContent="space-between">
                          <XStack alignItems="center" gap="$2" flex={1}>
                            <YStack
                              width={32}
                              height={32}
                              borderRadius={16}
                              backgroundColor="#111111"
                              alignItems="center"
                              justifyContent="center">
                              <Ionicons
                                name="sparkles"
                                size={16}
                                color="#FFFFFF"
                              />
                            </YStack>
                            <YStack flex={1}>
                              <BaseText
                                fontSize={15}
                                fontWeight="800"
                                color="$textPrimary">
                                AI Insight · Đánh giá tiến độ
                              </BaseText>
                              <BaseText fontSize={12} color="$textSecondary">
                                {insightOpen
                                  ? "Phân tích xu hướng & khuyến nghị buổi tới"
                                  : "Chạm để AI giải mã ý nghĩa các chỉ số của bạn"}
                              </BaseText>
                            </YStack>
                          </XStack>
                          <Ionicons
                            name={insightOpen ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#111111"
                          />
                        </XStack>
                      </Pressable>

                      {insightOpen && (
                        <YStack
                          gap="$2.5"
                          paddingTop="$2.5"
                          borderTopWidth={1}
                          borderColor="$borderColor">
                          {insightLoading ? (
                            <XStack
                              alignItems="center"
                              gap="$2"
                              paddingVertical="$2">
                              <Spinner size="small" color="$textPrimary" />
                              <BaseText fontSize={13} color="$textSecondary">
                                AI đang đối chiếu dữ liệu quá khứ...
                              </BaseText>
                            </XStack>
                          ) : insightData ? (
                            <>
                              <YStack
                                backgroundColor="$surfaceSubtle"
                                padding="$2.5"
                                borderRadius={10}>
                                <BaseText
                                  fontSize={14}
                                  fontWeight="700"
                                  color="$textPrimary">
                                  📈 {insightData.insight.headline}
                                </BaseText>
                              </YStack>
                              <BaseText
                                fontSize={13}
                                color="$textPrimary"
                                lineHeight={19}>
                                <BaseText fontWeight="700">
                                  • Xu hướng:{" "}
                                </BaseText>
                                {insightData.insight.trendAnalysis}
                              </BaseText>
                              <BaseText
                                fontSize={13}
                                color="$textPrimary"
                                lineHeight={19}>
                                <BaseText fontWeight="700">
                                  • Cân bằng nhóm cơ:{" "}
                                </BaseText>
                                {insightData.insight.imbalanceWarning}
                              </BaseText>
                              <BaseText
                                fontSize={13}
                                color="$textPrimary"
                                lineHeight={19}>
                                <BaseText fontWeight="700">
                                  • Gợi ý buổi tới:{" "}
                                </BaseText>
                                {insightData.insight.nextAction}
                              </BaseText>
                            </>
                          ) : (
                            <BaseText fontSize={13} color="$textSecondary">
                              Chưa thể phân tích dữ liệu lúc này. Hãy thử lại
                              sau!
                            </BaseText>
                          )}
                        </YStack>
                      )}
                    </Card>
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
              Các buổi đã hoàn thành
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
              <Card>
                <BaseText color="$textSecondary">
                  Chưa có buổi tập nào được hoàn thành.
                </BaseText>
              </Card>
            )}

            {sessions.map((s, index) => {
              const id = String(s._id ?? index);
              const isOpen = openId === id;
              const displayDate = s.completedDate || s.scheduledDate;
              return (
                <YStack key={id} onPress={() => toggleSession(id)}>
                  <Card gap="$2" marginBottom="$3">
                    <BaseText
                      fontWeight="700"
                      fontSize={16}
                      color="$textPrimary">
                      {s.name ?? `Buổi tập ${index + 1}`}
                    </BaseText>
                    <BaseText color="$textSecondary" fontSize={13}>
                      {displayDate
                        ? `Hoàn thành: ${new Date(displayDate).toLocaleDateString("vi-VN")}`
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
            if (navigation.canGoBack()) {
              navigation.popTo("Home", { tab: "home" });
            } else {
              navigation.navigate("Home", { tab: "home" });
            }
          } else if (tabId === "plan") {
            if (navigation.canGoBack()) {
              navigation.popTo("Home", { tab: "plan" });
            } else {
              navigation.navigate("Home", { tab: "plan" });
            }
          }
        }}
      />
    </YStack>
  );
}
