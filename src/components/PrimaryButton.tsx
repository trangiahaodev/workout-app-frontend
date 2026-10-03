import React from "react";
import { styled, YStack, Text, YStackProps } from "tamagui";

const StyledButton = styled(YStack, {
  name: "PrimaryButton",
  backgroundColor: "$primary",
  paddingVertical: "$3.5",
  paddingHorizontal: "$4",
  borderRadius: "$3",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",

  pressStyle: {
    opacity: 0.85,
    scale: 0.99,
  },
});

const StyledButtonText = styled(Text, {
  name: "PrimaryButtonText",
  color: "$white",
  fontWeight: "700",
  fontSize: 16,
  textAlign: "center",
});

export interface PrimaryButtonProps extends Omit<YStackProps, "children"> {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      onPress={onPress}
      disabled={disabled}
      opacity={disabled ? 0.5 : 1}
      {...props}>
      <StyledButtonText>{title}</StyledButtonText>
    </StyledButton>
  );
};
