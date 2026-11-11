import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Tag } from "@/components/Tag";
import { Text } from "@/components/Text";
import { ICON_SIZE, Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { getMedicationSummary, type Medication } from "@/services/medications";

type Props = {
  medication: Medication;
  onDeletePress: (medication: Medication) => void;
};

export function MedicationCard({ medication, onDeletePress }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const PillIcon = Icons.pill;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <PillIcon width={ICON_SIZE} height={ICON_SIZE} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View>
          <Text size="sm" weight="bold">
            {medication.name}
          </Text>
          <Text size="xs" color="textSecondary">
            {medication.dosage}
          </Text>
        </View>

        {medication.times.length > 0 && (
          <View style={styles.times}>
            {medication.times.map((time) => (
              <Tag key={time} label={time} variant="medication" />
            ))}
          </View>
        )}

        <Text size="xs" color="textSecondary">
          {getMedicationSummary(medication)}
        </Text>
      </View>

      <Pressable
        onPress={() => onDeletePress(medication)}
        hitSlop={Spacing.two}
        accessibilityRole="button"
        accessibilityLabel={`Encerrar ${medication.name}`}
        style={styles.deleteButton}
      >
        <Feather name="trash-2" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    content: {
      flex: 1,
      gap: Spacing.two,
    },
    times: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.two,
    },
    deleteButton: {
      padding: Spacing.one,
    },
  });
