import React from "react";
import { styled, XStack, Text, XStackProps, Spinner } from "tamagui";

const StyledButtonBase = styled(XStack, {
  name: "PrimaryButton",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  width: "100%",
  gap: "$2",

  pressStyle: {
    opacity: 0.88,
    scale: 0.98,
  },
});

const StyledButtonText = styled(Text, {
  name: "PrimaryButtonText",
  textAlign: "center",
  letterSpacing: -0.2,
});

export interface PrimaryButtonProps extends Omit<XStackProps, "children"> {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  textColor?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  textColor,
  backgroundColor,
  iconLeft,
  iconRight,
  ...props
}) => {
  // Determine size styling
  const sizeStyles = {
    sm: { minHeight: 38, paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
    md: { minHeight: 48, paddingVertical: 13, paddingHorizontal: 20, fontSize: 15 },
    lg: { minHeight: 54, paddingVertical: 15, paddingHorizontal: 24, fontSize: 16 },
  }[size];

  // Resolve background and text colors based on variant
  let defaultBg = "$primary";
  let defaultTextColor = "$primaryContrast";
  let borderWidth = 0;
  let borderColor = "$borderColor";
  let fontWeight: "600" | "700" | "800" = "700";

  if (variant === "secondary") {
    defaultBg = "$surfaceSubtle";
    defaultTextColor = "$textPrimary";
    borderWidth = 1;
    borderColor = "$borderColor";
    fontWeight = "600";
  } else if (variant === "ghost") {
    defaultBg = "transparent";
    defaultTextColor = "$textPrimary";
    borderWidth = 0;
    fontWeight = "600";
  } else if (variant === "accent") {
    defaultBg = "$accent";
    defaultTextColor = "#FFFFFF";
    borderWidth = 0;
    fontWeight = "700";
  }

  // Handle explicit caller overrides for backwards compatibility
  const isCustomSecondary =
    backgroundColor === "$surfaceBg" ||
    backgroundColor === "$cardBg" ||
    backgroundColor === "transparent";

  const resolvedBg = backgroundColor ?? defaultBg;
  const resolvedTextColor =
    textColor ?? (isCustomSecondary ? "$textPrimary" : defaultTextColor);
  const resolvedBorderWidth = isCustomSecondary ? 1 : borderWidth;

  return (
    <StyledButtonBase
      onPress={onPress}
      disabled={disabled || loading}
      opacity={disabled ? 0.4 : 1}
      backgroundColor={resolvedBg}
      borderWidth={resolvedBorderWidth}
      borderColor={borderColor}
      minHeight={sizeStyles.minHeight}
      paddingVertical={sizeStyles.paddingVertical}
      paddingHorizontal={sizeStyles.paddingHorizontal}
      {...props}>
      {loading ? (
        <Spinner size="small" color={resolvedTextColor} />
      ) : (
        <>
          {iconLeft}
          <StyledButtonText
            color={resolvedTextColor}
            fontSize={sizeStyles.fontSize}
            fontWeight={fontWeight}>
            {title}
          </StyledButtonText>
          {iconRight}
        </>
      )}
    </StyledButtonBase>
  );
};

// Generic alias
export const Button = PrimaryButton;
