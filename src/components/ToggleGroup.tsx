import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
};

export function ToggleGroup<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
}: Props<T>) {
  const colors = useTheme();

  const [internal, setInternal] = useState<T | undefined>(
    defaultValue ?? options[0]?.value,
  );
  const selected = value ?? internal;

  const handlePress = (next: T) => {
    if (next === selected) return;
    setInternal(next);
    onChange?.(next);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundElement }]}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const active = option.value === selected;

        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              styles.segment,
              active && { backgroundColor: colors.background },
            ]}
          >
            <Text
              size="sm"
              weight={active ? "semibold" : "medium"}
              color={active ? "primary" : "textSecondary"}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: Spacing.two,
    gap: Spacing.two,
    borderRadius: Radius.lg,
  },
  segment: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
});
