import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  total: number;
  current: number;
};

const BAR_HEIGHT = 4;

export function StepProgress({ total, current }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[styles.bar, index < current && styles.barFilled]}
        />
      ))}
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: Spacing.two,
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
