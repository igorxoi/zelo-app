import {
  ActivityIndicator,
  StyleSheet,
  View
} from "react-native";

import { useTheme } from "@/hooks/useTheme";

type Props = {
  fullScreen?: boolean;
};

export function Loading({ fullScreen = false }: Props) {
  const colors = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
      style={[
        styles.container,
        fullScreen && StyleSheet.absoluteFill,
        fullScreen && { backgroundColor: colors.background },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
