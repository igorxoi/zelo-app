import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader } from "@/components/BackHeader";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { SelectField } from "@/components/SelectField";
import { Tag } from "@/components/Tag";
import { Text } from "@/components/Text";
import { TimeListField } from "@/components/TimeListField";
import { WeekdayPicker } from "@/components/WeekdayPicker";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { usePatient } from "@/contexts/PatientContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import {
  createMedication,
  getScheduleTimes,
  type CreateMedicationPayload,
  type MedicationSchedule,
  type ScheduleType,
  type Weekday,
} from "@/services/medications";
import {
  brDateToIso,
  getTodayBr,
  isValidTime,
  maskDate,
  maskTime,
} from "@/utils/masks";

const FREQUENCY_OPTIONS = [
  { label: "Em intervalos fixos (a cada X horas)", value: "interval" },
  { label: "Uma vez ao dia", value: "daily" },
  { label: "Dias específicos da semana", value: "weekdays" },
  { label: "Horários personalizados", value: "custom" },
] as const;

const INTERVAL_OPTIONS = [4, 6, 8, 12, 24].map((hours) => ({
  label: `${hours} horas (${24 / hours}x ao dia)`,
  value: String(hours),
}));

/**
 * Cadastro de medicamento do paciente selecionado na home.
 *
 * A frequência pode ser: a cada X horas (os horários são gerados a partir do
 * primeiro), uma vez ao dia, dias específicos da semana ou horários
 * personalizados. Cada horário vira uma dose por dia, que o paciente confirma
 * no app dele. O tratamento tem data de início e, se não for contínuo, de
 * término.
 */
export default function NewMedication() {
  const { patientId } = usePatient();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<ScheduleType>("interval");

  const [intervalHours, setIntervalHours] = useState("12");
  const [startTime, setStartTime] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [days, setDays] = useState<Weekday[]>([]);
  const [weekdaysTime, setWeekdaysTime] = useState("");
  const [customTimes, setCustomTimes] = useState<string[]>([""]);

  const [startDate, setStartDate] = useState(getTodayBr);
  const [isContinuous, setIsContinuous] = useState(true);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setName("");
    setDosage("");
    setFrequency("interval");
    setIntervalHours("12");
    setStartTime("");
    setDailyTime("");
    setDays([]);
    setWeekdaysTime("");
    setCustomTimes([""]);
    setStartDate(getTodayBr());
    setIsContinuous(true);
    setEndDate("");
    setNotes("");
  }, []);

  useFocusEffect(
    useCallback(() => {
      return resetForm;
    }, [resetForm]),
  );

  const getSchedule = (): MedicationSchedule | null => {
    switch (frequency) {
      case "interval":
        return isValidTime(startTime)
          ? { type: "interval", everyHours: Number(intervalHours), startTime }
          : null;
      case "daily":
        return isValidTime(dailyTime)
          ? { type: "daily", time: dailyTime }
          : null;
      case "weekdays":
        return days.length > 0 && isValidTime(weekdaysTime)
          ? { type: "weekdays", days, time: weekdaysTime }
          : null;
      case "custom":
        return customTimes.length > 0 && customTimes.every(isValidTime)
          ? { type: "custom", times: customTimes }
          : null;
    }
  };

  const schedule = getSchedule();
  const isoStartDate = brDateToIso(startDate);
  const isoEndDate = isContinuous ? null : brDateToIso(endDate);

  const payload: CreateMedicationPayload | null =
    patientId &&
    name.trim() &&
    dosage.trim() &&
    schedule &&
    isoStartDate &&
    (isContinuous || isoEndDate)
      ? {
          patientId,
          name: name.trim(),
          dosage: dosage.trim(),
          schedule,
          startDate: isoStartDate,
          endDate: isoEndDate,
          notes: notes.trim(),
        }
      : null;

  const generatedTimes =
    schedule?.type === "interval" ? getScheduleTimes(schedule) : [];

  const handleSubmit = async () => {
    if (!payload || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await createMedication(payload);

      showSnackbar({
        variant: "success",
        title: "Medicamento cadastrado",
        message:
          "Os lembretes já estão ativos e o paciente será avisado nos horários definidos.",
      });

      resetForm();
      router.back();
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível cadastrar",
        message:
          "Algo deu errado ao salvar esse medicamento. Verifique os dados e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    router.navigate("/caregiver/medications" as Href);
  };

  return (
    <View style={styles.screen}>
      <BackHeader title="Cadastrar medicamento" onBackPress={handleBackPress} />

      <>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Nome do medicamento*"
            placeholder="Ex.: Losartana"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Dosagem*"
            placeholder="Ex.: 50mg"
            value={dosage}
            onChangeText={setDosage}
          />

          <SelectField
            label="Frequência*"
            value={frequency}
            options={FREQUENCY_OPTIONS}
            onChange={setFrequency}
          />

          {frequency === "interval" && (
            <>
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <SelectField
                    label="Repetir a cada"
                    value={intervalHours}
                    options={INTERVAL_OPTIONS}
                    onChange={setIntervalHours}
                  />
                </View>

                <View style={styles.rowItem}>
                  <Input
                    label="A partir de"
                    placeholder="08:00"
                    value={startTime}
                    onChangeText={(text) => setStartTime(maskTime(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>

              {generatedTimes.length > 0 && (
                <View style={styles.generated}>
                  <Text size="xs" color="textSecondary">
                    Horários gerados automaticamente:
                  </Text>

                  <View style={styles.times}>
                    {generatedTimes.map((time) => (
                      <Tag key={time} label={time} variant="medication" />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {frequency === "daily" && (
            <Input
              label="Horário*"
              placeholder="08:00"
              value={dailyTime}
              onChangeText={(text) => setDailyTime(maskTime(text))}
              keyboardType="number-pad"
              maxLength={5}
            />
          )}

          {frequency === "weekdays" && (
            <>
              <WeekdayPicker
                label="Dias da semana"
                value={days}
                onChange={setDays}
              />

              <Input
                label="Horário*"
                placeholder="08:00"
                value={weekdaysTime}
                onChangeText={(text) => setWeekdaysTime(maskTime(text))}
                keyboardType="number-pad"
                maxLength={5}
              />
            </>
          )}

          {frequency === "custom" && (
            <TimeListField
              label="Horários*"
              values={customTimes}
              onChange={setCustomTimes}
            />
          )}

          <Input
            label="Início do tratamento *"
            placeholder="dd/mm/aaaa"
            value={startDate}
            onChangeText={(text) => setStartDate(maskDate(text))}
            keyboardType="number-pad"
            maxLength={10}
          />

          <Checkbox
            label="Tratamento contínuo (sem data de término)"
            checked={isContinuous}
            onChange={setIsContinuous}
          />

          {!isContinuous && (
            <Input
              label="Término do tratamento *"
              placeholder="dd/mm/aaaa"
              value={endDate}
              onChangeText={(text) => setEndDate(maskDate(text))}
              keyboardType="number-pad"
              maxLength={10}
            />
          )}

          <Input
            label="Observações"
            placeholder="Ex: tomar após as refeições"
            value={notes}
            onChangeText={setNotes}
          />
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Spacing.three + insets.bottom },
          ]}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={!payload || isSubmitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: !payload || isSubmitting }}
            style={({ pressed }) => [
              styles.continueButton,
              !payload && styles.continueButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              size="sm"
              weight="semibold"
              color={payload ? "onPrimary" : "textSecondary"}
            >
              Cadastrar medicamento
            </Text>
          </Pressable>
        </View>
      </>

      {isSubmitting && <Loading fullScreen />}
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.three,
    },
    row: {
      flexDirection: "row",
      gap: Spacing.two,
    },
    rowItem: {
      flex: 1,
    },
    generated: {
      gap: Spacing.one,
    },
    times: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.two,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    continueButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    continueButtonDisabled: {
      backgroundColor: colors.backgroundSelected,
    },
    pressed: {
      opacity: 0.8,
    },
  });
