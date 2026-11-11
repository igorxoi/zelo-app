import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { BottomSheet } from "./BottomSheet";

const MONTHS_FULL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

export type Period = {
  month: number;
  year: number;
};

type Props = {
  value: Period;
  onChange: (period: Period) => void;
  title?: string;
};

export function PeriodFilter({ value, onChange }: Props) {
  const colors = useTheme();

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(value.year);

  const openSheet = () => {
    setYear(value.year);
    setOpen(true);
  };

  const handleSelect = (month: number) => {
    onChange({ month, year });
    setOpen(false);
  };

  return (
    <>
      <View style={styles.bar}>
        <Pressable
          onPress={openSheet}
          hitSlop={Spacing.two}
          accessibilityRole="button"
          accessibilityLabel="Escolher período"
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={openSheet}
          accessibilityRole="button"
          accessibilityLabel={`${MONTHS_FULL[value.month]} de ${value.year}. Toque para escolher o período`}
        >
          <Text weight="semibold">
            {MONTHS_FULL[value.month]} - {value.year}
          </Text>
        </Pressable>

        <Pressable
          onPress={openSheet}
          hitSlop={Spacing.two}
          accessibilityRole="button"
          accessibilityLabel="Escolher período"
        >
          <Feather name="chevron-right" size={22} color={colors.text} />
        </Pressable>
      </View>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Selecionar período"
      >
        <View style={styles.yearRow}>
          <Pressable
            onPress={() => setYear((current) => current - 1)}
            hitSlop={Spacing.two}
            accessibilityRole="button"
            accessibilityLabel="Ano anterior"
          >
            <Feather name="chevron-left" size={20} color={colors.text} />
          </Pressable>

          <Text weight="semibold">{year}</Text>

          <Pressable
            onPress={() => setYear((current) => current + 1)}
            hitSlop={Spacing.two}
            accessibilityRole="button"
            accessibilityLabel="Próximo ano"
          >
            <Feather name="chevron-right" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {MONTHS_SHORT.map((label, month) => {
            const active = month === value.month && year === value.year;

            return (
              <Pressable
                key={label}
                onPress={() => handleSelect(month)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.month,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  color={active ? "onPrimary" : "text"}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    paddingTop: Spacing.two,
    borderTopLeftRadius: Radius.lg + Spacing.two,
    borderTopRightRadius: Radius.lg + Spacing.two,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.three,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  divider: {
    height: 1,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    paddingVertical: Spacing.three,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.three,
    rowGap: Spacing.two,
  },
  month: {
    width: "33.3333%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
});
