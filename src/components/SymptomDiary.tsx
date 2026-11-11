import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { SYMPTOMS, type SymptomType } from "@/services/symptoms";

type Props = {
  disabled?: boolean;
  onSelect: (symptom: SymptomType) => void;
};

const EMOJI_BOX_SIZE = 48;

/**
 * Diário de sintomas do app do paciente: "Como está se sentindo hoje?".
 * Um toque em um emoji já registra o relato (sem formulário), para ser
 * simples para o idoso. O relato aparece no histórico e nas notificações
 * do cuidador.
 */
export function SymptomDiary({ disabled = false, onSelect }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View>
        <Text size="md" weight="bold">
          Diário
        </Text>
        <Text size="sm" color="textSecondary">
          Como está se sentindo hoje?
        </Text>
      </View>

      <View style={styles.row}>
        {SYMPTOMS.map((symptom) => (
          <Pressable
            key={symptom.value}
            onPress={() => onSelect(symptom.value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={symptom.label}
            style={({ pressed }) => [
              styles.item,
              (pressed || disabled) && styles.pressed,
            ]}
          >
            <View style={styles.emojiBox}>
              <Text size="xl">{symptom.emoji}</Text>
            </View>
            <Text size="xs" weight="semibold" style={styles.label}>
              {symptom.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.three,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    item: {
      alignItems: "center",
      gap: Spacing.one,
      flex: 1,
    },
    emojiBox: {
      width: EMOJI_BOX_SIZE,
      height: EMOJI_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundElement,
      borderRadius: EMOJI_BOX_SIZE / 2,
    },
    label: {
      textAlign: "center",
    },
    pressed: {
      opacity: 0.6,
    },
  });
