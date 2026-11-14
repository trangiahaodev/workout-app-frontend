import React, { useCallback, useState } from "react";
import { YStack, XStack, ScrollView, Spinner, Image } from "tamagui";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { BaseText, Card, PrimaryButton, TopHeader } from "../components";
import {
  PLAN_STATUS_COLOR,
  PLAN_STATUS_LABEL,
  SESSION_STATUS_COLOR,
  SESSION_STATUS_LABEL,
  StatusBadge,
  formatDateSafe,
  planDateRange,
} from "../components/plan/planUi";
import { getPlanSessions, updatePlanStatus } from "../services/planService";
import { startWorkout } from "../store/slices/workoutSlice";
import {
  PlanDetailScreenNavigationProp,
  PlanDetailScreenRouteProp,
} from "../navigation/types";
import { PlanStatus, WorkoutPlan, WorkoutSession } from "../types";

const ERROR_COLOR = "#FF453A";
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80";

export default function PlanDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<PlanDetailScreenNavigationProp>();
  const route = useRoute<PlanDetailScreenRouteProp>();

  const initialSessions = route.params.sessions ?? [];
  const coverUri =
    route.params.coverUri || route.params.plan.coverImage || DEFAULT_COVER;

  const [plan, setPlan] = useState<WorkoutPlan>(route.params.plan);
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    initialSessions
      .slice()
      .sort(
        (a, b) => Date.parse(a.scheduledDate) - Date.parse(b.scheduledDate),
      ),
  );
  const [loading, setLoading] = useState(initialSessions.length === 0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (initialSessions.length === 0) setLoading(true);
    try {
      const list = await getPlanSessions(plan._id);
      const sourceList = list.length > 0 ? list : initialSessions;
      // Sắp xếp tăng dần từ Tuần 1 -> Tuần 4
      setSessions(
        sourceList
          .slice()
          .sort(
            (a, b) => Date.parse(a.scheduledDate) - Date.parse(b.scheduledDate),
          ),
      );
    } catch {
      setSessions(initialSessions);
    } finally {
      setLoading(false);
    }
  }, [plan._id, initialSessions]);

  useFocusEffect(
    useCallback(() => {
      void loadSessions();
    }, [loadSessions]),
  );

  const changeStatus = async (status: PlanStatus) => {
    setBusy(true);
    setMessage(null);
    try {
      await updatePlanStatus(plan._id, status);
      setPlan((prev) => ({ ...prev, status }));
    } catch {
      setMessage("Không cập nhật được trạng thái. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const nextPendingSession = sessions.find((s) => s.status === "pending");

  const handleStartWorkout = (targetSessionId?: string) => {
    const resolvedSessionId = targetSessionId ?? nextPendingSession?._id;
    if (!resolvedSessionId) {
      setMessage("Tất cả các buổi trong lộ trình này đã hoàn thành.");
      return;
    }

    dispatch(startWorkout({ planId: plan._id, sessionId: resolvedSessionId }));
    navigation.navigate("WorkoutSession", {
      planId: plan._id,
      sessionId: resolvedSessionId,
    });
  };

  const completedCount = sessions.filter(
    (session) => session.status === "completed",
  ).length;

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader
        title="Chi tiết lộ trình"
        subtitle={plan.name}
        onBack={() => navigation.goBack()}
      />

      <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        <YStack
          backgroundColor="$surfaceBg"
          borderRadius={18}
          overflow="hidden"
          borderWidth={1}
          borderColor="$borderColor"
          marginBottom="$3">
          <YStack height={145} backgroundColor="#1C1C1E">
            <Image
              source={{ uri: coverUri }}
              width="100%"
              height="100%"
              resizeMode="cover"
            />
          </YStack>

          <YStack padding="$4" gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <StatusBadge
                label={PLAN_STATUS_LABEL[plan.status] ?? plan.status}
                color={PLAN_STATUS_COLOR[plan.status] ?? "#8E8E93"}
              />
              <BaseText fontSize={11} fontWeight="600" color="$textSecondary">
                {plan.goal ? `Mục tiêu: ${plan.goal}` : "Lộ trình cá nhân"}
              </BaseText>
            </XStack>
            <BaseText
              fontSize={22}
              fontWeight="800"
              color="$textPrimary"
              letterSpacing={-0.3}>
              {plan.name}
            </BaseText>
            <BaseText fontSize={13} color="$textSecondary">
              {planDateRange(plan)}
            </BaseText>
            <BaseText fontSize={13} color="$textSecondary">
              {`${completedCount}/${sessions.length} buổi tập đã hoàn thành`}
            </BaseText>
          </YStack>
        </YStack>

        {message ? (
          <BaseText marginBottom="$3" fontSize={13} color={ERROR_COLOR}>
            {message}
          </BaseText>
        ) : null}

        <YStack gap="$2" marginBottom="$4">
          {plan.status === "active" ? (
            <>
              {nextPendingSession ? (
                <PrimaryButton
                  title="Bắt đầu buổi tập tiếp theo"
                  disabled={busy}
                  onPress={() => handleStartWorkout()}
                />
              ) : null}
              <PrimaryButton
                title="Hoàn thành lộ trình"
                variant="secondary"
                disabled={busy}
                onPress={() => changeStatus("completed")}
              />
              <PrimaryButton
                title="Hủy lộ trình"
                variant="secondary"
                disabled={busy}
                onPress={() => changeStatus("abandoned")}
              />
            </>
          ) : (
            <PrimaryButton
              title="Áp dụng lộ trình này"
              disabled={busy}
              onPress={() => changeStatus("active")}
            />
          )}
        </YStack>

        <BaseText
          fontSize={18}
          fontWeight="800"
          color="$textPrimary"
          marginBottom="$3">
          Lịch trình các buổi tập
        </BaseText>

        {loading ? (
          <Spinner size="large" color="$textPrimary" />
        ) : sessions.length === 0 ? (
          <Card>
            <BaseText color="$textSecondary">
              Chưa có buổi tập nào trong lộ trình này.
            </BaseText>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session._id} gap="$2" marginBottom="$3">
              <XStack
                justifyContent="space-between"
                alignItems="center"
                gap="$2">
                <BaseText
                  flex={1}
                  fontSize={16}
                  fontWeight="700"
                  color="$textPrimary">
                  {session.name}
                </BaseText>
                <StatusBadge
                  label={SESSION_STATUS_LABEL[session.status] ?? session.status}
                  color={SESSION_STATUS_COLOR[session.status] ?? "#8E8E93"}
                />
              </XStack>
              <BaseText fontSize={13} color="$textSecondary">
                {`Ngày tập: ${formatDateSafe(session.scheduledDate) || "—"}`}
              </BaseText>
              {session.completedDate ? (
                <BaseText fontSize={13} color="$textSecondary">
                  {`Hoàn thành: ${formatDateSafe(session.completedDate)}`}
                </BaseText>
              ) : null}
              {session.status === "pending" && plan.status === "active" ? (
                <PrimaryButton
                  title="Tập buổi này"
                  size="sm"
                  onPress={() => handleStartWorkout(session._id)}
                />
              ) : null}
            </Card>
          ))
        )}

        <YStack height={32} />
      </ScrollView>
    </YStack>
  );
}
