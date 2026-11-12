import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader } from "@/components/BackHeader";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { PasswordStrength } from "@/components/PasswordStrength";
import { StepProgress } from "@/components/StepProgress";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { registerCaregiver } from "@/services/auth";
import { takePendingInvite } from "@/utils/invite";
import {
  isCompleteCpf,
  isValidEmail,
  isValidPhone,
  maskCpf,
  maskPhone,
} from "@/utils/masks";
import { isValidPassword } from "@/utils/password";

type Step = "personal" | "account";

const TOTAL_STEPS = 2;

export default function Register() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("personal");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinue =
    !!name.trim() && isValidEmail(email) && isValidPhone(phone);

  const canSubmit =
    isCompleteCpf(cpf) && isValidPassword(password) && hasAcceptedTerms;

  const handleBackPress = () => {
    if (step === "account") {
      setStep("personal");
      return;
    }

    router.back();
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const user = await registerCaregiver({
        name: name.trim(),
        email: email.trim(),
        phone,
        cpf: cpf.replace(/\D/g, ""),
        password,
      });

      await signIn(user);

      const pendingInvite = await takePendingInvite();

      router.replace(
        (pendingInvite ? `/invite/${pendingInvite}` : "/caregiver") as Href,
      );
    } catch (error) {
      showSnackbar({
        variant: "error",
        title: "Não foi possível criar a conta",
        message:
          error instanceof Error
            ? error.message
            : "Algo deu errado ao criar sua conta. Verifique os dados e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerStyle = [
    styles.footer,
    { paddingBottom: Spacing.three + insets.bottom },
  ];

  return (
    <View style={styles.screen}>
      <BackHeader title="Cadastro" onBackPress={handleBackPress} />

      <View style={styles.progress}>
        <StepProgress
          total={TOTAL_STEPS}
          current={step === "personal" ? 1 : 2}
        />
      </View>

      {step === "personal" ? (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Text size="md" weight="bold">
                Vamos começar
              </Text>
              <Text size="xs" color="textSecondary">
                Conte um pouco sobre você.
              </Text>
            </View>

            <Input
              label="Nome completo"
              placeholder="Pedro Silva"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Input
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Telefone (WhatsApp)"
              placeholder="(11) 90000-0000"
              value={phone}
              onChangeText={(text) => setPhone(maskPhone(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </ScrollView>

          <View style={footerStyle}>
            <Pressable
              onPress={() => setStep("account")}
              disabled={!canContinue}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canContinue }}
              style={({ pressed }) => [
                styles.button,
                !canContinue && styles.buttonDisabled,
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
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Text size="md" weight="bold">
                Proteja sua conta
              </Text>
              <Text size="xs" color="textSecondary">
                Dados para identificar você.
              </Text>
            </View>

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(maskCpf(text))}
              keyboardType="number-pad"
              maxLength={14}
            />

            <View style={styles.passwordField}>
              <Input
                label="Senha"
                placeholder="••••••••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <PasswordStrength password={password} />

              <Text size="xs">Mínimo de 8 caracteres, com letra e número.</Text>
            </View>

            <Checkbox
              label={
                <>
                  Li e aceito os{" "}
                  <Text
                    size="xs"
                    weight="bold"
                    color="primary"
                    // TODO: abrir os termos de uso
                    onPress={() => {}}
                  >
                    Termos de uso
                  </Text>{" "}
                  e a{" "}
                  <Text
                    size="xs"
                    weight="bold"
                    color="primary"
                    // TODO: abrir a política de privacidade
                    onPress={() => {}}
                  >
                    Política de privacidade
                  </Text>
                  .
                </>
              }
              checked={hasAcceptedTerms}
              onChange={setHasAcceptedTerms}
            />
          </ScrollView>

          <View style={footerStyle}>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit || isSubmitting }}
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text
                size="sm"
                weight="semibold"
                color={canSubmit ? "onPrimary" : "textSecondary"}
              >
                Criar conta
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
    passwordField: {
      gap: Spacing.two,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    button: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    buttonDisabled: {
      backgroundColor: colors.backgroundSelected,
    },
    pressed: {
      opacity: 0.8,
    },
  });
