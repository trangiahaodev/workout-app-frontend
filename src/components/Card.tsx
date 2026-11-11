import { styled, YStack, GetProps } from "tamagui";

export const Card = styled(YStack, {
  name: "Card",
  backgroundColor: "$cardBg",
  borderRadius: 14,
  padding: "$4",
  marginBottom: "$4",
  borderWidth: 1,
  borderColor: "$borderColor",
  overflow: "hidden",

  variants: {
    variant: {
      elevated: {
        backgroundColor: "$cardBg",
        borderWidth: 1,
        borderColor: "$borderColor",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      },
      flat: {
        backgroundColor: "$surfaceSubtle",
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
      outlined: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$borderColor",
        elevation: 0,
        shadowOpacity: 0,
      },
    },
    pressable: {
      true: {
        pressStyle: {
          scale: 0.985,
          opacity: 0.92,
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: "elevated",
  },
});

export type CardProps = GetProps<typeof Card>;
