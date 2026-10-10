import React, { useEffect, useState } from "react";
import { YStack, ScrollView, Spinner } from "tamagui";
import { Card, BaseText, TopHeader, BottomNav } from "../components";
import { getWorkoutLogs } from "../services/logService";

export default function HistoryScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res: any = await getWorkoutLogs();
        setLogs(Array.isArray(res) ? res : (res?.data ?? []));
      } catch {
        setError("Không tải được lịch sử. Server có thể đang khởi động, thử lại sau 1 phút.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader />
      <ScrollView flex={1} padding="$4">
        <BaseText fontSize={18} fontWeight="800" marginBottom="$3" color="$white">
          NHẬT KÝ LUYỆN TẬP
        </BaseText>

        {loading && <Spinner size="large" />}
        {error && <BaseText color="$textSecondary">{error}</BaseText>}
        {!loading && !error && logs.length === 0 && (
          <BaseText color="$textSecondary">Chưa có buổi tập nào.</BaseText>
        )}

        <YStack gap="$3">
          {logs.map((item, index) => (
            <Card key={item._id ?? index} gap="$1">
              <BaseText fontWeight="700" fontSize={16} color="$white">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                  : `Buổi tập ${index + 1}`}
              </BaseText>
              <BaseText color="$textSecondary" fontSize={13}>
                {item.logs?.length ?? 0} bài tập
              </BaseText>
            </Card>
          ))}
        </YStack>
      </ScrollView>
      <BottomNav activeTabId="history" />
    </YStack>
  );
}