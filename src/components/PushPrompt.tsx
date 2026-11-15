import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { usePush } from "@/hooks/usePush";
import { useTheme } from "@/hooks/useTheme";
import type { Profile } from "@/services/auth";
import { PUSH_HINTS } from "@/services/push";

type Props = {
  profile: Profile;
};

const ICON_BOX_SIZE = 36;
const ICON_SIZE = 18;

export function PushPrompt({ profile }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSnackbar } = useSnackbar();
  const { status, busy, enable } = usePush(profile);

  if (status !== "off" && status !== "needs-install") return null;

  const handleEnable = async () => {
    if (busy) return;

    try {
      await enable();
      showSnackbar({
        variant: "success",
        title: "Lembretes ativados",
        message: "Você será avisado na hora de cada remédio.",
      });
    } catch (error) {
      showSnackbar({
        variant: "error",
        title: "Não foi possível ativar",
        message:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Feather name="bell" size={ICON_SIZE} color={colors.primary} />
        </View>

        <View style={styles.text}>
          <Text size="md" weight="bold">
            Receber lembretes no celular
          </Text>
          <Text size="sm" color="textSecondary">
            {status === "needs-install"
              ? PUSH_HINTS["needs-install"].message
              : "Ative para ser avisado na hora de tomar cada remédio."}
          </Text>
        </View>
      </View>

      {status === "off" && (
        <Pressable
          onPress={handleEnable}
          disabled={busy}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            (pressed || busy) && styles.pressed,
          ]}
        >
          <Text size="sm" weight="semibold" color="onPrimary">
            Ativar lembretes
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    iconBox: {
      width: ICON_BOX_SIZE,
      height: ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    text: {
      flex: 1,
    },
    button: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    pressed: {
      opacity: 0.8,
    },
  });
