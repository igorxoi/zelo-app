import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { cancelCaregiverInvite, type Caregiver } from "@/services/patients";

type Props = {
  patientId: string;
  caregiver: Caregiver;
  onClose: () => void;
  onCancelled: () => void;
};

export function CancelInviteSheet({
  patientId,
  caregiver,
  onClose,
  onCancelled,
}: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSnackbar } = useSnackbar();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await cancelCaregiverInvite(patientId, caregiver.id);

      showSnackbar({
        variant: "success",
        title: "Convite cancelado",
        message: `O link enviado para ${caregiver.name} não funciona mais.`,
      });
      onCancelled();
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível cancelar",
        message:
          "Algo deu errado ao cancelar o convite. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible
      onClose={handleClose}
      loading={isSubmitting}
      title="Cancelar este convite?"
      subtitle={`O link enviado para ${caregiver.name} deixará de funcionar. Se mudar de ideia, você pode gerar um novo convite depois.`}
    >
      <View style={styles.actions}>
        <Pressable
          onPress={handleConfirm}
          disabled={isSubmitting}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.pressed,
          ]}
        >
          <Text size="sm" weight="semibold" color="onPrimary">
            Sim, cancelar convite
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClose}
          disabled={isSubmitting}
          accessibilityRole="button"
          style={styles.backButton}
        >
          <Text size="sm" weight="semibold" color="primary">
            Voltar
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    actions: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      gap: Spacing.two,
    },
    confirmButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.danger,
      borderRadius: Radius.md,
    },
    backButton: {
      alignSelf: "center",
      padding: Spacing.two,
    },
    pressed: {
      opacity: 0.8,
    },
  });
