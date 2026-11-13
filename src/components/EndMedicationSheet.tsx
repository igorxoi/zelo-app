import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { endMedication, type Medication } from "@/services/medications";

type Props = {
  medication: Medication;
  onClose: () => void;
  onEnded: () => void;
};

export function EndMedicationSheet({ medication, onClose, onEnded }: Props) {
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
      await endMedication(medication.id);

      showSnackbar({
        variant: "success",
        title: "Medicamento encerrado",
        message:
          "Ele não aparece mais na lista de remédios ativos do paciente, mas o histórico de doses continua disponível.",
      });
      onEnded();
      onClose();
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível encerrar",
        message:
          "Algo deu errado ao tentar encerrar esse medicamento. Tente novamente em instantes.",
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
      title="Encerrar este medicamento?"
      subtitle={`O tratamento com ${medication.name} já foi finalizado. Ao confirmar, ele deixa de aparecer na lista de remédios do paciente, mas o histórico de doses já registradas continua disponível.`}
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
            Sim, encerrar medicamento
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClose}
          disabled={isSubmitting}
          accessibilityRole="button"
          style={styles.cancelButton}
        >
          <Text size="sm" weight="semibold" color="primary">
            Cancelar
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
    cancelButton: {
      alignSelf: "center",
      padding: Spacing.two,
    },
    pressed: {
      opacity: 0.8,
    },
  });
