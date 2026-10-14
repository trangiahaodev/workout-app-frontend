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
              pressStyle={{ opacity: 0.7 }}
              minHeight={44}
              justifyContent="center"
              paddingHorizontal="$4"
              borderRadius="$full"
              borderWidth={1}
              borderColor={isSelected ? "$primary" : "$borderColor"}
              backgroundColor={isSelected ? "$primary" : "$cardBg"}>
              <BaseText color="$white" fontWeight="600">
                {item ?? "Tất cả"}
              </BaseText>
            </YStack>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
        {visible.map((ex) => (
          <YStack
            key={ex._id}
            accessibilityRole="button"
            accessibilityLabel={`Xem bài tập ${ex.name}`}
            onPress={() => onExercisePress(ex)}
            {...ui.card}
            width={186}
            justifyContent="space-between"
            pressStyle={{ opacity: 0.7 }}>
            <XStack justifyContent="space-between" alignItems="center">
              <Icon
                name={
                  ex.equipmentRequired === "Bodyweight" ? "user" : "target"
                }
              />
              <BaseText {...ui.badge}>{ex.muscleGroup}</BaseText>
            </XStack>
            <BaseText {...ui.title} fontSize={17} numberOfLines={2}>
              {ex.name}
            </BaseText>
            <BaseText {...ui.body} numberOfLines={1}>
              {ex.equipmentRequired === "Bodyweight"
                ? "Trọng lượng cơ thể"
                : ex.equipmentRequired}
            </BaseText>
            <BaseText color="$primary" fontWeight="600">
              Xem chi tiết →
            </BaseText>
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
