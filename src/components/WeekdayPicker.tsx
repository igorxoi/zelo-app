import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { WEEKDAYS, type Weekday } from "@/services/medications";

type Props = {
  label: string;
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
};

const CHIP_SIZE = 36;

export function WeekdayPicker({ label, value, onChange }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleToggle = (day: Weekday) => {
    const next = value.includes(day)
      ? value.filter((current) => current !== day)
      : [...value, day];

    onChange(
      WEEKDAYS.filter((weekday) => next.includes(weekday.value)).map(
        (weekday) => weekday.value,
      ),
    );
  };

  return (
    <View style={styles.container}>
      <Text size="sm" weight="semibold">
        {label}
      </Text>

      <View style={styles.chips}>
        {WEEKDAYS.map((day) => {
          const checked = value.includes(day.value);

          return (
            <Pressable
              key={day.value}
              onPress={() => handleToggle(day.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              style={[styles.chip, checked && styles.chipChecked]}
            >
              <Text
                size="xs"
                weight="semibold"
                color={checked ? "onPrimary" : "primary"}
              >
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.two,
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.two,
    },
    chip: {
      width: CHIP_SIZE,
      height: CHIP_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: CHIP_SIZE / 2,
    },
    chipChecked: {
      backgroundColor: colors.primary,
    },
  });
