import React, { useEffect, useRef, useState } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Spinner, YStack } from "tamagui";
import { BaseText } from "../components";
import { useProfile } from "../hooks/useProfile";

// Chờ profile load lần đầu (Spinner). Nếu GET /profiles trả 404
// (profile = null, không có error) → mở ProfileScreen để tạo hồ sơ.
export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { profile, loading, error } = useProfile();
  // Nằm ngoài navigator nên đây là navigation gốc của NavigationContainer.
  const navigation = useNavigation();
  const [initialDone, setInitialDone] = useState(false);
  const decided = useRef(false);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  useEffect(() => {
    if (!loading) setInitialDone(true);
  }, [loading]);

  // Chỉ quyết định 1 lần cho mỗi phiên đăng nhập, ngay sau khi Stack mount.
  useEffect(() => {
    if (!initialDone || decided.current) return;
    decided.current = true;
    if (profile !== null || error) return;

    let attempts = 0;
    const goToProfile = () => {
      if (unmounted.current) return;
      const root = navigation as typeof navigation & { isReady?: () => boolean };
      if (root.isReady && !root.isReady() && attempts < 10) {
        attempts += 1;
        requestAnimationFrame(goToProfile);
        return;
      }
      navigation.dispatch(CommonActions.navigate("Profile"));
    };
    goToProfile();
  }, [initialDone, profile, error, navigation]);

  if (!initialDone) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$3"
        padding="$4" backgroundColor="$background">
        <Spinner size="large" color="$primary" />
        <BaseText>Đang tải hồ sơ…</BaseText>
        <BaseText variant="caption" textAlign="center">
          Máy chủ có thể mất ~1 phút để khởi động lần đầu.
        </BaseText>
      </YStack>
    );
  }

  return <>{children}</>;
}

export default ProfileGate;
