import { styled, YStack, GetProps } from "tamagui";

export const Card = styled(YStack, {
  name: "Card",
  backgroundColor: "$cardBg",
  borderRadius: "$3",
  padding: "$4",
  marginBottom: "$4",
  borderWidth: 1,
  borderColor: "$borderColor",
  overflow: "hidden",
});

export type CardProps = GetProps<typeof Card>;
