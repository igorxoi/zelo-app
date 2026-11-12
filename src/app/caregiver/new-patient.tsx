import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader } from "@/components/BackHeader";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { StepProgress } from "@/components/StepProgress";
import { Text } from "@/components/Text";
import { Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { createPatient } from "@/services/patients";
import { brDateToIso, isCompleteCpf, maskCpf, maskDate } from "@/utils/masks";

type Step = "form" | "pairing";

const TOTAL_STEPS = 2;
const ICON_BOX_SIZE = 40;
const ICON_SIZE = 20;

const formatCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

export default function NewPatient() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("form");

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [hasAuthorization, setHasAuthorization] = useState(false);

  const [pairingCode, setPairingCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const InfoIcon = Icons.info;

  const resetForm = useCallback(() => {
    setStep("form");
    setFullName("");
    setNickname("");
    setBirthDate("");
    setCpf("");
    setHasAuthorization(false);
    setPairingCode("");
  }, []);

  useFocusEffect(
    useCallback(() => {
      return resetForm;
    }, [resetForm]),
  );

  const isoBirthDate = brDateToIso(birthDate);

  const canContinue =
    !!fullName.trim() &&
    !!nickname.trim() &&
    !!isoBirthDate &&
    isCompleteCpf(cpf) &&
    hasAuthorization;

  const goToProfile = () => {
    router.navigate("/caregiver/profile" as Href);
  };

  const handleContinue = async () => {
    if (!canContinue || !isoBirthDate || isSubmitting) return;

    const isAllowed = true;
    if (!isAllowed) return;

    setIsSubmitting(true);

    try {
      const result = await createPatient({
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        birthDate: isoBirthDate,
        cpf: cpf.replace(/\D/g, ""),
      });

      setPairingCode(result.pairingCode);
      setStep("pairing");
    } catch (error) {
      showSnackbar({
        variant: "error",
        title: "Não foi possível cadastrar",
        message:
          error instanceof Error
            ? error.message
            : "Algo deu errado ao cadastrar o paciente. Verifique os dados e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Código de pareamento do Zelo: ${formatCode(pairingCode)}. No celular do paciente, abra o Zelo e digite este código. Ele pode ser usado apenas uma vez e é válido por 24 horas.`,
      });
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível compartilhar",
        message: "Tente novamente em instantes.",
      });
    }
  };

  const footerStyle = [
    styles.footer,
    { paddingBottom: Spacing.three + insets.bottom },
  ];

  return (
    <View style={styles.screen}>
      <BackHeader title="Cadastro" onBackPress={goToProfile} />

      <View style={styles.progress}>
        <StepProgress total={TOTAL_STEPS} current={step === "form" ? 1 : 2} />
      </View>

      {step === "form" ? (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text size="md" weight="bold">
              Quem você vai cuidar?
            </Text>

            <Input
              label="Nome completo"
              placeholder="Maria Silva"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <View style={styles.hintField}>
              <Input
                label="Como prefere ser chamado(a)?"
                placeholder="Dona Maria"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="words"
              />

              <Text size="xs" color="placeholder">
                Aparece na saudação do app.
              </Text>
            </View>

            <Input
              label="Data de nascimento"
              placeholder="dd/mm/aaaa"
              value={birthDate}
              onChangeText={(text) => setBirthDate(maskDate(text))}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(maskCpf(text))}
              keyboardType="number-pad"
              maxLength={14}
            />

            <Checkbox
              label="Tenho autorização do paciente ou do responsável legal para cadastrar estes dados."
              checked={hasAuthorization}
              onChange={setHasAuthorization}
            />
          </ScrollView>

          <View style={footerStyle}>
            <Pressable
              onPress={handleContinue}
              disabled={!canContinue || isSubmitting}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canContinue || isSubmitting }}
              style={({ pressed }) => [
                styles.primaryButton,
                !canContinue && styles.primaryButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text
                size="sm"
                weight="semibold"
                color={canContinue ? "onPrimary" : "textSecondary"}
              >
                Continuar
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
          >
            <View>
              <Text size="md" weight="bold">
                Conectar o celular do paciente
              </Text>
              <Text size="xs" color="textSecondary">
                No celular dele(a), abra o Zelo e digite este código.
              </Text>
            </View>

            <View style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <View style={styles.iconBox}>
                  <InfoIcon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    color={colors.primary}
                  />
                </View>

                <Text size="sm" weight="bold" style={styles.codeTitle}>
                  Código de pareamento:{" "}
                  <Text size="sm" weight="bold" color="primary">
                    {formatCode(pairingCode)}
                  </Text>
                </Text>
              </View>

              <Text size="xs" color="textSecondary">
                Este código pode ser utilizado apenas uma vez e é válido por 24
                horas.
              </Text>
            </View>
          </ScrollView>

          <View style={footerStyle}>
            <Pressable
              onPress={handleShare}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text size="sm" weight="semibold" color="onPrimary">
                Compartilhar código
              </Text>
            </Pressable>

            <Pressable
              onPress={goToProfile}
              accessibilityRole="button"
              style={styles.linkButton}
            >
              <Text size="sm" weight="semibold" color="primary">
                O paciente não vai usar o app
              </Text>
            </Pressable>
          </View>
        </>
      )}

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
    progress: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.three,
    },
    hintField: {
      gap: Spacing.one,
    },
    codeCard: {
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
    },
    codeHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    iconBox: {
      width: ICON_BOX_SIZE,
      height: ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    codeTitle: {
      flex: 1,
    },
    footer: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    primaryButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    primaryButtonDisabled: {
      backgroundColor: colors.backgroundSelected,
    },
    linkButton: {
      alignSelf: "center",
      padding: Spacing.two,
    },
    pressed: {
      opacity: 0.8,
    },
  });
