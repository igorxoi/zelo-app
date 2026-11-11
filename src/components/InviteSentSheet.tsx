import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useMemo } from "react";
import { Pressable, Share, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  caregiverName: string;
  link: string;
  onClose: () => void;
};

const COPY_ICON_SIZE = 18;

export function InviteSentSheet({ caregiverName, link, onClose }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSnackbar } = useSnackbar();

  const firstName = caregiverName.trim().split(/\s+/)[0];
  const displayLink = link.replace(/^https?:\/\//, "");

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(link);

      showSnackbar({
        variant: "success",
        title: "Link copiado",
        message: "Agora é só colar na conversa com o cuidador.",
      });
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível copiar",
        message: "Tente novamente em instantes.",
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Você foi convidado(a) para cuidar de um paciente no Zelo. Acesse o link: ${link}\nEle vale por 7 dias e só pode ser usado uma vez.`,
      });
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível compartilhar",
        message: "Tente novamente em instantes.",
      });
    }
  };

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title="Convite enviado"
      subtitle={`Envie o link para ${firstName}. Ele vale por 7 dias e só pode ser usado uma vez.`}
    >
      <View style={styles.content}>
        <View style={styles.linkField}>
          <Text size="sm" weight="semibold">
            Link do convite
          </Text>

          <View style={styles.linkBox}>
            <Text size="sm" style={styles.linkText} numberOfLines={1}>
              {displayLink}
            </Text>

            <Pressable
              onPress={handleCopy}
              hitSlop={Spacing.two}
              accessibilityRole="button"
              accessibilityLabel="Copiar link"
            >
              <Feather
                name="copy"
                size={COPY_ICON_SIZE}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.shareButton,
              pressed && styles.pressed,
            ]}
          >
            <Text size="sm" weight="semibold" color="onPrimary">
              Compartilhar link
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={styles.doneButton}
          >
            <Text size="sm" weight="semibold" color="primary">
              Concluir
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    content: {
      gap: Spacing.three,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
    },
    linkField: {
      gap: Spacing.two,
    },
    linkBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
      height: 48,
      paddingHorizontal: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    linkText: {
      flex: 1,
    },
    actions: {
      gap: Spacing.two,
    },
    shareButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    doneButton: {
      alignSelf: "center",
      padding: Spacing.two,
    },
    pressed: {
      opacity: 0.8,
    },
  });
