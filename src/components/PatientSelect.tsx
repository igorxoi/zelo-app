import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { BottomSheet } from "./BottomSheet";

export type PatientOption = {
  id: string;
  name: string;
};

type Props = {
  patients: readonly PatientOption[];
  value: string;
  onChange: (id: string) => void;
};

export function PatientSelect({ patients, value, onChange }: Props) {
  const colors = useTheme();

  const [open, setOpen] = useState(false);
  const selected = patients.find((patient) => patient.id === value);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.field}
        accessibilityRole="button"
        accessibilityLabel={`Paciente: ${selected?.name ?? "nenhum"}. Toque para trocar`}
      >
        <Feather name="users" size={20} color={colors.onPrimary} />

        <View style={styles.info}>
          <Text size="xs" color="onPrimary" style={styles.label}>
            Paciente
          </Text>
          <Text size="md" weight="semibold" color="onPrimary">
            {selected?.name ?? "Selecione"}
          </Text>
        </View>

        <Feather name="chevron-down" size={20} color={colors.onPrimary} />
      </Pressable>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Selecione o paciente"
        subtitle="Selecione o paciente que deseja acompanhar"
      >
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {patients.map((patient) => {
            const active = patient.id === value;

            return (
              <Pressable
                key={patient.id}
                onPress={() => handleSelect(patient.id)}
                style={styles.option}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  weight={active ? "semibold" : "regular"}
                  color={active ? "primary" : "text"}
                >
                  {patient.name}
                </Text>
                {active && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: Radius.lg,
  },
  info: {
    flex: 1,
  },
  label: {
    opacity: 0.8,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  sheetTitle: {
    marginBottom: Spacing.two,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
  },
});
