import React from "react";
import { YStack, XStack } from "tamagui";
import { BaseText } from "../BaseText";
import { Session } from "./types";
import { Action, dayKey, formatDate, Icon, ui } from "./homeUi";

export function selectSessions(sessions: Session[], now: Date) {
  const sorted = sessions
    .filter((s) => Number.isFinite(Date.parse(s.scheduledDate)))
    .slice()
    .sort(
      (a, b) =>
        Date.parse(a.scheduledDate) - Date.parse(b.scheduledDate),
    );
  return {
    today: sorted.filter(
      (s) => dayKey(new Date(s.scheduledDate)) === dayKey(now),
    ),
    next: sorted.find(
      (s) =>
        Date.parse(s.scheduledDate) > now.getTime() &&
        dayKey(new Date(s.scheduledDate)) !== dayKey(now),
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
  const { today, next } = selectSessions(sessions, now);

  return (
    <YStack gap="$3">
      {today.length ? (
        today.map((session) => (
          <YStack
            key={session._id}
            {...ui.card}
            borderColor="$primary"
            backgroundColor="$surfaceBg">
            <BaseText {...ui.label}>SẴN SÀNG CHO BUỔI TẬP</BaseText>
            <XStack alignItems="center" gap="$3">
              <Icon name="activity" />
              <BaseText {...ui.title}>{session.name}</BaseText>
            </XStack>
            <BaseText {...ui.body}>
              Lịch tập: {formatDate(session.scheduledDate)}
            </BaseText>
            <XStack gap="$2" marginTop="$1">
              {onStartSession && (
                <YStack flex={1}>
                  <Action
                    title="Bắt Đầu Tập Ngay"
                    onPress={() => onStartSession(session)}
                  />
                </YStack>
              )}
              <YStack flex={onStartSession ? 0.8 : 1}>
                <Action
                  title="Chi Tiết"
                  secondary={Boolean(onStartSession)}
                  onPress={() => onSessionPress(session)}
                />
              </YStack>
            </XStack>
          </YStack>
        ))
      ) : (
        <YStack
          {...ui.card}
          backgroundColor="$surfaceBg"
          borderColor="$borderColor">
          <Icon name="coffee" />
          <BaseText {...ui.title}>Hôm nay là ngày phục hồi</BaseText>
          <BaseText {...ui.body}>
            Bạn chưa có lịch tập hôm nay. Nghỉ ngơi và chuẩn bị cho buổi tập tiếp theo.
          </BaseText>
          {next ? (
            <>
              <BaseText {...ui.badge}>
                TIẾP THEO · {formatDate(next.scheduledDate)}
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
