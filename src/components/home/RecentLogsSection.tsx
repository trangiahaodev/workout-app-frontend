import { YStack } from 'tamagui';
import { BaseText } from '../BaseText';
import React from 'react';

import { WorkoutLog } from './types';
import { EmptyState, Icon, ui } from './homeUi';

export function RecentLogsSection({ logs }: { logs: WorkoutLog[] }) {
  if (!logs.length) return <EmptyState text="Chưa có nhật ký. Các buổi tập đã ghi sẽ xuất hiện tại đây." />;
  return <YStack {...{ gap: 10 }}>{logs.map(log => <YStack key={log._id} {...ui.card}>
    <YStack {...ui.row}>
      <Icon name="check-circle" />
      <YStack {...{ flex: 1, gap: 6 }}>
        <BaseText {...ui.title} {...{ fontSize: 16 }}>{log.exercise}</BaseText>
        <BaseText {...ui.body}>{log.sets} hiệp × {log.reps} lần · {log.weight > 0 ? `${log.weight} kg` : 'Trọng lượng cơ thể'}</BaseText>
      </YStack>
      <BaseText {...{ ...ui.body, fontSize: 12 }}>{log.date}</BaseText>
    </YStack>
  </YStack>)}</YStack>;
}
