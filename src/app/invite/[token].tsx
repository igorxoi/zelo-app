import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader } from "@/components/BackHeader";
import { Loading } from "@/components/Loading";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import {
  acceptInvite,
  getInvite,
  type InvitePreview,
} from "@/services/patients";
import { normalizeInviteCode } from "@/utils/invite";

export default function AcceptInvite() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const code = normalizeInviteCode(token ?? "");
  const { user, loading: authLoading } = useAuth();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [isLoading, setIsLoading] = useState(code.length > 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!code) return;
    let active = true;

    getInvite(code)
      .then((result) => active && setInvite(result))
      .catch((error) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível abrir o convite.",
        );
      })
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [code]);

  const goHome = useCallback(() => {
    router.replace(
      (user?.profile === "patient" ? "/patient" : "/caregiver") as Href,
    );
  }, [router, user]);

  const goToLogin = (path: "/" | "/register") => {
    router.replace(path as Href);
  };

  const handleAccept = async () => {
    if (!code || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const patient = await acceptInvite(code);

      showSnackbar({
        variant: "success",
        title: "Convite aceito",
        message: `Agora você acompanha ${patient.name}.`,
      });
      router.replace("/caregiver" as Href);
    } catch (error) {
      showSnackbar({
        variant: "error",
        title: "Não foi possível aceitar o convite",
        message:
          error instanceof Error
            ? error.message
            : "Algo deu errado. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBody = () => {
    if (isLoading || authLoading) return <Loading fullScreen />;

    if (errorMessage || !invite) {
      return (
        <View style={styles.card}>
          <Text size="md" weight="bold">
            Convite indisponível
          </Text>
          <Text size="sm" color="textSecondary">
            {errorMessage ??
              "Este convite expirou ou foi cancelado. Peça um novo código ao cuidador master."}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text size="md" weight="bold">
          {invite.invitedBy} convidou você
        </Text>
        <Text size="sm" color="textSecondary">
          Para ajudar a cuidar de {invite.patientName} no Zelo. Você vai
          acompanhar os medicamentos, o histórico e os alertas.
        </Text>
        <Text size="xs" color="placeholder">
          Convite para {invite.email}
        </Text>
      </View>
    );
  };

  const canAnswer = !!invite && !errorMessage && !isLoading && !authLoading;

  const renderActions = () => {
    if (!canAnswer) {
      return (
        <Button label="Voltar" onPress={goHome} styles={styles} secondary />
      );
    }

    if (!user) {
      return (
        <>
          <Text size="xs" color="textSecondary" style={styles.hint}>
            Entre ou crie uma conta com o e-mail {invite?.email}. Depois, use
            Perfil &gt; Tenho um convite e digite o código.
          </Text>
          <Button
            label="Entrar"
            onPress={() => goToLogin("/")}
            styles={styles}
          />
          <Button
            label="Criar conta"
            onPress={() => goToLogin("/register")}
            styles={styles}
            secondary
          />
        </>
      );
    }

    if (user.profile === "patient") {
      return (
        <>
          <Text size="xs" color="textSecondary" style={styles.hint}>
            Este convite é para cuidadores. Saia da conta do paciente para
            aceitar.
          </Text>
          <Button label="Voltar" onPress={goHome} styles={styles} secondary />
        </>
      );
    }

    return (
      <>
        <Button
          label="Aceitar convite"
          onPress={handleAccept}
          disabled={isSubmitting}
          styles={styles}
        />
        <Button label="Agora não" onPress={goHome} styles={styles} secondary />
      </>
    );
  };

  return (
    <View style={styles.screen}>
      <BackHeader title="Convite" onBackPress={goHome} />

      <View style={styles.content}>{renderBody()}</View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Spacing.three + insets.bottom },
        ]}
      >
        {renderActions()}
      </View>

      {isSubmitting && <Loading fullScreen />}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  secondary?: boolean;
  disabled?: boolean;
};

function Button({ label, onPress, styles, secondary, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        size="sm"
        weight="semibold"
        color={secondary ? "primary" : "onPrimary"}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: Spacing.three,
    },
    card: {
      gap: Spacing.two,
      padding: Spacing.three,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundElement,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      gap: Spacing.two,
    },
    hint: {
      textAlign: "center",
    },
    button: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    pressed: {
      opacity: 0.8,
    },
  });
