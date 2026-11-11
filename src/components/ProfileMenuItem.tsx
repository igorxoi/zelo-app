import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Tag } from "@/components/Tag";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  badge?: string;
  onPress: () => void;
};

const ICON_BOX_SIZE = 36;
const ICON_SIZE = 18;
const CHEVRON_SIZE = 20;

export function ProfileMenuItem({ icon, label, badge, onPress }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Feather name={icon} size={ICON_SIZE} color={colors.primary} />
      </View>

      <Text size="sm" weight="medium" style={styles.label}>
        {label}
      </Text>

      {badge && <Tag label={badge} variant="medication" />}

      <Feather
        name="chevron-right"
        size={CHEVRON_SIZE}
        color={colors.textSecondary}
      />
    </Pressable>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBox: {
      width: ICON_BOX_SIZE,
      height: ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    label: {
      flex: 1,
    },
    pressed: {
      opacity: 0.8,
    },
  });
