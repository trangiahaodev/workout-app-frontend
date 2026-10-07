import { YStack } from 'tamagui';
import { BaseText } from '../BaseText';
import React from 'react';

import { Session } from './types';
import { Action, dayKey, formatDate, Icon, ui } from './homeUi';

export function selectSessions(sessions: Session[], now: Date) {
  const sorted = sessions.filter(s => Number.isFinite(Date.parse(s.scheduledDate))).slice().sort((a, b) => Date.parse(a.scheduledDate) - Date.parse(b.scheduledDate));
  return { today: sorted.filter(s => dayKey(new Date(s.scheduledDate)) === dayKey(now)), next: sorted.find(s => Date.parse(s.scheduledDate) > now.getTime() && dayKey(new Date(s.scheduledDate)) !== dayKey(now)) };
}
export function TodaySessionSection({ sessions, now, onSessionPress }: { sessions: Session[]; now: Date; onSessionPress: (session: Session) => void }) {
  const { today, next } = selectSessions(sessions, now);
  return <YStack {...{ gap: 12 }}>{today.length ? today.map(session => <YStack key={session._id} {...ui.card} {...{ borderColor: '#245982', backgroundColor: '#101F2D' }}>
    <BaseText {...ui.label}>SẴN SÀNG CHO BUỔI TẬP</BaseText>
    <YStack {...ui.row}>
      <Icon name="activity" />
      <BaseText {...ui.title}>{session.name}</BaseText>
    </YStack>
    <BaseText {...ui.body}>Lịch tập: {formatDate(session.scheduledDate)}</BaseText>
    <Action title="Xem buổi tập" onPress={() => onSessionPress(session)} />
  </YStack>) : <YStack {...ui.card} {...{ backgroundColor: '#101F2D', borderColor: '#245982' }}>
    <Icon name="coffee" />
    <BaseText {...ui.title}>Hôm nay là ngày phục hồi</BaseText>
    <BaseText {...ui.body}>Bạn chưa có lịch tập hôm nay. Nghỉ ngơi và chuẩn bị cho buổi tập tiếp theo.</BaseText>{next ? <>
      <BaseText {...ui.badge}>TIẾP THEO · {formatDate(next.scheduledDate)}</BaseText>
      <BaseText {...ui.title}>{next.name}</BaseText>
      <Action title="Xem lịch tập tiếp theo" onPress={() => onSessionPress(next)} />
    </> : <BaseText {...ui.body}>Chưa có buổi tập sắp tới.</BaseText>}</YStack>}</YStack>;
}
