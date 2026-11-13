import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputProps, ScrollView, YStack } from "tamagui";
import { BaseText } from "../BaseText";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthLayout({ title, subtitle, children }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <YStack flex={1} backgroundColor="$background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          flex={1}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          <YStack
            flex={1}
            justifyContent="center"
            gap="$5"
            paddingHorizontal="$4"
            paddingTop={insets.top + 24}
            paddingBottom={insets.bottom + 24}
            width="100%"
            maxWidth={480}
            alignSelf="center">
            <YStack gap="$2">
              <BaseText variant="display">{title}</BaseText>
              <BaseText variant="subtitle">{subtitle}</BaseText>
            </YStack>
            {children}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </YStack>
  );
}

export function AuthField({ label, error, ...inputProps }: InputProps & {
  label: string;
  error?: string | null;
}) {
  return (
    <YStack gap="$1.5">
      <BaseText fontSize={13} fontWeight="600" color="$textSecondary">
        {label}
      </BaseText>
      <Input
        height={48}
        paddingHorizontal="$3"
        fontSize={15}
        color="$textPrimary"
        placeholderTextColor="$textTertiary"
        backgroundColor="$surfaceSubtle"
        borderWidth={1}
        borderColor={error ? "$accent" : "$borderColor"}
        borderRadius={12}
        focusStyle={{ borderColor: "$primary" }}
        {...inputProps}
      />
      {error ? (
        <BaseText fontSize={13} color="$accent" accessibilityRole="alert">
          {error}
        </BaseText>
      ) : null}
    </YStack>
  );
}

// Hiện gợi ý khi request chờ lâu (Render free "ngủ" 30s–1 phút).
export function useSlowHint(active: boolean, delayMs = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);
  return slow;
}

export const SLOW_SERVER_HINT =
  "Máy chủ có thể mất khoảng 1 phút để khởi động lần đầu, vui lòng chờ…";
