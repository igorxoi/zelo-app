import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewProps } from "react-native";

import { Text } from "@/components/Text";
import { Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import type { PatientDose } from "@/services/doses";

type Props = ViewProps & {
  dose: PatientDose;
  disabled?: boolean;
  onTake: (dose: PatientDose) => void;
  onSkip: (dose: PatientDose) => void;
};

const ICON_BOX_SIZE = 40;
const ICON_SIZE = 22;
const ACTION_ICON_SIZE = 18;

/**
 * Card de uma dose pendente no app do paciente. Dois botões grandes e com
 * poucas palavras, pensados para idosos: "Tomei" e "Não tomei".
 */
export function PatientDoseCard({
  dose,
  disabled = false,
  onTake,
  onSkip,
  style,
  ...rest
}: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const PillIcon = Icons.pill;

  return (
    <View {...rest} style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <PillIcon
            width={ICON_SIZE}
            height={ICON_SIZE}
            color={colors.primary}
          />
        </View>

        <View style={styles.info}>
          <Text size="md" weight="bold">
            {dose.name}, {dose.dosage}
          </Text>
          <Text size="sm" color="textSecondary">
            {dose.scheduledTime}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onTake(dose)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Tomei ${dose.name}`}
        style={({ pressed }) => [
          styles.button,
          styles.takeButton,
          (pressed || disabled) && styles.pressed,
        ]}
      >
        <Feather
          name="check"
          size={ACTION_ICON_SIZE}
          color={colors.onPrimary}
        />
        <Text size="sm" weight="semibold" color="onPrimary">
          Tomei
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onSkip(dose)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Não tomei ${dose.name}`}
        style={({ pressed }) => [
          styles.button,
          styles.skipButton,
          (pressed || disabled) && styles.pressed,
        ]}
      >
        <Feather name="x" size={ACTION_ICON_SIZE} color={colors.onPrimary} />
        <Text size="sm" weight="semibold" color="onPrimary">
          Não tomei
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.two,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      marginBottom: Spacing.one,
    },
    iconBox: {
      width: ICON_BOX_SIZE,
      height: ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    info: {
      flex: 1,
    },
    button: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
      borderRadius: Radius.md,
    },
    takeButton: {
      backgroundColor: colors.primary,
    },
    skipButton: {
      backgroundColor: colors.danger,
    },
    pressed: {
      opacity: 0.8,
    },
  });
