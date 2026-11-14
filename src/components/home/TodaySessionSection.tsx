import React from "react";
import { YStack, XStack } from "tamagui";
import { BaseText } from "../BaseText";
import { Session } from "./types";
import { Action, dayKey, formatDate, Icon, ui } from "./homeUi";

export function selectSessions(sessions: Session[], now: Date) {
  const valid = sessions
    .filter((s) => Number.isFinite(Date.parse(s.scheduledDate)))
    .slice()
    .sort((a, b) => Date.parse(a.scheduledDate) - Date.parse(b.scheduledDate));

  const pending = valid.filter((s) => s.status !== "completed");
  const todayKey = dayKey(now);

  return {
    today: pending.filter(
      (s) => dayKey(new Date(s.scheduledDate)) === todayKey,
    ),
    completedToday: valid.find(
      (s) =>
        s.status === "completed" &&
        dayKey(new Date(s.completedDate || s.scheduledDate)) === todayKey,
    ),
    next: pending.find(
      (s) =>
        Date.parse(s.scheduledDate) > now.getTime() &&
        dayKey(new Date(s.scheduledDate)) !== todayKey,
    ),
  };
}

export function TodaySessionSection({
  sessions,
  now,
  onSessionPress,
  onStartSession,
}: {
  sessions: Session[];
  now: Date;
  onSessionPress: (session: Session) => void;
  onStartSession?: (session: Session) => void;
}) {
  const { today, completedToday, next } = selectSessions(sessions, now);
  const primaryToday = today[0];

  return (
    <YStack gap="$3">
      {primaryToday ? (
        <YStack key={primaryToday._id} {...ui.card}>
          <BaseText {...ui.label}>Sẵn sàng cho buổi tập</BaseText>
          <XStack alignItems="center" gap="$3">
            <Icon name="activity" />
            <BaseText {...ui.title}>{primaryToday.name}</BaseText>
          </XStack>
          <BaseText {...ui.body}>
            Lịch tập: {formatDate(primaryToday.scheduledDate)}
          </BaseText>
          <XStack gap="$2" marginTop="$1">
            {onStartSession && (
              <YStack flex={1}>
                <Action
                  title="Bắt đầu tập ngay"
                  onPress={() => onStartSession(primaryToday)}
                />
              </YStack>
            )}
            <YStack flex={onStartSession ? 0.75 : 1}>
              <Action
                title="Chi tiết"
                secondary={Boolean(onStartSession)}
                onPress={() => onSessionPress(primaryToday)}
              />
            </YStack>
          </XStack>
        </YStack>
      ) : completedToday ? (
        <YStack {...ui.card}>
          <Icon name="check-circle" />
          <BaseText {...ui.title}>Bạn đã hoàn thành buổi tập hôm nay!</BaseText>
          <BaseText {...ui.body}>
            Bạn đã hoàn thành buổi tập hôm nay rồi, nghỉ ngơi thật tốt cho buổi
            tập hôm sau nha.
          </BaseText>
          {next ? (
            <>
              <BaseText {...ui.badge}>
                Tiếp theo · {formatDate(next.scheduledDate)}
              </BaseText>
              <BaseText {...ui.title}>{next.name}</BaseText>
              <Action
                title="Xem lịch tập tiếp theo"
                onPress={() => onSessionPress(next)}
              />
            </>
          ) : null}
        </YStack>
      ) : (
        <YStack {...ui.card}>
          <Icon name="coffee" />
          <BaseText {...ui.title}>Hôm nay là ngày phục hồi</BaseText>
          <BaseText {...ui.body}>
            Bạn chưa có lịch tập hôm nay. Nghỉ ngơi và chuẩn bị cho buổi tập
            tiếp theo.
          </BaseText>
          {next ? (
            <>
              <BaseText {...ui.badge}>
                Tiếp theo · {formatDate(next.scheduledDate)}
              </BaseText>
              <BaseText {...ui.title}>{next.name}</BaseText>
              <Action
                title="Xem lịch tập tiếp theo"
                onPress={() => onSessionPress(next)}
              />
            </>
          ) : (
            <BaseText {...ui.body}>Chưa có buổi tập sắp tới.</BaseText>
          )}
        </YStack>
      )}
    </YStack>
  );
}
