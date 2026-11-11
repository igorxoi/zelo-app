import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Avatar, getInitials } from "@/components/Avatar";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import type { Caregiver } from "@/services/patients";

type Props = {
  caregiver: Caregiver;
  showPhone?: boolean;
  onPress?: () => void;
};

const AVATAR_SIZE = 48;
const CHEVRON_SIZE = 20;

export function CaregiverCard({ caregiver, showPhone, onPress }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isPending = caregiver.status === "pending";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Avatar size={AVATAR_SIZE} initials={getInitials(caregiver.name)} />

      <View style={styles.info}>
        <Text size="md" weight="bold">
          {caregiver.name}
        </Text>
        <Text size="xs" color="textSecondary">
          {caregiver.email}
        </Text>
        {showPhone && caregiver.phone && (
          <Text size="xs" color="textSecondary">
            {caregiver.phone}
          </Text>
        )}
      </View>

      {isPending && (
        <View style={styles.pendingTag}>
          <Text size="xs" weight="medium" color="warning">
            Pendente
          </Text>
        </View>
      )}

      {onPress && (
        <Feather
          name="chevron-right"
          size={CHEVRON_SIZE}
          color={colors.textSecondary}
        />
      )}
    </Pressable>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
    },
    info: {
      flex: 1,
    },
    pendingTag: {
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.half,
      backgroundColor: colors.warningSoft,
      borderRadius: Radius.sm,
    },
    pressed: {
      opacity: 0.8,
    },
  });
