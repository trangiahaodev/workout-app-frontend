import React, { useEffect, useRef, useState } from "react";
import { CommonActions, NavigationAction, StackActions, useNavigation, usePreventRemove } from "@react-navigation/native";
import { Button, ScrollView, Spinner, XStack, YStack } from "tamagui";
import { BaseText, BottomNav, Card, PrimaryButton, TopHeader } from "../components";
import { DEMO_USER_ID } from "../config/demoUser";
import { useProfile } from "../hooks/useProfile";
import { ProfileScreenNavigationProp } from "../navigation/types";
import { profileErrorMessage } from "../services/profileService";
import { GoalType, LevelType, Profile, UpsertProfilePayload } from "../types";

const GOALS: GoalType[] = ["Tăng cơ", "Giảm mỡ", "Sức mạnh", "Bảo trì"];
const LEVELS: { value: LevelType; label: string }[] = [
  { value: "Beginner", label: "Mới bắt đầu" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
];

function Choice<T extends string | number>({ value, selected, label, disabled, onSelect }: {
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
      backgroundColor={selected ? "$primary" : "$cardBg"}
      borderColor={selected ? "$primary" : "$borderColor"}
      borderWidth={1}
      color="$white"
      minHeight={44}
      onPress={() => onSelect(value)}>
      {label}
    </Button>
  );
}

function ProfileForm({ profile }: { profile: Profile | null }) {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { save } = useProfile();
  const [draft, setDraft] = useState<UpsertProfilePayload>(() => ({
    userId: DEMO_USER_ID,
    goal: profile?.goal ?? "Tăng cơ",
    level: profile?.level ?? "Beginner",
    trainingDaysPerWeek: profile?.trainingDaysPerWeek ?? 3,
  }));
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [edited, setEdited] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<NavigationAction | null>(null);
  const [discardAction, setDiscardAction] = useState<NavigationAction | null>(null);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const dirty = profile
    ? draft.goal !== profile.goal || draft.level !== profile.level ||
      draft.trainingDaysPerWeek !== profile.trainingDaysPerWeek
    : edited;

  usePreventRemove((dirty || saving) && !discardAction, ({ data }) => {
    if (!savingRef.current) setPendingAction(data.action);
  });

  useEffect(() => {
    if (discardAction) {
      navigation.dispatch(discardAction);
      setDiscardAction(null);
    }
  }, [discardAction, navigation]);

  useEffect(() => {
    if (pendingAction) scroll.current?.scrollTo({ y: 0, animated: true });
  }, [pendingAction]);

  function change<K extends keyof UpsertProfilePayload>(key: K, value: UpsertProfilePayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setEdited(true);
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    if (savingRef.current) return;
    if (!Number.isInteger(draft.trainingDaysPerWeek) ||
      draft.trainingDaysPerWeek < 1 || draft.trainingDaysPerWeek > 7) {
      setError("Chọn từ 1 đến 7 buổi tập mỗi tuần.");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError(null);
    setMessage(null);
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
      setMessage("Đã lưu hồ sơ thành công.");
    } catch (err) {
      setError(profileErrorMessage(err));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const goals = profile?.goal === "Giữ dáng, giữ cân"
    ? [...GOALS, profile.goal] : GOALS;

  return (
    <YStack flex={1}>
      <ScrollView ref={scroll} flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4" width="100%" maxWidth={720} alignSelf="center">
          {pendingAction && (
            <Card gap="$3" accessibilityRole="alert">
              <BaseText fontWeight="700">Bạn có thay đổi chưa lưu</BaseText>
              <BaseText color="$textSecondary">Bạn muốn tiếp tục chỉnh sửa hay bỏ thay đổi để rời màn hình?</BaseText>
              <Button onPress={() => setPendingAction(null)}>Tiếp tục chỉnh sửa</Button>
              <Button onPress={() => {
                setDraft({ userId: DEMO_USER_ID, goal: profile?.goal ?? "Tăng cơ",
                  level: profile?.level ?? "Beginner", trainingDaysPerWeek: profile?.trainingDaysPerWeek ?? 3 });
                setEdited(false);
                setDiscardAction(pendingAction);
                setPendingAction(null);
              }}>Bỏ thay đổi</Button>
            </Card>
          )}
          <YStack gap="$2">
            <BaseText fontSize={26} fontWeight="800">
              {profile ? "Hồ sơ tập luyện" : "Bắt đầu hành trình của bạn"}
            </BaseText>
            <BaseText color="$textSecondary">
              {profile ? "Điều chỉnh mục tiêu và nhịp tập phù hợp với bạn." :
                "Chọn mục tiêu, trình độ và số buổi để thiết lập hồ sơ đầu tiên."}
            </BaseText>
          </YStack>
          <Card gap="$3" marginBottom={0}>
            <BaseText fontWeight="700" fontSize={17}>Mục tiêu tập luyện</BaseText>
            <XStack flexWrap="wrap" gap="$2" accessibilityRole="radiogroup">
              {goals.map((goal) => (
                <Choice key={goal} value={goal} label={goal === "Bảo trì" ? "Giữ dáng, giữ cân" : goal}
                  selected={draft.goal === goal} disabled={saving}
                  onSelect={(value) => change("goal", value)} />
              ))}
            </XStack>
          </Card>
          <Card gap="$3" marginBottom={0}>
            <BaseText fontWeight="700" fontSize={17}>Trình độ hiện tại</BaseText>
            <XStack flexWrap="wrap" gap="$2" accessibilityRole="radiogroup">
              {LEVELS.map(({ value, label }) => (
                <Choice key={value} value={value} label={label}
                  selected={draft.level === value} disabled={saving}
                  onSelect={(next) => change("level", next)} />
              ))}
            </XStack>
          </Card>
          <Card gap="$3" marginBottom={0}>
            <BaseText fontWeight="700" fontSize={17}>Số buổi tập mỗi tuần</BaseText>
            <BaseText color="$textSecondary">Đã chọn {draft.trainingDaysPerWeek} buổi / tuần</BaseText>
            <XStack flexWrap="wrap" gap="$2" accessibilityRole="radiogroup">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <Choice key={days} value={days} label={`${days}`}
                  selected={draft.trainingDaysPerWeek === days} disabled={saving}
                  onSelect={(value) => change("trainingDaysPerWeek", value)} />
              ))}
            </XStack>
          </Card>
          {error && <BaseText accessibilityRole="alert">{error}</BaseText>}
          {message && <BaseText accessibilityRole="alert" color="$primary">{message}</BaseText>}
          <PrimaryButton title={saving ? "Đang lưu hồ sơ…" : profile ? "Lưu thay đổi" : "Tạo hồ sơ"}
            accessibilityRole="button" disabled={saving || (!!profile && !dirty)}
            onPress={handleSave} />
        </YStack>
      </ScrollView>
      <BottomNav activeTabId="profile"
        tabs={[
          { id: "home", icon: "home", label: "Home" },
          { id: "plan", icon: "calendar", label: "Lịch tập" },
          { id: "history", icon: "clock", label: "Nhật ký" },
        ]}
        onTabChange={(tab) => {
          if (savingRef.current) return;
          const action = tab === "history"
            ? CommonActions.navigate("History")
            : StackActions.popTo("Home", { tab: tab === "plan" ? "plan" : "home" });
          if (dirty) setPendingAction(action);
          else navigation.dispatch(action);
        }} />
    </YStack>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { profile, loading, error, reload } = useProfile();
  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader title="Hồ sơ" subtitle="Mục tiêu của bạn, nhịp tập của bạn"
        onBack={() => navigation.goBack()} />
      {loading ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Spinner color="$primary" size="large" />
          <BaseText>Đang tải hồ sơ…</BaseText>
        </YStack>
      ) : error ? (
        <YStack padding="$4" gap="$3">
          <BaseText accessibilityRole="alert">{error}</BaseText>
          <PrimaryButton title="Thử lại" onPress={() => { void reload(); }} />
        </YStack>
      ) : <ProfileForm profile={profile} />}
    </YStack>
  );
}
