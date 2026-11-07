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
import {
  PlanCard,
  PlanFilter,
  PlanFilterBar,
} from "../components/plan/planUi";
import {
  createPlan,
  getPlansByProfile,
  updatePlanStatus,
} from "../services/planService";
import { DEFAULT_PROFILE_ID, mockPlans } from "../components/home/mockData";
import { PlanScreenNavigationProp } from "../navigation/types";
import { WorkoutPlan } from "../types";

const ERROR_COLOR = "#FF453A";

export default function PlanScreen() {
  const navigation = useNavigation<PlanScreenNavigationProp>();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [filter, setFilter] = useState<PlanFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await getPlansByProfile(DEFAULT_PROFILE_ID));
      setOffline(false);
    } catch {
      // Server chưa dậy hoặc mất mạng: dùng dữ liệu mẫu để vẫn xem được giao diện
      setPlans(mockPlans);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại mỗi khi quay về màn này (sau khi đổi trạng thái ở màn chi tiết)
  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans]),
  );

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Vui lòng nhập tên chương trình.");
      return;
    }
    setCreating(true);
    setMessage(null);
    try {
      const created = await createPlan({
        profileId: DEFAULT_PROFILE_ID,
        name: trimmed,
        generatedByAI: false,
      });
      // Tạo xong thì kích hoạt plan luôn
      if (created?._id) {
        await updatePlanStatus(created._id, "active");
      }
      setName("");
      setShowForm(false);
      setFilter("all");
      await loadPlans();
    } catch {
      setMessage(
        "Không tạo được chương trình. Server có thể đang khởi động, thử lại sau 1 phút.",
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
        title="Lịch tập"
        subtitle="Quản lý chương trình tập luyện"
        onBack={handleBack}
      />

      <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        <PlanFilterBar value={filter} onChange={setFilter} />

        <YStack marginTop="$4">
          {showForm ? (
            <Card gap="$3">
              <BaseText fontSize={13} fontWeight="700" color="$textSecondary">
                TÊN CHƯƠNG TRÌNH
              </BaseText>
              <Input
                height={44}
                paddingHorizontal="$3"
                fontSize={16}
                color="$white"
                placeholder="VD: Calisthenics 4 tuần"
                placeholderTextColor="$textSecondary"
                backgroundColor="$surfaceBg"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$3"
                focusStyle={{ borderColor: "$primary" }}
                value={name}
                onChangeText={setName}
              />
              <PrimaryButton
                title={creating ? "ĐANG TẠO..." : "TẠO VÀ KÍCH HOẠT"}
                disabled={creating}
                onPress={handleCreate}
              />
              <PrimaryButton
                title="HỦY"
                backgroundColor="$surfaceBg"
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
              title="+ TẠO CHƯƠNG TRÌNH MỚI"
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
              Không kết nối được server, đang hiển thị dữ liệu mẫu. Bấm vào đây
              để tải lại.
            </BaseText>
          </Card>
        ) : null}

        <YStack marginTop="$4">
          {loading ? (
            <Spinner size="large" marginTop="$6" />
          ) : visiblePlans.length === 0 ? (
            <Card>
              <BaseText color="$textSecondary">
                Chưa có chương trình nào.
              </BaseText>
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
