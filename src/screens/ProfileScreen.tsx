import React, { useEffect, useRef, useState } from "react";
import { Alert, Modal, Platform } from "react-native";
import {
  CommonActions,
  NavigationAction,
  StackActions,
  useNavigation,
  usePreventRemove,
} from "@react-navigation/native";
import { Button, ScrollView, Spinner, XStack, YStack } from "tamagui";
import {
  BaseText,
  BottomNav,
  Card,
  PrimaryButton,
  TopHeader,
} from "../components";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { ProfileScreenNavigationProp } from "../navigation/types";
import { profileErrorMessage } from "../services/profileService";
import { generateRoadmap } from "../services/planService";
import { GoalType, LevelType, Profile, UpsertProfilePayload } from "../types";

const GOALS: GoalType[] = [
  "Tăng cơ",
  "Giảm mỡ",
  "Sức mạnh",
  "Giữ dáng, giữ cân",
];
const LEVELS: { value: LevelType; label: string }[] = [
  { value: "Beginner", label: "Mới bắt đầu" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
];

function Choice<T extends string | number>({
  value,
  selected,
  label,
  disabled,
  onSelect,
}: {
  value: T;
  selected: boolean;
  label: string;
  disabled: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <Button
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      backgroundColor={selected ? "$primary" : "$surfaceSubtle"}
      borderColor={selected ? "$primary" : "$borderColor"}
      borderWidth={1}
      color={selected ? "$primaryContrast" : "$textPrimary"}
      minHeight={44}
      borderRadius={12}
      onPress={() => onSelect(value)}>
      {label}
    </Button>
  );
}

function LogoutButton({ disabled = false }: { disabled?: boolean }) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  async function doLogout() {
    setBusy(true);
    try {
      await signOut();
    } catch {
      setBusy(false);
    }
  }

  function confirmLogout() {
    const title = "Đăng xuất";
    const body = "Bạn có chắc muốn đăng xuất khỏi tài khoản này?";
    if (Platform.OS === "web") {
      if (globalThis.confirm?.(body) ?? true) void doLogout();
      return;
    }
    Alert.alert(title, body, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          void doLogout();
        },
      },
    ]);
  }

  return (
    <PrimaryButton
      title="Đăng xuất"
      variant="secondary"
      loading={busy}
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={confirmLogout}
    />
  );
}

function ProfileForm({ profile }: { profile: Profile | null }) {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { save } = useProfile();
  const { userId: authUserId } = useAuth();
  const userId = authUserId ?? "";
  const [draft, setDraft] = useState<UpsertProfilePayload>(() => ({
    userId,
    goal: profile?.goal ?? "Tăng cơ",
    level: profile?.level ?? "Beginner",
    trainingDaysPerWeek: profile?.trainingDaysPerWeek ?? 3,
  }));
  const [saving, setSaving] = useState(false);
  const [settingUpRoadmap, setSettingUpRoadmap] = useState(false);
  const [navigatingAway, setNavigatingAway] = useState(false);
  const savingRef = useRef(false);
  const [edited, setEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<NavigationAction | null>(
    null,
  );
  const [discardAction, setDiscardAction] = useState<NavigationAction | null>(
    null,
  );
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const dirty = profile
    ? draft.goal !== profile.goal ||
      draft.level !== profile.level ||
      draft.trainingDaysPerWeek !== profile.trainingDaysPerWeek
    : edited;

  usePreventRemove(
    (dirty || saving || settingUpRoadmap) && !discardAction && !navigatingAway,
    ({ data }) => {
      if (!savingRef.current && !navigatingAway) {
        setPendingAction(data.action);
      }
    },
  );

  // Thực hiện chuyển trang SAU khi usePreventRemove đã re-render và gỡ chặn
  useEffect(() => {
    if (!navigatingAway) return;
    savingRef.current = false;
    if (navigation.canGoBack()) {
      navigation.dispatch(StackActions.popTo("Home", { tab: "home" }));
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home", params: { tab: "home" } }],
        }),
      );
    }
  }, [navigatingAway, navigation]);

  useEffect(() => {
    if (discardAction) {
      navigation.dispatch(discardAction);
      setDiscardAction(null);
    }
  }, [discardAction, navigation]);

  useEffect(() => {
    if (pendingAction) scroll.current?.scrollTo({ y: 0, animated: true });
  }, [pendingAction]);

  function change<K extends keyof UpsertProfilePayload>(
    key: K,
    value: UpsertProfilePayload[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setEdited(true);
    setError(null);
  }

  async function handleSave() {
    if (savingRef.current) return;
    if (
      !Number.isInteger(draft.trainingDaysPerWeek) ||
      draft.trainingDaysPerWeek < 1 ||
      draft.trainingDaysPerWeek > 7
    ) {
      setError("Chọn từ 1 đến 7 buổi tập mỗi tuần.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);
    setPendingAction(null);

    try {
      const result = await save(draft);
      setDraft({
        userId: result.userId,
        goal: result.goal,
        level: result.level,
        trainingDaysPerWeek: result.trainingDaysPerWeek,
      });
      setEdited(false);

      setSettingUpRoadmap(true);
      await generateRoadmap({
        profileId: result._id,
        goal: result.goal,
        level: result.level,
        trainingDaysPerWeek: result.trainingDaysPerWeek,
      });

      setSettingUpRoadmap(false);
      setSaving(false);
      setNavigatingAway(true);
    } catch (err) {
      savingRef.current = false;
      setSettingUpRoadmap(false);
      setSaving(false);
      setError(profileErrorMessage(err));
    }
  }

  return (
    <YStack flex={1}>
      <Modal
        visible={settingUpRoadmap}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <YStack
          flex={1}
          backgroundColor="rgba(0,0,0,0.45)"
          alignItems="center"
          justifyContent="center"
          padding="$5">
          <Card
            width="100%"
            maxWidth={340}
            padding="$5"
            alignItems="center"
            gap="$3">
            <Spinner size="large" color="$primary" />
            <BaseText fontSize={17} fontWeight="700" textAlign="center">
              Đang thiết lập lộ trình tập luyện...
            </BaseText>
            <BaseText
              variant="caption"
              color="$textSecondary"
              textAlign="center">
              Hệ thống đang phân bổ lịch tập 4 tuần phù hợp với mục tiêu{" "}
              {draft.goal} của bạn.
            </BaseText>
          </Card>
        </YStack>
      </Modal>

      <ScrollView ref={scroll} flex={1} showsVerticalScrollIndicator={false}>
        <YStack
          padding="$4"
          gap="$4"
          width="100%"
          maxWidth={720}
          alignSelf="center">
          {pendingAction && (
            <Card gap="$3" accessibilityRole="alert">
              <BaseText fontWeight="700">Bạn có thay đổi chưa lưu</BaseText>
              <BaseText color="$textSecondary">
                Bạn muốn tiếp tục chỉnh sửa hay bỏ thay đổi để rời màn hình?
              </BaseText>
              <Button onPress={() => setPendingAction(null)}>
                Tiếp tục chỉnh sửa
              </Button>
              <Button
                onPress={() => {
                  setDraft({
                    userId,
                    goal: profile?.goal ?? "Tăng cơ",
                    level: profile?.level ?? "Beginner",
                    trainingDaysPerWeek: profile?.trainingDaysPerWeek ?? 3,
                  });
                  setEdited(false);
                  setDiscardAction(pendingAction);
                  setPendingAction(null);
                }}>
                Bỏ thay đổi
              </Button>
            </Card>
          )}
          <YStack gap="$2">
            <BaseText fontSize={26} fontWeight="800">
              {profile ? "Hồ sơ tập luyện" : "Bắt đầu hành trình của bạn"}
            </BaseText>
            <BaseText color="$textSecondary">
              {profile
                ? "Cập nhật mục tiêu để hệ thống thiết lập lại lộ trình tập luyện phù hợp."
                : "Chọn mục tiêu, trình độ và số buổi để thiết lập lộ trình đầu tiên."}
            </BaseText>
          </YStack>
          <Card gap="$3" marginBottom={0}>
            <BaseText fontWeight="700" fontSize={17}>
              Mục tiêu tập luyện
            </BaseText>
            <XStack flexWrap="wrap" gap="$2" accessibilityRole="radiogroup">
              {GOALS.map((goal) => (
                <Choice
                  key={goal}
                  value={goal}
                  label={goal}
                  selected={draft.goal === goal}
                  disabled={saving}
                  onSelect={(value) => change("goal", value)}
                />
              ))}
            </XStack>
          </Card>
          <Card gap="$3" marginBottom={0}>
            <BaseText fontWeight="700" fontSize={17}>
              Trình độ hiện tại
            </BaseText>
            <XStack flexWrap="wrap" gap="$2" accessibilityRole="radiogroup">
              {LEVELS.map(({ value, label }) => (
                <Choice
                  key={value}
                  value={value}
                  label={label}
                  selected={draft.level === value}
                  disabled={saving}
                  onSelect={(next) => change("level", next)}
                />
              ))}
            </XStack>
          </Card>
          <Card gap="$3" marginBottom={0}>
            <BaseText fontWeight="700" fontSize={17}>
              Số buổi tập mỗi tuần
            </BaseText>
            <BaseText color="$textSecondary">
              Đã chọn {draft.trainingDaysPerWeek} buổi / tuần
            </BaseText>
            <XStack flexWrap="wrap" gap="$2" accessibilityRole="radiogroup">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <Choice
                  key={days}
                  value={days}
                  label={`${days}`}
                  selected={draft.trainingDaysPerWeek === days}
                  disabled={saving}
                  onSelect={(value) => change("trainingDaysPerWeek", value)}
                />
              ))}
            </XStack>
          </Card>
          {error && <BaseText accessibilityRole="alert">{error}</BaseText>}
          <PrimaryButton
            title={
              saving
                ? "Đang lưu hồ sơ…"
                : profile
                  ? "Cập nhật lộ trình"
                  : "Thiết lập lộ trình"
            }
            accessibilityRole="button"
            disabled={saving || (!!profile && !dirty)}
            onPress={handleSave}
          />
          <LogoutButton disabled={saving} />
        </YStack>
      </ScrollView>
      <BottomNav
        activeTabId="profile"
        tabs={[
          { id: "home", icon: "home", label: "Home" },
          { id: "plan", icon: "calendar", label: "Lịch tập" },
          { id: "history", icon: "clock", label: "Nhật ký" },
        ]}
        onTabChange={(tab) => {
          if (savingRef.current) return;
          const targetTab = tab === "plan" ? "plan" : "home";
          const action =
            tab === "history"
              ? CommonActions.navigate("History")
              : navigation.canGoBack()
                ? StackActions.popTo("Home", { tab: targetTab })
                : CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Home", params: { tab: targetTab } }],
                  });
          if (dirty) setPendingAction(action);
          else navigation.dispatch(action);
        }}
      />
    </YStack>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { profile, loading, error, reload } = useProfile();
  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader
        title="Hồ sơ"
        subtitle="Mục tiêu của bạn, nhịp tập của bạn"
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Home", params: { tab: "home" } }],
              }),
            );
          }
        }}
      />
      {loading ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Spinner color="$primary" size="large" />
          <BaseText>Đang tải hồ sơ…</BaseText>
        </YStack>
      ) : error ? (
        <YStack padding="$4" gap="$3">
          <BaseText accessibilityRole="alert">{error}</BaseText>
          <PrimaryButton
            title="Thử lại"
            onPress={() => {
              void reload();
            }}
          />
          <LogoutButton />
        </YStack>
      ) : (
        <ProfileForm profile={profile} />
      )}
    </YStack>
  );
}
