import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { Text } from "@/components/Text";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = TextInputProps & {
  label: string;
};

export function Input({ label, secureTextEntry, style, ...rest }: Props) {
  const colors = useTheme();

  const isPassword = !!secureTextEntry;
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.container}>
      <Text size="sm" weight="semibold" color="text">
        {label}
      </Text>

      <View style={[styles.field, { borderColor: colors.border }]}>
        <TextInput
          {...rest}
          secureTextEntry={isPassword && hidden}
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { color: colors.text }, style]}
        />

        {isPassword && (
          <Pressable
            onPress={() => setHidden((prev) => !prev)}
            hitSlop={Spacing.two}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
          >
            <Feather
              name={hidden ? "eye" : "eye-off"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
});
