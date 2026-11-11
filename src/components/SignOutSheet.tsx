import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  /** Explica o que acontece ao sair (muda entre paciente e cuidador). */
  description: string;
  /** Aviso opcional com ícone de informação (ex.: "Quem cuida de você será avisado."). */
  notice?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

const INFO_ICON_SIZE = 16;

/**
 * Confirmação de "Sair da conta", usada no perfil do paciente e do cuidador.
 * "Continuar no app" fecha o painel; "Sair da conta" executa onConfirm
 * (que deve limpar a sessão e voltar para o login).
 */
export function SignOutSheet({
  description,
  notice,
  onConfirm,
  onClose,
}: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const InfoIcon = Icons.info;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible
      onClose={handleClose}
      loading={isSubmitting}
      title="Sair da conta?"
      subtitle={description}
    >
      <View style={styles.content}>
        {notice && (
          <View style={styles.notice}>
            <InfoIcon
              width={INFO_ICON_SIZE}
              height={INFO_ICON_SIZE}
              color={colors.textSecondary}
            />
            <Text size="xs" color="textSecondary">
              {notice}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleClose}
          disabled={isSubmitting}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.stayButton,
            pressed && styles.pressed,
          ]}
        >
          <Text size="sm" weight="semibold" color="onPrimary">
            Continuar no app
          </Text>
        </Pressable>

        <Pressable
          onPress={handleConfirm}
          disabled={isSubmitting}
          accessibilityRole="button"
          style={styles.signOutButton}
        >
          <Text size="sm" weight="semibold" color="danger">
            Sair da conta
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      gap: Spacing.two,
    },
    notice: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
      marginBottom: Spacing.one,
    },
    stayButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    signOutButton: {
      alignSelf: "center",
      padding: Spacing.two,
    },
    pressed: {
      opacity: 0.8,
    },
  });
