import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  onClose: () => void;
};

const SUPPORT_EMAIL = "suporte@zelo.app";
const SUPPORT_WHATSAPP = "(11) 99999-9999";

const TIPS = [
  "Atendimento de segunda a sexta, das 9h às 18h.",
  "Pelo WhatsApp a resposta costuma ser mais rápida que por e-mail.",
  "Se for sobre um medicamento específico, tenha o nome dele em mãos.",
];

const CONTACT_ICON_BOX_SIZE = 40;
const CONTACT_ICON_SIZE = 20;
const TIPS_ICON_SIZE = 18;

export function SupportSheet({ onClose }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSnackbar } = useSnackbar();

  const InfoIcon = Icons.info;

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível abrir",
        message: "Tente entrar em contato pelo outro canal.",
      });
    }
  };

  return (
    <BottomSheet visible onClose={onClose} title="Ajuda e suporte">
      <View style={styles.content}>
        <Pressable
          onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)}
          accessibilityRole="link"
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.contactIcon}>
            <Feather
              name="mail"
              size={CONTACT_ICON_SIZE}
              color={colors.onPrimary}
            />
          </View>

          <View>
            <Text size="sm" weight="bold">
              E-mail
            </Text>
            <Text size="xs" color="textSecondary">
              {SUPPORT_EMAIL}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() =>
            openLink(`https://wa.me/55${SUPPORT_WHATSAPP.replace(/\D/g, "")}`)
          }
          accessibilityRole="link"
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.contactIcon}>
            <Feather
              name="message-circle"
              size={CONTACT_ICON_SIZE}
              color={colors.onPrimary}
            />
          </View>

          <View>
            <Text size="sm" weight="bold">
              Whatsapp
            </Text>
            <Text size="xs" color="textSecondary">
              {SUPPORT_WHATSAPP}
            </Text>
          </View>
        </Pressable>

        <View style={[styles.card, styles.tipsCard]}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIcon}>
              <InfoIcon
                width={TIPS_ICON_SIZE}
                height={TIPS_ICON_SIZE}
                color={colors.primary}
              />
            </View>

            <Text size="sm" weight="bold">
              Antes de chamar a gente
            </Text>
          </View>

          <View style={styles.tips}>
            {TIPS.map((tip) => (
              <View key={tip} style={styles.tip}>
                <Text size="xs" color="textSecondary">
                  •
                </Text>
                <Text size="xs" color="textSecondary" style={styles.tipText}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    content: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
    },
    contactIcon: {
      width: CONTACT_ICON_BOX_SIZE,
      height: CONTACT_ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    tipsCard: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: Spacing.three,
    },
    tipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    tipsIcon: {
      width: CONTACT_ICON_BOX_SIZE,
      height: CONTACT_ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    tips: {
      gap: Spacing.two,
    },
    tip: {
      flexDirection: "row",
      gap: Spacing.two,
    },
    tipText: {
      flex: 1,
    },
    pressed: {
      opacity: 0.8,
    },
  });
