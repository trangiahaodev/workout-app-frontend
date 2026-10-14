import React, { useEffect, useState, useCallback } from "react";
import { YStack, ScrollView, Spinner } from "tamagui";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Card, BaseText, TopHeader, BottomNav } from "../components";
import { getSessionsByPlan, getLogsBySession } from "../services/logService";
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
  const activePlanId =
    propPlanId ?? route.params?.planId ?? mockPlans[0]?._id;
  const activeSessionId = propSessionId ?? route.params?.sessionId;

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const loadLogsForSession = useCallback(async (sessionId: string) => {
    try {
      const res = await getLogsBySession(sessionId);
      if (Array.isArray(res) && res.length > 0) {
        setLogs(res);
        return;
      }
    } catch {
      // API offline hoặc lỗi mạng, dùng fallback mock logs
    }
    const filteredMock = MOCK_LOGS.filter(
      (item) => item.sessionId === sessionId,
    );
    setLogs(filteredMock.length > 0 ? filteredMock : MOCK_LOGS);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
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

      if (isMounted) {
        setSessions(loadedSessions);
        setLoading(false);

        // Tự động mở chi tiết buổi tập vừa hoàn thành (nếu có)
        const targetId = activeSessionId ?? loadedSessions[0]?._id;
        if (targetId) {
          setOpenId(targetId);
          loadLogsForSession(targetId);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activePlanId, activeSessionId, loadLogsForSession]);

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

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader title="Lịch sử tập luyện" onBack={handleBack} />
      <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        <BaseText
          fontSize={20}
          fontWeight="800"
          marginBottom="$3"
          color="$white">
          NHẬT KÝ LUYỆN TẬP
        </BaseText>

        {loading && <Spinner size="large" color="$primary" marginVertical="$4" />}
        {error && (
          <BaseText color="$textSecondary" marginBottom="$3">
            {error}
          </BaseText>
        )}
        {!loading && sessions.length === 0 && (
          <BaseText color="$textSecondary">Chưa có buổi tập nào.</BaseText>
        )}

        <YStack gap="$3" paddingBottom="$6">
          {sessions.map((s, index) => {
            const id = String(s._id ?? index);
            const isOpen = openId === id;
            return (
              <YStack key={id} onPress={() => toggleSession(id)}>
                <Card gap="$2">
                  <BaseText fontWeight="700" fontSize={16} color="$white">
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
                            l.sets?.length ??
                            0;

                          return (
                            <YStack key={l._id ?? i} gap="$1">
                              <BaseText
                                color="$white"
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
                                Đã hoàn thành {completedSets}/{l.sets?.length ?? 0} set
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
            navigation.navigate("Home");
          }
        }}
      />
    </YStack>
  );
}