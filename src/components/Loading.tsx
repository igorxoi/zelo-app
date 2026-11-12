import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useLoadingContext } from "@/contexts/LoadingContext";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  fullScreen?: boolean;
  contained?: boolean;
};

export function Loading({ contained = false }: Props) {
  const colors = useTheme();
  const loadingContext = useLoadingContext();

  const global = contained ? null : loadingContext;

  useEffect(() => {
    if (!global) return;

    return global.register();
  }, [global]);

  if (global) return null;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
      style={[
        styles.container,
        StyleSheet.absoluteFill,
        { backgroundColor: colors.background },
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
