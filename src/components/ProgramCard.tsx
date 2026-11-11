import React from "react";
import { styled, YStack, XStack, Text, useTheme } from "tamagui";
import { Feather } from "@expo/vector-icons";

const CardContainer = styled(YStack, {
  name: "ProgramCardContainer",
  backgroundColor: "$cardBg",
  borderRadius: 14,
  overflow: "hidden",
  height: 190,
  marginBottom: "$4",
  justifyContent: "space-between",
  padding: "$4",
  position: "relative",
  borderWidth: 1,
  borderColor: "$borderColor",
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 12,
  elevation: 2,
  pressStyle: {
    opacity: 0.88,
    scale: 0.985,
  },
});

const Badge = styled(XStack, {
  name: "ProgramCardBadge",
  backgroundColor: "$surfaceSubtle",
  paddingHorizontal: "$2.5",
  paddingVertical: "$1",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "$borderColor",
  alignSelf: "flex-start",
  alignItems: "center",
  justifyContent: "center",
});

const BadgeText = styled(Text, {
  name: "ProgramCardBadgeText",
  color: "$textPrimary",
  fontSize: 11,
  fontWeight: "700",
  letterSpacing: 0.2,
});

const SubtitleText = styled(Text, {
  name: "ProgramCardSubtitle",
  color: "$textSecondary",
  fontSize: 12,
  fontWeight: "600",
  letterSpacing: 0.2,
  marginBottom: "$1",
});

const TitleText = styled(Text, {
  name: "ProgramCardTitle",
  color: "$textPrimary",
  fontSize: 21,
  fontWeight: "800",
  letterSpacing: -0.4,
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
  color: "$textSecondary",
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
  subtitle = "Thenx Program",
  level = "Người mới",
  likes = "11K",
  views = "25K",
  onPress,
  hideMetrics = false,
}) => {
  const theme = useTheme();
  const iconColor = theme.textSecondary?.val ?? "#6E6E73";

  return (
    <CardContainer
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Xem chương trình ${title}`}>
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
        {!hideMetrics && (
          <MetricsContainer>
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
          </MetricsContainer>
        )}
      </XStack>
    </CardContainer>
  );
};
