import { Feather } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = ViewProps & {
  title: string;
  message?: ReactNode;
  icon?: keyof typeof Feather.glyphMap;
};

export function EmptyState({
  title,
  message,
  icon = "inbox",
  style,
  ...rest
}: Props) {
  const colors = useTheme();

  return (
    <View {...rest} style={[styles.container, style]}>
      <View
        style={[styles.iconWrapper, { backgroundColor: colors.primarySoft }]}
      >
        <Feather name={icon} size={24} color={colors.primary} />
      </View>

      <Text size="md" weight="semibold" style={styles.text}>
        {title}
      </Text>

      {message && (
        <Text size="sm" color="textSecondary" style={styles.text}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
    marginBottom: Spacing.two,
  },
  text: {
    textAlign: "center",
  },
});
