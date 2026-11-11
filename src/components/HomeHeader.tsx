import { Feather } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  name: string;
  /** Texto pequeno acima do nome. No app do paciente: "Paciente". */
  caption?: string;
  /** O app do paciente não mostra o avatar no topo. */
  showAvatar?: boolean;
  avatar?: ImageSourcePropType;
  hasNotification?: boolean;
  onNotificationPress?: () => void;
  /** Conteúdo abaixo da saudação (ex.: PatientSelect). */
  children?: ReactNode;
};

/**
 * Topo verde das telas iniciais (cuidador e paciente): saudação, sino de
 * notificações e, opcionalmente, conteúdo extra abaixo (ex.: seletor de paciente).
 */
export function HomeHeader({
  name,
  caption = "Seja bem vindo",
  showAvatar = true,
  avatar,
  hasNotification = false,
  onNotificationPress,
  children,
}: Props) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          paddingTop: insets.top + Spacing.three,
        },
      ]}
    >
      <View style={styles.top}>
        {showAvatar && (
          <View style={styles.avatar}>
            {avatar && <Image source={avatar} style={styles.avatarImage} />}
          </View>
        )}

        <View style={styles.greeting}>
          <Text size="sm" color="onPrimary" style={styles.welcome}>
            {caption}
          </Text>
          <Text size="lg" weight="semibold" color="onPrimary">
            {name}
          </Text>
        </View>

        <Pressable
          onPress={onNotificationPress}
          hitSlop={Spacing.two}
          accessibilityRole="button"
          accessibilityLabel={
            hasNotification ? "Notificações, há novas" : "Notificações"
          }
        >
          <Feather name="bell" size={24} color={colors.onPrimary} />
          {hasNotification && (
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          )}
        </Pressable>
      </View>

      {children}
    </View>
  );
}

const AVATAR_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.85)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  greeting: {
    flex: 1,
  },
  welcome: {
    opacity: 0.85,
  },
  dot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
