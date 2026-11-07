import React from "react";
import { styled, YStack, XStack, Text, useTheme } from "tamagui";
import { Feather } from "@expo/vector-icons";

const CardContainer = styled(YStack, {
  name: "ProgramCardContainer",
  backgroundColor: "$cardBg",
  borderRadius: "$4",
  overflow: "hidden",
  height: 200,
  marginBottom: "$4",
  justifyContent: "space-between",
  padding: "$4",
  position: "relative",
  borderWidth: 1,
  borderColor: "$borderColor",
  pressStyle: {
    opacity: 0.9,
    scale: 0.99,
  },
});

const Badge = styled(XStack, {
  name: "ProgramCardBadge",
  backgroundColor: "$badgeBg",
  paddingHorizontal: "$2.5",
  paddingVertical: "$1",
  borderRadius: "$pill",
  alignSelf: "flex-start",
  alignItems: "center",
  justifyContent: "center",
});

const BadgeText = styled(Text, {
  name: "ProgramCardBadgeText",
  color: "$white",
  fontSize: 11,
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: 0.6,
});

const SubtitleText = styled(Text, {
  name: "ProgramCardSubtitle",
  color: "$textSecondary",
  fontSize: 12,
  textTransform: "uppercase",
  fontWeight: "600",
  letterSpacing: 0.5,
  marginBottom: "$1",
});

const TitleText = styled(Text, {
  name: "ProgramCardTitle",
  color: "$white",
  fontSize: 22,
  fontWeight: "800",
});

const MetricsContainer = styled(XStack, {
  name: "ProgramCardMetrics",
  alignItems: "center",
  gap: "$3",
});

const MetricItem = styled(XStack, {
  name: "ProgramCardMetricItem",
  alignItems: "center",
  gap: "$1",
});

const MetricText = styled(Text, {
  name: "ProgramCardMetricText",
  color: "$white",
  fontSize: 12,
  fontWeight: "600",
});

export interface ProgramCardProps {
  title: string;
  subtitle?: string;
  level?: string;
  likes?: string | number;
  views?: string | number;
  onPress?: () => void;
  hideMetrics?: boolean;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  subtitle = "THENX PROGRAM",
  level = "BEGINNER",
  likes = "11K",
  views = "25K",
  onPress,
  hideMetrics = false,
}) => {
  const theme = useTheme();
  const iconColor = theme.white?.val ?? "#FFFFFF";

  return (
    <CardContainer onPress={onPress} accessibilityRole="button" accessibilityLabel={`Xem chương trình ${title}`}>
      {/* Top-left Pill Badge */}
      <Badge>
        <BadgeText>{level}</BadgeText>
      </Badge>

      {/* Bottom Section: Title, Subtitle, and Metrics */}
      <XStack justifyContent="space-between" alignItems="flex-end">
        <YStack flex={1} marginRight="$2">
          {subtitle ? <SubtitleText>{subtitle}</SubtitleText> : null}
          <TitleText numberOfLines={2}>{title}</TitleText>
        </YStack>

        {/* Bottom-right Metrics */}
        {!hideMetrics && <MetricsContainer>
          {likes !== undefined && (
            <MetricItem>
              <Feather name="heart" size={14} color={iconColor} />
              <MetricText>{likes}</MetricText>
            </MetricItem>
          )}
          {views !== undefined && (
            <MetricItem>
              <Feather name="eye" size={14} color={iconColor} />
              <MetricText>{views}</MetricText>
            </MetricItem>
          )}
        </MetricsContainer>}
      </XStack>
    </CardContainer>
  );
};
