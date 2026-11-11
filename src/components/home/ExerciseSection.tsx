import React, { useState } from "react";
import { YStack, ScrollView, XStack } from "tamagui";
import { BaseText } from "../BaseText";
import { Exercise } from "./types";
import { EmptyState, Icon, ui } from "./homeUi";

export function ExerciseSection({
  exercises,
  onExercisePress,
}: {
  exercises: Exercise[];
  onExercisePress: (exercise: Exercise) => void;
}) {
  const [group, setGroup] = useState<string | null>(null);
  const groups = Array.from(new Set(exercises.map((ex) => ex.muscleGroup)));
  const effectiveGroup = group && groups.includes(group) ? group : null;
  const visible = exercises.filter(
    (ex) => !effectiveGroup || ex.muscleGroup === effectiveGroup,
  );

  if (!exercises.length) {
    return <EmptyState text="Thư viện chưa có bài tập." />;
  }

  return (
    <YStack gap="$3.5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}>
        {[null, ...groups].map((item) => {
          const isSelected = item === effectiveGroup;
          return (
            <YStack
              key={item ?? "all"}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setGroup(item)}
              pressStyle={{ opacity: 0.75, scale: 0.96 }}
              minHeight={40}
              justifyContent="center"
              paddingHorizontal="$3.5"
              borderRadius={12}
              borderWidth={1}
              borderColor={isSelected ? "$primary" : "$borderColor"}
              backgroundColor={isSelected ? "$primary" : "$surfaceSubtle"}>
              <BaseText
                color={isSelected ? "$primaryContrast" : "$textPrimary"}
                fontWeight="600"
                fontSize={13}>
                {item ?? "Tất cả"}
              </BaseText>
            </YStack>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 6 }}>
        {visible.map((ex) => (
          <YStack
            key={ex._id}
            accessibilityRole="button"
            accessibilityLabel={`Xem bài tập ${ex.name}`}
            onPress={() => onExercisePress(ex)}
            {...ui.card}
            width={190}
            justifyContent="space-between"
            pressStyle={{ opacity: 0.8, scale: 0.98 }}>
            <XStack justifyContent="space-between" alignItems="center">
              <Icon
                name={
                  ex.equipmentRequired === "Bodyweight" ? "user" : "target"
                }
              />
              <BaseText {...ui.badge} fontSize={11}>
                {ex.muscleGroup}
              </BaseText>
            </XStack>
            <BaseText {...ui.title} fontSize={16} numberOfLines={2}>
              {ex.name}
            </BaseText>
            <BaseText {...ui.body} fontSize={13} numberOfLines={1}>
              {ex.equipmentRequired === "Bodyweight"
                ? "Trọng lượng cơ thể"
                : ex.equipmentRequired}
            </BaseText>
            <BaseText color="$textPrimary" fontWeight="700" fontSize={13}>
              Xem chi tiết →
            </BaseText>
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
