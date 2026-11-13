import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
};

export function PageHeader({ title, showBackButton = true, onBack }: Props) {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.backgroundSelected,
          paddingTop: insets.top + Spacing.three,
        },
      ]}
    >
      {showBackButton ? (
        <Pressable
          onPress={handleBack}
          style={styles.side}
          hitSlop={Spacing.two}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}

      <Text weight="semibold" style={styles.title} accessibilityRole="header">
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
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
});
