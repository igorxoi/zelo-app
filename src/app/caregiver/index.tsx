import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DateSelector } from "@/components/DateSelector";
import { DoseAlert } from "@/components/DoseAlert";
import { EmptyState } from "@/components/EmptyState";
import { HomeHeader } from "@/components/HomeHeader";
import { Loading } from "@/components/Loading";
import { PatientSelect } from "@/components/PatientSelect";
import { SectionHeader } from "@/components/SectionHeader";
import { Timeline, TimelineEvent } from "@/components/Timeline";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/contexts/PatientContext";
import { useTheme } from "@/hooks/useTheme";
import { getMissedDoses, type Medication } from "@/services/doses";
import { getHistory } from "@/services/history";
import { getPatients, type Patient } from "@/services/patients";

function getLast7Days(base: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - 6 + index);
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

/**
 * Início do cuidador. De cima para baixo:
 *   - Cabeçalho com o sino (abre as notificações) e o seletor de paciente.
 *   - Lembretes: um alerta (DoseAlert) para cada dose do paciente que passou
 *     do horário sem confirmação, com "Confirmar dose" e "Não tomou".
 *   - Seleção de data e a linha do tempo do dia (doses e relatos de sintomas).
 */
export default function CaregiverHome() {
  const colors = useTheme();
  const { patientId, setPatientId } = usePatient();
  const { user } = useAuth();

  const today = useMemo(() => new Date(), []);
  const dates = useMemo(() => getLast7Days(today), [today]);

  const [selectedDate, setSelectedDate] = useState(today);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const [missedDoses, setMissedDoses] = useState<Medication[]>([]);

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = isLoadingPatients || isLoadingEvents;

  // Recarrega os pacientes ao voltar para a home (ex.: depois de cadastrar ou
  // excluir um paciente no perfil) e garante que o selecionado ainda existe.
  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;

      const loadPatients = async () => {
        try {
          const result = await getPatients();
          if (!isCurrent) return;

          setPatients(result);
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

  // Lembretes: doses atrasadas do paciente selecionado.
  useFocusEffect(
    useCallback(() => {
      if (!patientId) return;

      let isCurrent = true;

      getMissedDoses(patientId)
        .then((result) => {
          if (isCurrent) setMissedDoses(result);
        })
        .catch(() => {
          if (isCurrent) setMissedDoses([]);
        });

      return () => {
        isCurrent = false;
      };
    }, [patientId]),
  );

  useEffect(() => {
    if (!patientId) return;

    let isCurrent = true;

    const loadEvents = async () => {
      setIsLoadingEvents(true);
      setErrorMessage(null);

      try {
        const result = await getHistory({ patientId, date: selectedDate });
        if (isCurrent) setEvents(result);
      } catch {
        if (isCurrent) {
          setEvents([]);
          setErrorMessage("Não foi possível carregar o histórico.");
        }
      } finally {
        if (isCurrent) setIsLoadingEvents(false);
      }
    };

    loadEvents();

    return () => {
      isCurrent = false;
    };
  }, [patientId, selectedDate]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.primary }]}>
      <HomeHeader
        name={user?.name || ""}
        hasNotification
        onNotificationPress={() =>
          router.push("/caregiver/notifications" as Href)
        }
      >
        <PatientSelect
          patients={patients}
          value={patientId}
          onChange={setPatientId}
        />
      </HomeHeader>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {missedDoses.map((medication) => (
          <DoseAlert key={medication.id} medication={medication} />
        ))}

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
    padding: Spacing.three,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
});
