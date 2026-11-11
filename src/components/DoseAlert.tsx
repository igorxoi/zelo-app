import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, ViewProps } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { ToggleGroup } from "@/components/ToggleGroup";
import { Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import {
  confirmDose,
  type DoseStatus,
  type Medication,
} from "@/services/doses";

type Props = ViewProps & {
  medication: Medication;
};

const STATUS_OPTIONS = [
  { label: "No horário", value: "onTime" },
  { label: "Com atraso", value: "late" },
  { label: "Não tomou", value: "missed" },
] as const;

const ICON_SIZE = 22;

/**
 * Alerta de dose não confirmada, mostrado na home do cuidador.
 *
 * Aparece quando o horário passou e o paciente não confirmou. O cuidador pode
 * "Confirmar dose" (o paciente tomou mas esqueceu de marcar, informando hora e
 * observações) ou marcar "Não tomou". Depois de confirmar, o alerta some.
 */
export function DoseAlert({ medication, style, ...rest }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [status, setStatus] = useState<DoseStatus>("onTime");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const wasTaken = status !== "missed";

  const resetForm = () => {
    setStatus("onTime");
    setTime("");
    setNotes("");
    setErrorMessage(null);
  };

  const openSheet = (initialStatus: DoseStatus) => {
    setStatus(initialStatus);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    if (isSubmitting) return;
    setIsSheetOpen(false);
    resetForm();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await confirmDose({
        medicationId: medication.id,
        status,
        time: wasTaken ? time : "",
        notes,
      });

      setIsSheetOpen(false);
      setIsConfirmed(true);
    } catch {
      setErrorMessage("Não foi possível confirmar a dose. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) return null;

  const WarningIcon = Icons.warning;

  const title = "Medicamento não tomado";
  const message = `${medication.name} deveria ter sido tomado às ${medication.scheduledTime} e ainda não foi confirmado.`;

  return (
    <>
      <View
        {...rest}
        accessibilityRole="alert"
        style={[styles.container, style]}
      >
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <WarningIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={colors.warning}
            />
          </View>

          <Text size="sm" weight="bold" style={styles.title}>
            {title}
          </Text>
        </View>

        <Text size="xs" color="textSecondary" style={styles.message}>
          {message}
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() => openSheet("onTime")}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.actionButton,
              styles.confirmActionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text size="xs" weight="semibold" color="onPrimary">
              Confirmar dose
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openSheet("missed")}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.actionButton,
              styles.missedActionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text size="xs" weight="semibold" color="primary">
              Não tomou
            </Text>
          </Pressable>
        </View>
      </View>

      <BottomSheet
        visible={isSheetOpen}
        onClose={closeSheet}
        title="Confirmar dose"
      >
        <View style={styles.form}>
          <ToggleGroup
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />

          {wasTaken && (
            <Input
              label="Hora"
              placeholder={medication.scheduledTime}
              value={time}
              onChangeText={setTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          )}

          <Input
            label="Observações"
            placeholder="Digite suas observações aqui..."
            value={notes}
            onChangeText={setNotes}
            keyboardType="numbers-and-punctuation"
          />

          {errorMessage && (
            <Text size="xs" color="danger" accessibilityRole="alert">
              {errorMessage}
            </Text>
          )}

          <Pressable
            onPress={handleConfirm}
            disabled={isSubmitting}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.confirmButton,
              (pressed || isSubmitting) && styles.pressed,
            ]}
          >
            <Text size="sm" weight="semibold" color="onPrimary">
              {isSubmitting ? "Confirmando..." : "Confirmar"}
            </Text>
          </Pressable>

          <Pressable
            onPress={closeSheet}
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
    </>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: Radius.md,
    },
    title: {
      flex: 1,
    },
    message: {
      marginTop: Spacing.two,
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.two,
      marginTop: Spacing.three,
    },
    actionButton: {
      flex: 1,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.sm,
    },
    confirmActionButton: {
      backgroundColor: colors.primary,
    },
    missedActionButton: {
      backgroundColor: colors.primarySoft,
    },
    form: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      gap: Spacing.three,
    },
    confirmButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      marginTop: Spacing.two,
      backgroundColor: colors.primary,
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
