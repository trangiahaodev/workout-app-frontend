import React, { useCallback, useState } from "react";
import { YStack, XStack, ScrollView, Spinner } from "tamagui";
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
import { DEFAULT_SESSION_ID } from "../components/home/mockData";
import {
  PlanDetailScreenNavigationProp,
  PlanDetailScreenRouteProp,
} from "../navigation/types";
import { PlanStatus, WorkoutPlan, WorkoutSession } from "../types";

const ERROR_COLOR = "#FF453A";

export default function PlanDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<PlanDetailScreenNavigationProp>();
  const route = useRoute<PlanDetailScreenRouteProp>();

  const [plan, setPlan] = useState<WorkoutPlan>(route.params.plan);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getPlanSessions(plan._id);
      setSessions(
        list
          .slice()
          .sort(
            (a, b) =>
              Date.parse(b.scheduledDate) - Date.parse(a.scheduledDate),
          ),
      );
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [plan._id]);

  // Tải lại danh sách buổi tập mỗi khi màn này được mở lại
  useFocusEffect(
    useCallback(() => {
      loadSessions();
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

  const handleStartWorkout = () => {
    // Chuẩn bị Redux cho màn tập của Trung, rồi mở màn tập theo plan này
    dispatch(
      startWorkout({ planId: plan._id, sessionId: DEFAULT_SESSION_ID }),
    );
    navigation.navigate("WorkoutSession", { planId: plan._id });
  };

  const completedCount = sessions.filter(
    (session) => session.status === "completed",
  ).length;

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader
        title="Chi tiết chương trình"
        subtitle={plan.name}
        onBack={() => navigation.goBack()}
      />

      <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        <Card gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <StatusBadge
              label={PLAN_STATUS_LABEL[plan.status] ?? plan.status}
              color={PLAN_STATUS_COLOR[plan.status] ?? "#8E8E93"}
            />
            <BaseText fontSize={11} fontWeight="600" color="$textSecondary">
              {plan.generatedByAI ? "AI tạo" : "Tự tạo"}
            </BaseText>
          </XStack>
          <BaseText fontSize={22} fontWeight="800" color="$textPrimary" letterSpacing={-0.3}>
            {plan.name}
          </BaseText>
          <BaseText fontSize={13} color="$textSecondary">
            {planDateRange(plan)}
          </BaseText>
          <BaseText fontSize={13} color="$textSecondary">
            {`${completedCount}/${sessions.length} buổi tập đã hoàn thành`}
          </BaseText>
        </Card>

        {message ? (
          <BaseText marginBottom="$3" fontSize={13} color={ERROR_COLOR}>
            {message}
          </BaseText>
        ) : null}

        <YStack gap="$2" marginBottom="$4">
          {plan.status === "active" ? (
            <>
              <PrimaryButton
                title="Bắt đầu buổi tập"
                disabled={busy}
                onPress={handleStartWorkout}
              />
              <PrimaryButton
                title="Hoàn thành chương trình"
                variant="secondary"
                disabled={busy}
                onPress={() => changeStatus("completed")}
              />
              <PrimaryButton
                title="Hủy chương trình"
                variant="secondary"
                disabled={busy}
                onPress={() => changeStatus("abandoned")}
              />
            </>
          ) : (
            <PrimaryButton
              title="Kích hoạt chương trình"
              disabled={busy}
              onPress={() => changeStatus("active")}
            />
          )}
        </YStack>

        <BaseText fontSize={18} fontWeight="800" color="$textPrimary" marginBottom="$3">
          Các buổi tập
        </BaseText>

        {loading ? (
          <Spinner size="large" color="$textPrimary" />
        ) : sessions.length === 0 ? (
          <Card>
            <BaseText color="$textSecondary">
              Chưa có buổi tập nào trong chương trình này.
            </BaseText>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session._id} gap="$2" marginBottom="$3">
              <XStack justifyContent="space-between" alignItems="center">
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
            </Card>
          ))
        )}

        <YStack height={32} />
      </ScrollView>
    </YStack>
  );
}
