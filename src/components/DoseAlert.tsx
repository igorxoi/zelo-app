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
  onResolved?: () => void;
};

function normalizeTime(text: string): string | null {
  const digits = text.replace(/\D/g, "");
  if (digits.length < 3 || digits.length > 4) return null;

  const hour = Number(digits.slice(0, -2));
  const minute = Number(digits.slice(-2));
  if (hour > 23 || minute > 59) return null;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const STATUS_OPTIONS = [
  { label: "No horário", value: "onTime" },
  { label: "Com atraso", value: "late" },
  { label: "Não tomou", value: "missed" },
] as const;

const ICON_SIZE = 22;

export function DoseAlert({ medication, onResolved, style, ...rest }: Props) {
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
    setErrorMessage(null);

    let normalizedTime = "";
    if (wasTaken && time.trim()) {
      const parsed = normalizeTime(time);
      if (!parsed) {
        setErrorMessage(
          "Hora inválida. Use o formato HH:mm, por exemplo 21:30.",
        );
        return;
      }
      normalizedTime = parsed;
    }

    setIsSubmitting(true);

    try {
      await confirmDose({
        medicationId: medication.id,
        status,
        time: normalizedTime,
        notes,
      });

      setIsSheetOpen(false);
      setIsConfirmed(true);
      onResolved?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar a dose. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) return null;

  const alertText = {
    pending: {
      title: "Hora do medicamento",
      message: `${medication.name} é para ser tomado às ${medication.scheduledTime}. O paciente ainda não confirmou.`,
    },
    missed: {
      title: "Medicamento não tomado",
      message: `${medication.name} deveria ter sido tomado às ${medication.scheduledTime} e ainda não foi confirmado.`,
    },
    skipped: {
      title: "Medicamento não tomado",
      message: `O paciente marcou que não tomou ${medication.name} das ${medication.scheduledTime}.`,
    },
  }[medication.status ?? "missed"];
  const { title, message } = alertText;

  const isNotTaken = medication.status !== "pending";
  const AlertIcon = isNotTaken ? Icons.error : Icons.warning;
  const iconColor = isNotTaken ? colors.danger : colors.warning;
  const iconBackground = isNotTaken ? colors.dangerSoft : colors.warningSoft;

  return (
    <>
      <View
        {...rest}
        accessibilityRole="alert"
        style={[styles.container, style]}
      >
        <View style={styles.header}>
          <View
            style={[styles.iconWrapper, { backgroundColor: iconBackground }]}
          >
            <AlertIcon width={ICON_SIZE} height={ICON_SIZE} color={iconColor} />
          </View>

          <Text size="sm" weight="bold" style={styles.title}>
            {title}
          </Text>
        </View>

        <Text size="xs" color="textSecondary" style={styles.message}>
          {message}
        </Text>

        {medication.status === "pending" && (
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
        )}
      </View>

      <BottomSheet
        visible={isSheetOpen}
        onClose={closeSheet}
        loading={isSubmitting}
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
              placeholder={`${medication.scheduledTime} (vazio = agora)`}
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
              pressed && styles.pressed,
            ]}
          >
            <Text size="sm" weight="semibold" color="onPrimary">
              Confirmar
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
