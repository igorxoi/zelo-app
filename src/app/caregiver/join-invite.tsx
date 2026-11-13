import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader } from "@/components/BackHeader";
import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import {
  formatInviteCode,
  isInviteCode,
  normalizeInviteCode,
} from "@/utils/invite";

export default function JoinInvite() {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState("");
  const isValid = isInviteCode(code);
  const showError = code.length === 8 && !isValid;

  const handleContinue = () => {
    if (!isValid) return;
    router.push(`/invite/${code}` as Href);
  };

  return (
    <View style={styles.screen}>
      <BackHeader title="Tenho um convite" />

      <View style={styles.content}>
        <Input
          label="Código do convite"
          placeholder="XXXX-XXXX"
          value={formatInviteCode(code)}
          onChangeText={(text) => setCode(normalizeInviteCode(text))}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={9}
        />

        <Text size="xs" color={showError ? "danger" : "placeholder"}>
          {showError
            ? "Confira o código: ele não tem os caracteres 0, 1, I nem O."
            : "O cuidador master envia o código por WhatsApp ou e-mail. Você precisa estar logado com o e-mail que recebeu o convite."}
        </Text>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Spacing.three + insets.bottom },
        ]}
      >
        <Pressable
          onPress={handleContinue}
          disabled={!isValid}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid }}
          style={({ pressed }) => [
            styles.button,
            !isValid && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text
            size="sm"
            weight="semibold"
            color={isValid ? "onPrimary" : "textSecondary"}
          >
            Continuar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: Spacing.three,
      gap: Spacing.one,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    button: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    buttonDisabled: {
      backgroundColor: colors.backgroundSelected,
    },
    pressed: {
      opacity: 0.8,
    },
  });
