import React from "react";
import { YStack, ScrollView } from "tamagui";
import { Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BaseText } from "../BaseText";
import { Action, ui } from "./homeUi";

export interface HomeDetail {
  title: string;
  label: string;
  lines: string[];
}

export function HomeDetailModal({
  detail,
  onClose,
}: {
  detail: HomeDetail | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={detail !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <YStack
        flex={1}
        backgroundColor="rgba(0,0,0,0.75)"
        justifyContent="center"
        padding="$4"
        paddingTop={insets.top + 20}
        paddingBottom={insets.bottom + 20}>
        <YStack
          accessibilityRole="button"
          accessibilityLabel="Đóng chi tiết"
          onPress={onClose}
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
        />
        <YStack
          accessibilityViewIsModal
          {...ui.card}
          width="100%"
          maxWidth={560}
          maxHeight="90%"
          alignSelf="center"
          borderColor="$primary">
          <ScrollView contentContainerStyle={{ gap: 16 }}>
            <BaseText {...ui.label}>{detail?.label}</BaseText>
            <BaseText accessibilityRole="header" {...ui.title}>
              {detail?.title}
            </BaseText>
            {detail?.lines.map((line, index) => (
              <BaseText key={index} {...ui.body}>
                {line}
              </BaseText>
            ))}
          </ScrollView>
          <Action title="Đóng" onPress={onClose} />
        </YStack>
      </YStack>
    </Modal>
  );
}
