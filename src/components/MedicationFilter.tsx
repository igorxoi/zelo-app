import { Feather } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import type { Period } from "@/components/PeriodFilter";
import { Text } from "@/components/Text";
import { Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import {
  getHistoryMedications,
  type HistoryMedication,
} from "@/services/history";

type Props = {
  title: string;
  patientId?: string | null;
  period: Period;
  value: HistoryMedication | null;
  onChange: (medication: HistoryMedication | null) => void;
};

const ICON_BOX_SIZE = 36;
const ICON_SIZE = 20;
const CHEVRON_SIZE = 18;

export function MedicationFilter({
  title,
  patientId,
  period,
  value,
  onChange,
}: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSnackbar } = useSnackbar();

  const PillIcon = Icons.pill;

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<HistoryMedication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const requestId = useRef(0);

  const handleOpen = async () => {
    if (!patientId) return;

    const currentRequest = ++requestId.current;
    const isCurrent = () => currentRequest === requestId.current;

    setOpen(true);
    setIsLoading(true);

    try {
      const result = await getHistoryMedications({
        patientId,
        month: period.month,
        year: period.year,
      });

      if (isCurrent()) setOptions(result);
    } catch {
      if (isCurrent()) {
        setOpen(false);

        showSnackbar({
          variant: "error",
          title: "Não foi possível carregar",
          message:
            "Algo deu errado ao buscar os medicamentos do mês. Tente novamente em instantes.",
        });
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  };

  const handleClose = () => {
    requestId.current++;
    setOpen(false);
    setIsLoading(false);
  };

  const handleSelect = (medication: HistoryMedication | null) => {
    onChange(medication);
    handleClose();
  };

  return (
    <>
      <View style={styles.header}>
        <Text size="md" weight="bold">
          {title}
        </Text>

        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel="Filtrar por medicamento"
          style={styles.trigger}
        >
          <Text size="sm" weight="semibold" color="primary" numberOfLines={1}>
            {value ? value.name : "Todos"}
          </Text>
          <Feather
            name="chevron-down"
            size={CHEVRON_SIZE}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {open && (
        <BottomSheet
          visible
          onClose={handleClose}
          loading={isLoading}
          title="Selecionar medicamento"
        >
          <View style={styles.list}>
            <Pressable
              onPress={() => handleSelect(null)}
              accessibilityRole="button"
              accessibilityState={{ selected: !value }}
              style={[styles.option, !value && styles.optionSelected]}
            >
              <View style={[styles.iconBox, !value && styles.iconBoxSelected]}>
                <Feather
                  name="list"
                  size={ICON_SIZE}
                  color={value ? colors.onPrimary : colors.primary}
                />
              </View>

              <Text
                size="sm"
                weight="bold"
                color={value ? "text" : "onPrimary"}
              >
                Todos
              </Text>
            </Pressable>

            {options.map((medication) => {
              const selected = value?.id === medication.id;

              return (
                <Pressable
                  key={medication.id}
                  onPress={() => handleSelect(medication)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View
                    style={[styles.iconBox, selected && styles.iconBoxSelected]}
                  >
                    <PillIcon
                      width={ICON_SIZE}
                      height={ICON_SIZE}
                      color={selected ? colors.primary : colors.onPrimary}
                    />
                  </View>

                  <View>
                    <Text
                      size="sm"
                      weight="bold"
                      color={selected ? "onPrimary" : "text"}
                    >
                      {medication.name}
                    </Text>
                    <Text
                      size="xs"
                      color={selected ? "onPrimary" : "textSecondary"}
                    >
                      {medication.dosage}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </BottomSheet>
      )}
    </>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: Spacing.three,
    },
    trigger: {
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
    },
    list: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      padding: Spacing.two,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
    },
    optionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    iconBox: {
      width: ICON_BOX_SIZE,
      height: ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    iconBoxSelected: {
      backgroundColor: colors.onPrimary,
    },
  });
