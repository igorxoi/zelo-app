import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type TagVariant = "medication" | "abnormality" | "missed";

type Props = {
  label: string;
  variant?: TagVariant;
};

const VARIANT_COLORS = {
  medication: { background: "primarySoft", text: "primary" },
  abnormality: { background: "dangerSoft", text: "danger" },
  missed: { background: "warningSoft", text: "warning" },
} as const;

export function Tag({ label, variant = "medication" }: Props) {
  const colors = useTheme();

  const { background, text } = VARIANT_COLORS[variant];

  return (
    <View style={[styles.tag, { backgroundColor: colors[background] }]}>
      <Text size="xs" weight="medium" color={text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
  },
});
