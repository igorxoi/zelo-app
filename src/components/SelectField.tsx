import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  label: string;
  value: T | null;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
};

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecione",
}: Props<T>) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  const handleSelect = (next: T) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text size="sm" weight="semibold">
        {label}
      </Text>

      <Pressable
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        style={styles.field}
      >
        <Text
          size="sm"
          color={selected ? "text" : "placeholder"}
          numberOfLines={1}
          style={styles.value}
        >
          {selected?.label ?? placeholder}
        </Text>

        <Feather name="chevron-down" size={20} color={colors.textSecondary} />
      </Pressable>

      <BottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
      >
        <View>
          {options.map((option) => {
            const checked = option.value === value;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <Text
                  size="sm"
                  weight={checked ? "semibold" : "regular"}
                  color={checked ? "primary" : "text"}
                >
                  {option.label}
                </Text>

                {checked && (
                  <Feather name="check" size={18} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.two,
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    value: {
      flex: 1,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
    },
    pressed: {
      backgroundColor: colors.backgroundElement,
    },
  });
