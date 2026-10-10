import React, { useEffect, useState } from "react";
import { YStack, ScrollView, Spinner } from "tamagui";
import { Card, BaseText, TopHeader, BottomNav } from "../components";
import { getSessionsByPlan, getLogsBySession } from "../services/logService";

const toList = (res: any): any[] =>
  Array.isArray(res) ? res : (res?.data ?? []);

export default function HistoryScreen({ planId }: { planId?: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!planId) return;
    const load = async () => {
      setLoading(true);
      try {
        setSessions(toList(await getSessionsByPlan(planId)));
        setError(null);
      } catch {
        setError("Không tải được lịch sử. Server có thể đang khởi động, thử lại sau 1 phút.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [planId]);

  const toggleSession = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    try {
      setLogs(toList(await getLogsBySession(id)));
    } catch {
      setLogs([]);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader />
      <ScrollView flex={1} padding="$4">
        <BaseText fontSize={18} fontWeight="800" marginBottom="$3" color="$white">
          NHẬT KÝ LUYỆN TẬP
        </BaseText>

        {!planId && (
          <BaseText color="$textSecondary">Chưa chọn kế hoạch tập.</BaseText>
        )}
        {loading && <Spinner size="large" />}
        {error && <BaseText color="$textSecondary">{error}</BaseText>}
        {planId && !loading && !error && sessions.length === 0 && (
          <BaseText color="$textSecondary">Chưa có buổi tập nào.</BaseText>
        )}

        <YStack gap="$3">
          {sessions.map((s, index) => {
            const id = String(s._id ?? s.id ?? index);
            return (
              <YStack key={id} onPress={() => toggleSession(id)}>
                <Card gap="$1">
                  <BaseText fontWeight="700" fontSize={16} color="$white">
                    {s.name ?? `Buổi tập ${index + 1}`}
                  </BaseText>
                  <BaseText color="$textSecondary" fontSize={13}>
                    {s.scheduledDate
                      ? new Date(s.scheduledDate).toLocaleDateString("vi-VN")
                      : ""}
                  </BaseText>
                  {openId === id &&
                    (logs.length === 0 ? (
                      <BaseText color="$textSecondary" fontSize={13}>
                        Chưa có dữ liệu bài tập.
                      </BaseText>
                    ) : (
                      logs.map((l, i) => (
                        <BaseText key={i} color="$white" fontSize={14}>
                          {l.exerciseId?.name ?? String(l.exerciseId)}:{" "}
                          {l.sets?.length ?? 0} set
                        </BaseText>
                      ))
                    ))}
                </Card>
              </YStack>
            );
          })}
        </YStack>
      </ScrollView>
      <BottomNav activeTabId="history" />
    </YStack>
  );
}