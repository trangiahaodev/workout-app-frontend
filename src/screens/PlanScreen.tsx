import React, { useCallback, useState } from "react";
import { YStack, ScrollView, Spinner, Input } from "tamagui";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  BaseText,
  BottomNav,
  Card,
  PrimaryButton,
  TopHeader,
} from "../components";
import { PlanCard, PlanFilter, PlanFilterBar } from "../components/plan/planUi";
import {
  createPlan,
  getPlansByProfile,
  updatePlanStatus,
} from "../services/planService";
import { useProfile } from "../hooks/useProfile";
import { PlanScreenNavigationProp } from "../navigation/types";
import { WorkoutPlan } from "../types";

const ERROR_COLOR = "#FF453A";

export default function PlanScreen() {
  const navigation = useNavigation<PlanScreenNavigationProp>();
  const { profile } = useProfile();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [filter, setFilter] = useState<PlanFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    if (!profile?._id) {
      setPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setPlans(await getPlansByProfile(profile._id));
      setOffline(false);
    } catch {
      setPlans([]);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [profile?._id]);

  useFocusEffect(
    useCallback(() => {
      void loadPlans();
    }, [loadPlans]),
  );

  const handleCreate = async () => {
    if (!profile?._id) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Vui lòng nhập tên lộ trình.");
      return;
    }
    setCreating(true);
    setMessage(null);
    try {
      const created = await createPlan({
        profileId: profile._id,
        name: trimmed,
        goal: profile.goal,
        generatedByAI: false,
      });
      if (created?._id) {
        await updatePlanStatus(created._id, "active");
      }
      setName("");
      setShowForm(false);
      setFilter("all");
      await loadPlans();
    } catch {
      setMessage(
        "Không tạo được lộ trình. Server có thể đang khởi động, thử lại sau 1 phút.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const visiblePlans =
    filter === "all" ? plans : plans.filter((plan) => plan.status === filter);

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader
        title="Lộ trình tập luyện"
        subtitle="Tổng quan lịch tập theo mục tiêu của bạn"
        onBack={handleBack}
      />

      <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        <PlanFilterBar value={filter} onChange={setFilter} />

        <YStack marginTop="$4">
          {showForm ? (
            <Card gap="$3">
              <BaseText fontSize={13} fontWeight="600" color="$textSecondary">
                Tên lộ trình
              </BaseText>
              <Input
                height={44}
                paddingHorizontal="$3"
                fontSize={15}
                color="$textPrimary"
                placeholder="VD: Tăng cơ 4 tuần"
                placeholderTextColor="$textTertiary"
                backgroundColor="$surfaceSubtle"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius={12}
                focusStyle={{ borderColor: "$primary" }}
                value={name}
                onChangeText={setName}
              />
              <PrimaryButton
                title={creating ? "Đang tạo..." : "Tạo và áp dụng"}
                disabled={creating}
                onPress={handleCreate}
              />
              <PrimaryButton
                title="Hủy"
                variant="secondary"
                disabled={creating}
                onPress={() => {
                  setShowForm(false);
                  setName("");
                  setMessage(null);
                }}
              />
            </Card>
          ) : (
            <PrimaryButton
              title="+ Tạo lộ trình mới"
              onPress={() => setShowForm(true)}
            />
          )}
        </YStack>

        {message ? (
          <BaseText marginTop="$3" fontSize={13} color={ERROR_COLOR}>
            {message}
          </BaseText>
        ) : null}

        {offline ? (
          <Card marginTop="$4" marginBottom="$0" onPress={loadPlans}>
            <BaseText fontSize={13} color="$textSecondary">
              Không kết nối được server. Bấm vào đây để tải lại.
            </BaseText>
          </Card>
        ) : null}

        <YStack marginTop="$4">
          {loading ? (
            <Spinner size="large" marginTop="$6" />
          ) : visiblePlans.length === 0 ? (
            <Card gap="$3">
              <BaseText color="$textSecondary">
                Chưa có lộ trình nào. Hãy thiết lập mục tiêu ở Hồ sơ để hệ thống
                tạo lộ trình cho bạn.
              </BaseText>
              <PrimaryButton
                title="Thiết lập mục tiêu"
                onPress={() => navigation.navigate("Profile")}
              />
            </Card>
          ) : (
            visiblePlans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                onPress={() => navigation.navigate("PlanDetail", { plan })}
              />
            ))
          )}
        </YStack>

        <YStack height={24} />
      </ScrollView>

      <BottomNav
        tabs={[
          { id: "home", icon: "home", label: "Home" },
          { id: "plan", icon: "calendar", label: "Lịch tập" },
          { id: "history", icon: "clock", label: "Nhật ký" },
        ]}
        activeTabId="plan"
        onTabChange={(tab) => {
          if (tab === "home") {
            handleBack();
          } else if (tab === "history") {
            navigation.navigate("History", {
              planId: plans.find((plan) => plan.status === "active")?._id,
            });
          }
        }}
      />
    </YStack>
  );
}
