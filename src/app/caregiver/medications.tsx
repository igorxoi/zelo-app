import { Feather } from "@expo/vector-icons";
import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { BackHeader } from "@/components/BackHeader";
import { EmptyState } from "@/components/EmptyState";
import { EndMedicationSheet } from "@/components/EndMedicationSheet";
import { Loading } from "@/components/Loading";
import { MedicationCard } from "@/components/MedicationCard";
import { Spacing, type ThemeColor } from "@/constants/theme";
import { usePatient } from "@/contexts/PatientContext";
import { useTheme } from "@/hooks/useTheme";
import { getMedications, type Medication } from "@/services/medications";

const FAB_SIZE = 56;

/**
 * Medicamentos ativos do paciente selecionado. O botão "+" cadastra um novo;
 * a lixeira de cada card encerra o tratamento (o medicamento sai da lista,
 * mas o histórico de doses já registradas continua disponível).
 */
export default function Medications() {
  const { patientId } = usePatient();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationToEnd, setMedicationToEnd] = useState<Medication | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestId = useRef(0);

  const loadMedications = useCallback(async () => {
    if (!patientId) return;

    const currentRequest = ++requestId.current;
    const isCurrent = () => currentRequest === requestId.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMedications(patientId);
      if (isCurrent()) setMedications(result);
    } catch {
      if (isCurrent()) {
        setMedications([]);
        setErrorMessage("Não foi possível carregar os medicamentos.");
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  const handleAddPress = () => {
    router.push("/caregiver/new-medication" as Href);
  };

  return (
    <View style={styles.screen}>
      <BackHeader
        title="Medicamentos"
        onBackPress={() => router.navigate("/caregiver" as Href)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {errorMessage ? (
          <EmptyState
            icon="alert-circle"
            title="Algo deu errado"
            message={errorMessage}
          />
        ) : medications.length === 0 && !isLoading ? (
          <EmptyState
            icon="inbox"
            title="Nenhum medicamento cadastrado"
            message="Toque no botão + para cadastrar o primeiro."
          />
        ) : (
          medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onDeletePress={setMedicationToEnd}
            />
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={handleAddPress}
        accessibilityRole="button"
        accessibilityLabel="Cadastrar medicamento"
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Feather name="plus" size={28} color={colors.onPrimary} />
      </Pressable>

      {medicationToEnd && (
        <EndMedicationSheet
          medication={medicationToEnd}
          onClose={() => setMedicationToEnd(null)}
          onEnded={loadMedications}
        />
      )}

      {isLoading && <Loading fullScreen />}
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
    fab: {
      position: "absolute",
      right: Spacing.three,
      bottom: Spacing.three,
      width: FAB_SIZE,
      height: FAB_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: FAB_SIZE / 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    pressed: {
      opacity: 0.8,
    },
  });
