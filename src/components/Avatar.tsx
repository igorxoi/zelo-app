import { StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  size: number;
  initials?: string;
  backgroundColor?: ThemeColor;
};

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";

  return (first + last).toUpperCase();
}

export function Avatar({ size, initials, backgroundColor = "primary" }: Props) {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors[backgroundColor],
        },
      ]}
    >
      {initials ? (
        <Text size="md" weight="bold" color="onPrimary">
          {initials}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
