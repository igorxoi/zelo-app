import { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Loading } from "@/components/Loading";
import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { SnackbarHost } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  children: ReactNode;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  loading = false,
  children,
}: Props) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Fechar"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: Spacing.four + insets.bottom,
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: colors.backgroundSelected },
            ]}
          />

          {title && (
            <>
              <View style={styles.header}>
                <Text size="lg" weight="semibold" style={styles.title}>
                  {title}
                </Text>

                {subtitle && (
                  <Text size="sm" weight="regular" style={styles.subtitle}>
                    {subtitle}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              />
            </>
          )}

          {children}

          {loading && <Loading fullScreen />}
        </View>

        <SnackbarHost />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    paddingTop: Spacing.two,
    borderTopLeftRadius: Radius.lg + Spacing.two,
    borderTopRightRadius: Radius.lg + Spacing.two,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.three,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    borderRadius: Radius.lg,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.one,
  },
  divider: { height: 1 },
});
