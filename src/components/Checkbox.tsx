import { Feather } from "@expo/vector-icons";
import { type ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const BOX_SIZE = 20;

export function Checkbox({ label, checked, onChange }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={styles.container}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Feather name="check" size={14} color={colors.onPrimary} />}
      </View>

      <Text size="xs">{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    box: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.one,
    },
    boxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });
