import { styled, Text, GetProps } from "tamagui";

export const BaseText = styled(Text, {
  name: "BaseText",
  color: "$color",
  fontSize: 16,
  fontWeight: "400",
});

export type BaseTextProps = GetProps<typeof BaseText>;
