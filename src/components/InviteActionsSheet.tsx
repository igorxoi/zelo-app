import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { CancelInviteSheet } from "@/components/CancelInviteSheet";
import { InviteSentSheet } from "@/components/InviteSentSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import {
  resendCaregiverInvite,
  type Caregiver,
  type CaregiverInvite,
} from "@/services/patients";

type Props = {
  patientId: string;
  caregiver: Caregiver;
  onClose: () => void;
  onChanged: () => void;
};

type Step = "actions" | "cancel";

const ICON_BOX_SIZE = 36;
const ICON_SIZE = 18;
const CHEVRON_SIZE = 20;

export function InviteActionsSheet({
  patientId,
  caregiver,
  onClose,
  onChanged,
}: Props) {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSnackbar } = useSnackbar();

  const [step, setStep] = useState<Step>("actions");
  const [resentInvite, setResentInvite] = useState<CaregiverInvite | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = caregiver.inviteExpiresInDays ?? 0;

  const handleResend = async () => {
    setIsSubmitting(true);

    try {
      const invite = await resendCaregiverInvite(patientId, caregiver.id);

      onChanged();
      setResentInvite(invite);
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível reenviar",
        message:
          "Algo deu errado ao gerar o código do convite. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvitePress = () => {
    onClose();
    router.push(`/caregiver/invite-caregiver?patientId=${patientId}` as Href);
  };

  if (resentInvite) {
    return (
      <InviteSentSheet
        caregiverName={caregiver.name}
        code={resentInvite.code}
        email={caregiver.email}
        onClose={onClose}
      />
    );
  }

  if (step === "cancel") {
    return (
      <CancelInviteSheet
        patientId={patientId}
        caregiver={caregiver}
        onClose={() => setStep("actions")}
        onCancelled={() => {
          onChanged();
          onClose();
        }}
      />
    );
  }

  return (
    <BottomSheet
      visible
      onClose={onClose}
      loading={isSubmitting}
      title={caregiver.name}
      subtitle={`Convite pendente, vence em ${days} ${days === 1 ? "dia" : "dias"}`}
    >
      <View style={styles.content}>
        <View>
          <Pressable
            onPress={handleResend}
            disabled={isSubmitting}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.iconBox}>
              <Feather name="share-2" size={ICON_SIZE} color={colors.primary} />
            </View>

            <Text size="sm" weight="medium" style={styles.rowLabel}>
              Reenviar convite
            </Text>

            <Feather
              name="chevron-right"
              size={CHEVRON_SIZE}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable
            onPress={() => setStep("cancel")}
            disabled={isSubmitting}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.iconBox}>
              <Feather name="x" size={ICON_SIZE} color={colors.primary} />
            </View>

            <Text size="sm" weight="medium" style={styles.rowLabel}>
              Cancelar convite
            </Text>

            <Feather
              name="chevron-right"
              size={CHEVRON_SIZE}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={handleInvitePress}
          disabled={isSubmitting}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text size="sm" weight="semibold" color="onPrimary">
            Convidar cuidador
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    content: {
      gap: Spacing.three,
      paddingHorizontal: Spacing.four,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBox: {
      width: ICON_BOX_SIZE,
      height: ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
    },
    rowLabel: {
      flex: 1,
    },
    button: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    pressed: {
      opacity: 0.8,
    },
  });
