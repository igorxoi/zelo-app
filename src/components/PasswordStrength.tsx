import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { getPasswordStrength } from "@/utils/password";

type Props = {
  password: string;
};

const TOTAL_BARS = 3;
const BAR_HEIGHT = 4;

export function PasswordStrength({ password }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const strength = getPasswordStrength(password);

  return (
    <View style={styles.container}>
      {Array.from({ length: TOTAL_BARS }, (_, index) => (
        <View
          key={index}
          style={[styles.bar, index < strength && styles.barFilled]}
        />
      ))}
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: Spacing.one,
    },
    bar: {
      flex: 1,
      height: BAR_HEIGHT,
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.sm,
    },
    barFilled: {
      backgroundColor: colors.primary,
    },
  });
