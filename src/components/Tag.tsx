import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type TagVariant = "medication" | "abnormality";

type Props = {
  label: string;
  variant?: TagVariant;
};

export function Tag({ label, variant = "medication" }: Props) {
  const colors = useTheme();

  const isAbnormality = variant === "abnormality";

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: isAbnormality
            ? colors.dangerSoft
            : colors.primarySoft,
        },
      ]}
    >
      <Text
        size="xs"
        weight="medium"
        color={isAbnormality ? "danger" : "primary"}
      >
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
