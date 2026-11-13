import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DateSelector } from "@/components/DateSelector";
import { EmptyState } from "@/components/EmptyState";
import { HistoryEventDetailsSheet } from "@/components/HistoryEventDetailsSheet";
import { Loading } from "@/components/Loading";
import { MedicationFilter } from "@/components/MedicationFilter";
import { NoPatientState } from "@/components/NoPatientState";
import { PageHeader } from "@/components/PageHeader";
import { Period, PeriodFilter } from "@/components/PeriodFilter";
import { Timeline, TimelineEvent } from "@/components/Timeline";
import { Spacing } from "@/constants/theme";
import { usePatient } from "@/contexts/PatientContext";
import { usePatientStatus } from "@/hooks/usePatientStatus";
import { useTheme } from "@/hooks/useTheme";
import { getHistory, type HistoryMedication } from "@/services/history";

function getDaysOfMonth(month: number, year: number) {
  const total = new Date(year, month + 1, 0).getDate();

  return Array.from(
    { length: total },
    (_, index) => new Date(year, month, index + 1),
  );
}

export default function History() {
  const { patientId } = usePatient();
  const { status, ready } = usePatientStatus();

  const colors = useTheme();

  const today = useMemo(() => new Date(), []);

  const [selectedDate, setSelectedDate] = useState(today);

  const [period, setPeriod] = useState<Period>({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const [medicationFilter, setMedicationFilter] = useState<{
    patientId: string;
    value: HistoryMedication | null;
  } | null>(null);
  const medication =
    medicationFilter && medicationFilter.patientId === patientId
      ? medicationFilter.value
      : null;
  const setMedication = useCallback(
    (value: HistoryMedication | null) =>
      setMedicationFilter({ patientId, value }),
    [patientId],
  );

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestId = useRef(0);

  const dates = useMemo(
    () => getDaysOfMonth(period.month, period.year),
    [period.month, period.year],
  );

  const reloadHistory = useCallback(async () => {
    if (!patientId || !ready) return;

    const currentRequest = ++requestId.current;
    const isCurrent = () => currentRequest === requestId.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getHistory({
        patientId,
        date: selectedDate,
        medicationId: medication?.id,
      });
      if (isCurrent()) setEvents(result);
    } catch {
      if (isCurrent()) {
        setEvents([]);
        setErrorMessage("Não foi possível carregar o histórico.");
      }
    } finally {
      if (isCurrent()) {
        setIsLoading(false);
        setLoaded(true);
      }
    }
  }, [patientId, ready, selectedDate, medication]);

  useFocusEffect(
    useCallback(() => {
      reloadHistory();
    }, [reloadHistory]),
  );

  const handleSelectPeriod = (next: Period) => {
    setPeriod(next);

    setMedication(null);

    setSelectedDate(new Date(next.year, next.month, 1));
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPeriod({ month: today.getMonth(), year: today.getFullYear() });
        setSelectedDate(today);
        setMedication(null);
        setSelectedEvent(null);
      };
    }, [today, setMedication]),
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.primary }]}>
      <PageHeader title="Histórico" />

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {status === "loading" ? null : status === "none" ? (
          <NoPatientState lead="Para ver o histórico, primeiro adicione um paciente em" />
        ) : status === "error" ? (
          <EmptyState
            icon="alert-circle"
            title="Algo deu errado"
            message="Não foi possível carregar os pacientes."
          />
        ) : (
          <>
            <PeriodFilter value={period} onChange={handleSelectPeriod} />

            <DateSelector
              dates={dates}
              value={selectedDate}
              onChange={setSelectedDate}
            />

            <MedicationFilter
              title="Histórico do paciente"
              patientId={patientId}
              period={period}
              value={medication}
              onChange={setMedication}
            />

            {errorMessage ? (
              <EmptyState
                icon="alert-circle"
                title="Algo deu errado"
                message={errorMessage}
              />
            ) : events.length === 0 && loaded && !isLoading ? (
              <EmptyState
                icon="calendar"
                title="Nenhum registro neste dia"
                message="Quando houver medicamentos ou relatos, eles aparecem aqui."
              />
            ) : (
              <Timeline events={events} onEventPress={setSelectedEvent} />
            )}
          </>
        )}
      </ScrollView>

      {selectedEvent && (
        <HistoryEventDetailsSheet
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {(isLoading || status === "loading" || (ready && !loaded)) && (
        <Loading fullScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  sheet: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
});
