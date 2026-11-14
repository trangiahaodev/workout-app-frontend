import React, { useRef } from "react";
import { Spinner, YStack } from "tamagui";
import { BaseText } from "../components";
import { useProfile } from "../hooks/useProfile";

// Chờ profile load lần đầu (Spinner). Nếu GET /profiles trả 404
// (profile = null, không có error) → khởi tạo Stack trực tiếp tại ProfileScreen.
export function ProfileGate({
  children,
}: {
  children:
    | React.ReactNode
    | ((initialRouteName: "Home" | "Profile") => React.ReactNode);
}) {
  const { profile, loading, error } = useProfile();
  const initialRouteRef = useRef<"Home" | "Profile" | null>(null);

  if (loading && initialRouteRef.current === null) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap="$3"
        padding="$4"
        backgroundColor="$background">
        <Spinner size="large" color="$primary" />
        <BaseText>Đang tải hồ sơ…</BaseText>
        <BaseText variant="caption" textAlign="center">
          Máy chủ có thể mất ~1 phút để khởi động lần đầu.
        </BaseText>
      </YStack>
    );
  }

  if (initialRouteRef.current === null) {
    initialRouteRef.current = profile === null && !error ? "Profile" : "Home";
  }

  return (
    <>
      {typeof children === "function"
        ? children(initialRouteRef.current)
        : children}
    </>
  );
}

export default ProfileGate;
