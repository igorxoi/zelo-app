import { type ComponentRef, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Text } from "@/components/Text";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  label?: string;
  helper?: string;
  length?: number;
  value?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
};

export function CodeInput({
  label,
  helper,
  length = 6,
  value,
  onChange,
  onComplete,
}: Props) {
  const colors = useTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [internal, setInternal] = useState("");
  const [focused, setFocused] = useState(false);

  const code = value ?? internal;

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, "").slice(0, length);
    setInternal(next);
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text size="sm" weight="semibold">
          {label}
        </Text>
      )}

      <Pressable onPress={() => inputRef.current?.focus()}>
        <View style={styles.row}>
          {Array.from({ length }).map((_, index) => {
            const digit = code[index] ?? "";
            const isActive =
              focused && index === Math.min(code.length, length - 1);

            return (
              <View
                key={index}
                style={[
                  styles.box,
                  {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Text size="lg" weight="semibold">
                  {digit}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Input real, invisível: cuida de teclado, colar e autopreenchimento */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={length}
          caretHidden
          style={styles.hiddenInput}
          accessibilityLabel={label ?? "Código"}
        />
      </Pressable>

      {helper && (
        <Text size="xs" color="textSecondary" style={styles.helper}>
          {helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  box: {
    flex: 1,
    aspectRatio: 0.85,
    maxHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
  },
  helper: {
    textAlign: "center",
  },
});
