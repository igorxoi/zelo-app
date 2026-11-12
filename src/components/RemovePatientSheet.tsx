import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { deletePatient } from "@/services/patients";

type Props = {
  patientId: string;
  onClose: () => void;
  onRemoved: () => void;
};

export function RemovePatientSheet({ patientId, onClose, onRemoved }: Props) {
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
      await deletePatient(patientId);

      showSnackbar({
        variant: "success",
        title: "Paciente removido",
        message:
          "O paciente e todos os seus dados foram removidos com sucesso.",
      });
      onRemoved();
      onClose();
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível remover",
        message:
          "Algo deu errado ao tentar remover o paciente. Tente novamente em instantes.",
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
      title="Remover este paciente?"
      subtitle="Ao confirmar, todos os dados e registros do paciente serão apagados permanentemente. Essa ação não poderá ser desfeita."
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
            Sim, remover este paciente
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
