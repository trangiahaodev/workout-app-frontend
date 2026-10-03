import React from "react";
import { YStack, ScrollView } from "tamagui";
import {
  Card,
  BaseText,
  PrimaryButton,
  ProgramCard,
  TopHeader,
  BottomNav,
} from "../components";

export default function HomeScreen() {
  return (
    <YStack flex={1} backgroundColor="$background">
      <TopHeader />

      <ScrollView flex={1} padding="$4">
        {/* Featured Program Section */}
        <BaseText fontSize={18} fontWeight="800" marginBottom="$3" color="$white">
          CHƯƠNG TRÌNH NỔI BẬT
        </BaseText>

        <ProgramCard
          title="CALISTHENICS FUNDAMENTALS"
          subtitle="THENX PROGRAM"
          level="BEGINNER"
          likes="14.2K"
          views="48K"
          onPress={() => console.log("Open Program")}
        />

        {/* Daily Schedule Section */}
        <BaseText fontSize={18} fontWeight="800" marginTop="$2" marginBottom="$3" color="$white">
          LỊCH TRÌNH HÔM NAY
        </BaseText>

        <Card gap="$2">
          <BaseText fontWeight="800" fontSize={20} color="$white" textTransform="uppercase">
            Ngực & Tay Sau
          </BaseText>
          <BaseText color="$textSecondary" fontSize={14} marginBottom="$2">
            Khối lượng dự kiến: 8 bài tập • 45 phút
          </BaseText>

          <PrimaryButton
            title="Bắt Đầu Tập Ngay"
            onPress={() => console.log("Call API bắt đầu buổi tập")}
          />
        </Card>

        <Card opacity={0.75} gap="$1">
          <BaseText fontWeight="700" fontSize={16} color="$white" textTransform="uppercase">
            Phục Hồi & Giãn Cơ
          </BaseText>
          <BaseText color="$textSecondary" fontSize={13}>
            Ngày mai (Nghỉ ngơi & Nạp năng lượng)
          </BaseText>
        </Card>
      </ScrollView>

      <BottomNav />
    </YStack>
  );
}
