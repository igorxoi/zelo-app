import { StyleSheet, View, ViewProps } from "react-native";

import { Text } from "@/components/Text";
import { ICON_SIZE, Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type CardVariant = "info" | "success" | "warning" | "error";

type Props = ViewProps & {
  variant: CardVariant;
  title: string;
  message?: string;
};

const VARIANT_COLORS: Record<
  CardVariant,
  { main: ThemeColor; soft: ThemeColor }
> = {
  error: { main: "danger", soft: "dangerSoft" },
  info: { main: "info", soft: "infoSoft" },
  success: { main: "primary", soft: "primarySoft" },
  warning: { main: "warning", soft: "warningSoft" },
};

export function NoticeCard({ variant, title, message, style, ...rest }: Props) {
  const colors = useTheme();

  const { main, soft } = VARIANT_COLORS[variant];
  const Icon = Icons[variant];

  return (
    <View
      {...rest}
      accessibilityRole="alert"
      style={[styles.container, { borderColor: colors.border }, style]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: colors[soft] }]}>
          {Icon && (
            <Icon width={ICON_SIZE} height={ICON_SIZE} color={colors[main]} />
          )}
        </View>

        <Text size="sm" weight="bold" style={styles.title}>
          {title}
        </Text>
      </View>

      {message && (
        <Text size="xs" color="textSecondary" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  title: {
    flex: 1,
  },
  message: {
    marginTop: Spacing.two,
  },
});
