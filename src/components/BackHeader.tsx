import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  title: string;
  onBackPress?: () => void;
  hideBack?: boolean;
};

const ICON_SIZE = 24;

export function BackHeader({ title, onBackPress, hideBack = false }: Props) {
  const router = useRouter();
  const handleBack = onBackPress ?? (() => router.back());
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.three,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {hideBack ? (
        <View style={styles.side} />
      ) : (
        <Pressable
          onPress={handleBack}
          hitSlop={Spacing.two}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.side}
        >
          <Feather name="chevron-left" size={ICON_SIZE} color={colors.text} />
        </Pressable>
      )}

      <Text size="md" weight="semibold" style={styles.title}>
        {title}
      </Text>

      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  side: {
    width: Spacing.five + Spacing.two,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
});
