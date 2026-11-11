import { Feather } from "@expo/vector-icons";
import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { HomeHeader } from "@/components/HomeHeader";
import { Loading } from "@/components/Loading";
import { PatientDoseCard } from "@/components/PatientDoseCard";
import { SymptomDiary } from "@/components/SymptomDiary";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { getPendingDoses, takeDose, type PatientDose } from "@/services/doses";
import { getPatientProfile } from "@/services/profile";
import { reportSymptom, type SymptomType } from "@/services/symptoms";

type TakenDose = { label: string; time: string };

const BANNER_ICON_SIZE = 22;

/**
 * Início do app do paciente. Tem 3 partes:
 *   1. Doses pendentes de hoje, com os botões "Tomei" e "Não tomei".
 *      "Tomei" registra na hora e mostra o aviso "Anotado!"; "Não tomei" abre
 *      a tela de motivo (skip-dose).
 *   2. Aviso de confirmação da última dose tomada.
 *   3. Diário de sintomas: um toque registra como o paciente está se sentindo.
 * Tudo que o paciente registra aparece para os cuidadores no histórico.
 */
export default function PatientHome() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const patientId = user?.id ?? "";

  const [nickname, setNickname] = useState("");
  const [doses, setDoses] = useState<PatientDose[]>([]);
  const [takenDose, setTakenDose] = useState<TakenDose | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestId = useRef(0);

  const loadHome = useCallback(async () => {
    if (!patientId) return;

    const currentRequest = ++requestId.current;
    const isCurrent = () => currentRequest === requestId.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [profile, pendingDoses] = await Promise.all([
        getPatientProfile(patientId),
        getPendingDoses(patientId),
      ]);

      if (isCurrent()) {
        setNickname(profile.nickname);
        setDoses(pendingDoses);
      }
    } catch {
      if (isCurrent()) {
        setDoses([]);
        setErrorMessage("Não foi possível carregar seus remédios.");
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [patientId]);

  // Recarrega ao voltar da tela de motivo, para a dose respondida sair da lista.
  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [loadHome]),
  );

  const handleTake = async (dose: PatientDose) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { time } = await takeDose(dose.id);

      setDoses((current) => current.filter((item) => item.id !== dose.id));
      setTakenDose({ label: `${dose.name} ${dose.dosage}`, time });
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível anotar",
        message: "Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = (dose: PatientDose) => {
    router.push(`/patient/skip-dose?doseId=${dose.id}` as Href);
  };

  const handleSymptom = async (symptom: SymptomType) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await reportSymptom(patientId, symptom);

      showSnackbar({
        variant: "success",
        title: "Anotado!",
        message: "Registramos como você está se sentindo.",
      });
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível anotar",
        message: "Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstName = (user?.name ?? "").split(" ")[0];

  return (
    <View style={[styles.screen, { backgroundColor: colors.primary }]}>
      <HomeHeader
        caption="Paciente"
        name={`Olá, ${nickname || firstName}`}
        showAvatar={false}
      />

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {takenDose && (
          <View style={styles.banner} accessibilityRole="alert">
            <Feather
              name="check-circle"
              size={BANNER_ICON_SIZE}
              color={colors.primary}
            />
            <View style={styles.bannerText}>
              <Text size="md" weight="bold">
                Anotado!
              </Text>
              <Text size="sm" color="textSecondary">
                {takenDose.label}, às {takenDose.time}.
              </Text>
            </View>
          </View>
        )}

        {errorMessage ? (
          <EmptyState
            icon="alert-circle"
            title="Algo deu errado"
            message={errorMessage}
          />
        ) : doses.length === 0 && !isLoading ? (
          !takenDose && (
            <EmptyState
              icon="check-circle"
              title="Tudo certo por agora"
              message="Você não tem remédios para confirmar neste momento."
            />
          )
        ) : (
          doses.map((dose) => (
            <PatientDoseCard
              key={dose.id}
              dose={dose}
              disabled={isSubmitting}
              onTake={handleTake}
              onSkip={handleSkip}
            />
          ))
        )}

        <SymptomDiary disabled={isSubmitting} onSelect={handleSymptom} />
      </ScrollView>

      {(isLoading || isSubmitting) && <Loading fullScreen />}
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
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
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      padding: Spacing.three,
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    bannerText: {
      flex: 1,
    },
  });
