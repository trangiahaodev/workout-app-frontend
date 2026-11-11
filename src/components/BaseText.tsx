import React from "react";
import { styled, Text, GetProps } from "tamagui";

export const BaseText = styled(Text, {
  name: "BaseText",
  color: "$textPrimary",
  fontSize: 15,
  fontWeight: "400",

  variants: {
    variant: {
      display: {
        fontSize: 32,
        fontWeight: "800",
        color: "$textPrimary",
        letterSpacing: -0.8,
      },
      title: {
        fontSize: 22,
        fontWeight: "800",
        color: "$textPrimary",
        letterSpacing: -0.4,
      },
      subtitle: {
        fontSize: 15,
        fontWeight: "500",
        color: "$textSecondary",
        lineHeight: 22,
      },
      body: {
        fontSize: 14,
        fontWeight: "400",
        color: "$textSecondary",
        lineHeight: 20,
      },
      dataLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "$textSecondary",
        letterSpacing: 0.2,
      },
      dataValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "$textPrimary",
        letterSpacing: -0.5,
      },
      caption: {
        fontSize: 12,
        fontWeight: "400",
        color: "$textTertiary",
      },
    },
  } as const,
});

export type BaseTextProps = GetProps<typeof BaseText>;

// Semantic Typography Sub-components for ergonomic usage
export const Title: React.FC<BaseTextProps> = (props) => (
  <BaseText variant="title" {...props} />
);

export const Subtitle: React.FC<BaseTextProps> = (props) => (
  <BaseText variant="subtitle" {...props} />
);

export const Body: React.FC<BaseTextProps> = (props) => (
  <BaseText variant="body" {...props} />
);

export const DataLabel: React.FC<BaseTextProps> = (props) => (
  <BaseText variant="dataLabel" {...props} />
);

export const DataValue: React.FC<BaseTextProps> = (props) => (
  <BaseText variant="dataValue" {...props} />
);

export const Caption: React.FC<BaseTextProps> = (props) => (
  <BaseText variant="caption" {...props} />
);
