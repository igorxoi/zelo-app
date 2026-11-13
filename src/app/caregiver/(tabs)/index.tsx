import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DateSelector } from "@/components/DateSelector";
import { DoseAlertCarousel } from "@/components/DoseAlertCarousel";
import { EmptyState } from "@/components/EmptyState";
import { HomeHeader } from "@/components/HomeHeader";
import { Loading } from "@/components/Loading";
import { PatientSelect } from "@/components/PatientSelect";
import { SectionHeader } from "@/components/SectionHeader";
import { NoPatientState } from "@/components/NoPatientState";
import { Text } from "@/components/Text";
import { Timeline, TimelineEvent } from "@/components/Timeline";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/contexts/PatientContext";
import { useTheme } from "@/hooks/useTheme";
import { getMissedDoses, type Medication } from "@/services/doses";
import { getHistory } from "@/services/history";
import { getUnreadNotificationsCount } from "@/services/notifications";
import { getPatients, type Patient } from "@/services/patients";

function getLast7Days(base: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - 6 + index);
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

const REFRESH_MS = 10000;

export default function CaregiverHome() {
  const router = useRouter();
  const colors = useTheme();
  const { patientId, setPatientId } = usePatient();
  const { user } = useAuth();

  const today = useMemo(() => new Date(), []);
  const dates = useMemo(() => getLast7Days(today), [today]);

  const [selectedDate, setSelectedDate] = useState(today);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientsLoaded, setPatientsLoaded] = useState(false);

  const [missedState, setMissedState] = useState<{
    patientId: string;
    doses: Medication[];
  }>({ patientId: "", doses: [] });

  const [hasUnread, setHasUnread] = useState(false);

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const missedDoses =
    missedState.patientId === patientId ? missedState.doses : [];
  const eventsRequest = useRef(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasPatient = patients.some((patient) => patient.id === patientId);
  const hasNoPatients = patientsLoaded && patients.length === 0;
  const isLoading = isLoadingPatients || isLoadingEvents;

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;

      const loadPatients = async () => {
        try {
          const result = await getPatients();
          if (!isCurrent) return;

          setPatients(result);
          setPatientsLoaded(true);
          setErrorMessage(null);
          if (!result.some((patient) => patient.id === patientId)) {
            setPatientId(result[0]?.id ?? "");
          }
        } catch {
          if (isCurrent)
            setErrorMessage("Não foi possível carregar os pacientes.");
        } finally {
          if (isCurrent) setIsLoadingPatients(false);
        }
      };

      loadPatients();

      return () => {
        isCurrent = false;
      };
    }, [patientId, setPatientId]),
  );

  const loadMissedDoses = useCallback(async () => {
    if (!patientId || !hasPatient) return;

    try {
      setMissedState({ patientId, doses: await getMissedDoses(patientId) });
    } catch {}
  }, [patientId, hasPatient]);

  const loadUnread = useCallback(async () => {
    try {
      setHasUnread((await getUnreadNotificationsCount()) > 0);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMissedDoses();
      loadUnread();
      const timer = setInterval(() => {
        loadMissedDoses();
        loadUnread();
      }, REFRESH_MS);

      return () => clearInterval(timer);
    }, [loadMissedDoses, loadUnread]),
  );

  const loadEvents = useCallback(
    async (silent = false) => {
      if (!patientId || !hasPatient) return;

      const currentRequest = ++eventsRequest.current;
      const isCurrent = () => currentRequest === eventsRequest.current;

      if (!silent) setIsLoadingEvents(true);
      setErrorMessage(null);

      try {
        const result = await getHistory({ patientId, date: selectedDate });
        if (isCurrent()) setEvents(result);
      } catch {
        if (isCurrent() && !silent) {
          setEvents([]);
          setErrorMessage("Não foi possível carregar o histórico.");
        }
      } finally {
        if (isCurrent()) setIsLoadingEvents(false);
      }
    },
    [patientId, hasPatient, selectedDate],
  );

  useFocusEffect(
    useCallback(() => {
      loadEvents();
      const timer = setInterval(() => loadEvents(true), REFRESH_MS);

      return () => clearInterval(timer);
    }, [loadEvents, reloadKey]),
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.primary }]}>
      <HomeHeader
        name={user?.name || ""}
        hasNotification={hasUnread}
        onNotificationPress={() =>
          router.push("/caregiver/notifications?from=home" as Href)
        }
      >
        {patients.length > 0 && (
          <PatientSelect
            patients={patients}
            value={patientId}
            onChange={setPatientId}
          />
        )}
      </HomeHeader>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {hasNoPatients ? (
          <NoPatientState
            lead="Para começar, vá em"
            trail={
              <>
                . Depois, cadastre os medicamentos na aba{" "}
                <Text size="sm" weight="bold">
                  Medicamentos
                </Text>
                .
              </>
            }
          />
        ) : (
          <>
            <DoseAlertCarousel
              doses={missedDoses}
              onResolved={() => {
                loadMissedDoses();
                setReloadKey((key) => key + 1);
              }}
            />

            <View style={styles.section}>
              <SectionHeader title="Selecione a data" />

              <DateSelector
                dates={dates}
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </View>

            <SectionHeader
              title="Histórico do paciente"
              linkLabel="Ver todos"
              href="/caregiver/history"
            />

            {errorMessage ? (
              <EmptyState
                icon="alert-circle"
                title="Algo deu errado"
                message={errorMessage}
              />
            ) : events.length === 0 && !isLoading ? (
              <EmptyState
                icon="calendar"
                title="Nenhum registro neste dia"
                message="Quando houver medicamentos ou relatos, eles aparecem aqui."
              />
            ) : (
              <Timeline events={events} />
            )}
          </>
        )}
      </ScrollView>

      {isLoading && <Loading fullScreen />}
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
});
