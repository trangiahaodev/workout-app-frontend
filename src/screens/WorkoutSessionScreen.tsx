import React, { useEffect, useState } from "react";
import { YStack, XStack, ScrollView, Input } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { startWorkout, logSet } from "../store/slices/workoutSlice";
import axiosClient from "../api/axiosClient";
import { Card, BaseText, PrimaryButton, TopHeader } from "../components";

interface Exercise {
  _id: string;
  name: string;
}

interface Props {
  planId?: string;
  exercises?: Exercise[];
  onComplete?: () => void;
}

const SETS = ["set_1", "set_2", "set_3"];

export default function WorkoutSessionScreen({ planId = "demo_plan", exercises = [], onComplete }: Props) {
  const dispatch = useDispatch();
  const { isActive, logs } = useSelector((state: RootState) => state.workout);
  const [list, setList] = useState<Exercise[]>(exercises);
  const [inputs, setInputs] = useState<Record<string, { kg: string; reps: string }>>({});

  useEffect(() => {
    if (!isActive) dispatch(startWorkout(planId));
    if (list.length === 0) {
      axiosClient
        .get("/exercises")
        .then((res: any) => setList((Array.isArray(res) ? res : res.data).slice(0, 3)))
        .catch((err) => console.error("Lỗi lấy bài tập:", err));
    }
  }, []);

  const getSet = (exId: string, setId: string) => logs[exId]?.find((s) => s.setId === setId);

  const getInput = (exId: string, setId: string) => {
    const saved = getSet(exId, setId);
    return inputs[exId + setId] ?? { kg: saved ? String(saved.weight) : "", reps: saved ? String(saved.reps) : "" };
  };

  const changeInput = (exId: string, setId: string, field: "kg" | "reps", value: string) => {
    setInputs({ ...inputs, [exId + setId]: { ...getInput(exId, setId), [field]: value.replace(/[^0-9.]/g, "") } });
  };

  const toggleSet = (exId: string, setId: string) => {
    const { kg, reps } = getInput(exId, setId);
    const done = getSet(exId, setId)?.completed ?? false;
    if (!done && !Number(reps)) return;
    dispatch(logSet({ exerciseId: exId, setLog: { setId, reps: Number(reps), weight: Number(kg) || 0, completed: !done } }));
  };

  const doneCount = Object.values(logs).flat().filter((s) => s.completed).length;
  const totalSets = list.length * SETS.length;

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader title="Đang tập" subtitle={`${doneCount}/${totalSets} set hoàn thành`} />

      <YStack height={4} backgroundColor="$borderColor">
        <YStack height={4} width={`${totalSets ? (doneCount / totalSets) * 100 : 0}%`} backgroundColor="$primary" />
      </YStack>

      <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
        {list.map((ex, index) => (
          <Card key={ex._id} gap="$3">
            <YStack gap="$1">
              <BaseText fontSize={12} fontWeight="700" color="$textSecondary">
                BÀI {index + 1}
              </BaseText>
              <BaseText fontSize={20} fontWeight="800" color="$white" textTransform="uppercase">
                {ex.name}
              </BaseText>
            </YStack>

            <XStack gap="$2" paddingHorizontal="$2">
              <BaseText width={28} fontSize={12} fontWeight="700" color="$textSecondary">SET</BaseText>
              <BaseText flex={1} fontSize={12} fontWeight="700" color="$textSecondary" textAlign="center">KG</BaseText>
              <BaseText flex={1} fontSize={12} fontWeight="700" color="$textSecondary" textAlign="center">REPS</BaseText>
              <YStack width={40} />
            </XStack>

            {SETS.map((setId, i) => {
              const done = getSet(ex._id, setId)?.completed ?? false;
              const value = getInput(ex._id, setId);
              return (
                <XStack
                  key={setId}
                  gap="$2"
                  padding="$2"
                  borderRadius="$3"
                  alignItems="center"
                  backgroundColor={done ? "rgba(30,144,255,0.12)" : "transparent"}>
                  <YStack width={28} height={28} borderRadius="$pill" backgroundColor="$surfaceBg" alignItems="center" justifyContent="center">
                    <BaseText fontWeight="800" color="$white">{i + 1}</BaseText>
                  </YStack>
                  {(["kg", "reps"] as const).map((field) => (
                    <Input
                      key={field}
                      flex={1}
                      minWidth={0}
                      height={44}
                      paddingHorizontal={0}
                      fontSize={16}
                      fontWeight="700"
                      textAlign="center"
                      color="$white"
                      placeholder="0"
                      placeholderTextColor="$textSecondary"
                      backgroundColor="$surfaceBg"
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius="$3"
                      focusStyle={{ borderColor: "$primary" }}
                      keyboardType="numeric"
                      maxLength={field === "kg" ? 5 : 3}
                      disabled={done}
                      value={value[field]}
                      onChangeText={(text) => changeInput(ex._id, setId, field, text)}
                    />
                  ))}
                  <YStack
                    width={40}
                    height={44}
                    borderRadius="$3"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={done ? "$primary" : "$surfaceBg"}
                    borderWidth={1}
                    borderColor={done ? "$primary" : "$borderColor"}
                    pressStyle={{ opacity: 0.8, scale: 0.95 }}
                    onPress={() => toggleSet(ex._id, setId)}>
                    <Feather name="check" size={20} color={done ? "#FFFFFF" : "#8E8E93"} />
                  </YStack>
                </XStack>
              );
            })}
          </Card>
        ))}

        <PrimaryButton title="HOÀN THÀNH BUỔI TẬP" marginBottom="$8" disabled={doneCount === 0} onPress={onComplete} />
      </ScrollView>
    </YStack>
  );
}