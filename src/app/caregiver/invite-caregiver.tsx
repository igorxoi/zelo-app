import {
  Href,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader } from "@/components/BackHeader";
import { Input } from "@/components/Input";
import { InviteSentSheet } from "@/components/InviteSentSheet";
import { Loading } from "@/components/Loading";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { inviteCaregiver, type CaregiverInvite } from "@/services/patients";
import { isValidEmail } from "@/utils/masks";

export default function InviteCaregiver() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [invite, setInvite] = useState<CaregiverInvite | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setInvite(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return resetForm;
    }, [resetForm]),
  );

  const canSubmit = !!patientId && !!name.trim() && isValidEmail(email);

  const goToProfile = () => {
    router.navigate("/caregiver/profile" as Href);
  };

  const handleSubmit = async () => {
    if (!patientId || !canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await inviteCaregiver({
        patientId,
        name: name.trim(),
        email: email.trim(),
      });

      setInvite(result);
    } catch (error) {
      showSnackbar({
        variant: "error",
        title: "Não foi possível gerar o convite",
        message:
          error instanceof Error
            ? error.message
            : "Algo deu errado ao gerar o convite. Verifique os dados e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <BackHeader title="Convidar cuidador" onBackPress={goToProfile} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text size="md" weight="bold">
          Dados Pessoais
        </Text>

        <View style={styles.hintField}>
          <Input
            label="Nome"
            placeholder="Pedro Silva"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text size="xs" color="placeholder">
            Só para você reconhecer na lista de convites.
          </Text>
        </View>

        <View style={styles.hintField}>
          <Input
            label="E-mail do cuidador"
            placeholder="pedro@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text size="xs" color="placeholder">
            O convite só funciona com esse e-mail.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Spacing.three + insets.bottom },
        ]}
      >
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
            Gerar convite
          </Text>
        </Pressable>
      </View>

      {invite && (
        <InviteSentSheet
          caregiverName={invite.caregiver.name}
          link={invite.link}
          onClose={goToProfile}
        />
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
