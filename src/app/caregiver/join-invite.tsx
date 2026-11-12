import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader } from "@/components/BackHeader";
import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { extractInviteToken } from "@/utils/invite";

export default function JoinInvite() {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [text, setText] = useState("");
  const token = extractInviteToken(text);
  const showError = text.trim().length > 0 && !token;

  const handleContinue = () => {
    if (!token) return;
    router.push(`/invite/${token}` as Href);
  };

  return (
    <View style={styles.screen}>
      <BackHeader title="Tenho um convite" />

      <View style={styles.content}>
        <Input
          label="Link ou código do convite"
          placeholder="Cole aqui o que você recebeu"
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text size="xs" color={showError ? "danger" : "placeholder"}>
          {showError
            ? "Não parece um convite. Confira o link que você recebeu."
            : "O cuidador master envia o link por WhatsApp ou e-mail."}
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
          disabled={!token}
          accessibilityRole="button"
          accessibilityState={{ disabled: !token }}
          style={({ pressed }) => [
            styles.button,
            !token && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text
            size="sm"
            weight="semibold"
            color={token ? "onPrimary" : "textSecondary"}
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
