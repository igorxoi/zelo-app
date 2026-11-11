import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Text } from "@/components/Text";
import {
  FontFamily,
  FontSize,
  Radius,
  Spacing,
  type ThemeColor,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { maskTime } from "@/utils/masks";

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export function TimeListField({ label, values, onChange }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleChange = (index: number, text: string) => {
    onChange(
      values.map((value, current) =>
        current === index ? maskTime(text) : value,
      ),
    );
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, current) => current !== index));
  };

  const handleAdd = () => onChange([...values, ""]);

  return (
    <View style={styles.container}>
      <Text size="sm" weight="semibold">
        {label}
      </Text>

      {values.map((value, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            value={value}
            onChangeText={(text) => handleChange(index, text)}
            placeholder="00:00"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            maxLength={5}
            accessibilityLabel={`Horário ${index + 1}`}
            style={styles.input}
          />

          {values.length > 1 && (
            <Pressable
              onPress={() => handleRemove(index)}
              accessibilityRole="button"
              accessibilityLabel={`Remover horário ${index + 1}`}
              style={styles.removeButton}
            >
              <Feather name="x" size={20} color={colors.danger} />
            </Pressable>
          )}
        </View>
      ))}

      <Pressable onPress={handleAdd} accessibilityRole="button" hitSlop={Spacing.two}>
        <Text size="xs" weight="semibold" color="primary">
          + Adicionar horário
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.two,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    input: {
      flex: 1,
      height: 48,
      paddingHorizontal: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      color: colors.text,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
    },
    removeButton: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.dangerSoft,
      borderRadius: Radius.md,
    },
  });
