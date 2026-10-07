import { YStack } from 'tamagui';
import { BaseText } from '../BaseText';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Exercise } from './types';
import { colors, EmptyState, Icon, ui } from './homeUi';

export function ExerciseSection({ exercises, onExercisePress }: { exercises: Exercise[]; onExercisePress: (exercise: Exercise) => void }) {
  const [group, setGroup] = useState<string | null>(null);
  const groups = Array.from(new Set(exercises.map(ex => ex.muscleGroup)));
  const effectiveGroup = group && groups.includes(group) ? group : null;
  const visible = exercises.filter(ex => !effectiveGroup || ex.muscleGroup === effectiveGroup);
  if (!exercises.length) return <EmptyState text="Thư viện chưa có bài tập." />;
  return <YStack {...{ gap: 14 }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{[null, ...groups].map(item => <YStack key={item ?? 'all'} accessibilityRole="button" accessibilityState={{ selected: item === effectiveGroup }} onPress={() => setGroup(item)} pressStyle={{ opacity: 0.7 }} {...{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 22, backgroundColor: item === effectiveGroup ? colors.primary : colors.card }}>
      <BaseText {...{ color: 'white', fontWeight: '600' }}>{item ?? 'Tất cả'}</BaseText>
    </YStack>)}</ScrollView>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>{visible.map(ex => <YStack key={ex._id} accessibilityRole="button" accessibilityLabel={`Xem bài tập ${ex.name}`} onPress={() => onExercisePress(ex)} {...ui.card} {...{ width: 186, justifyContent: 'space-between' }} pressStyle={{ opacity: 0.7 }}>
      <Icon name={ex.equipmentRequired === 'Bodyweight' ? 'user' : 'target'} />
      <BaseText {...ui.badge}>{ex.muscleGroup}</BaseText>
      <BaseText {...ui.title} {...{ fontSize: 17 }}>{ex.name}</BaseText>
      <BaseText {...ui.body}>{ex.equipmentRequired === 'Bodyweight' ? 'Trọng lượng cơ thể' : ex.equipmentRequired}</BaseText>
      <BaseText {...{ color: colors.primary, fontWeight: '600' }}>Xem chi tiết →</BaseText>
    </YStack>)}</ScrollView>
  </YStack>;
}
