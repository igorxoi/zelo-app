import { useMemo, useState } from "react";
import { Pressable, Share, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { createPairingCode } from "@/services/patients";

type Props = {
  patientId: string;
  patientName: string;
  onClose: () => void;
};

const formatCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

export function PairingCodeSheet({ patientId, patientName, onClose }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSnackbar } = useSnackbar();

  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const firstName = patientName.trim().split(/\s+/)[0];

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const result = await createPairingCode(patientId);
      setCode(result.pairingCode);
    } catch (error) {
      showSnackbar({
        variant: "error",
        title: "Não foi possível gerar o código",
        message:
          error instanceof Error
            ? error.message
            : "Tente novamente em instantes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!code) return;

    try {
      await Share.share({
        message: `Código de acesso do Zelo: ${formatCode(code)}. No celular do paciente, abra o Zelo e digite este código. Ele pode ser usado apenas uma vez e é válido por 24 horas.`,
      });
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível compartilhar",
        message: "Tente novamente em instantes.",
      });
    }
  };

  return (
    <BottomSheet
      visible
      onClose={onClose}
      loading={isLoading}
      title="Código de acesso"
      subtitle={
        code
          ? `Digite no celular de ${firstName}. Vale por 24 horas e só pode ser usado uma vez.`
          : `Gere um novo código para ${firstName} entrar no app. O código anterior deixa de valer.`
      }
    >
      <View style={styles.content}>
        {code && (
          <View style={styles.codeBox}>
            <Text size="xxl" weight="bold" color="primary" style={styles.code}>
              {formatCode(code)}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {code ? (
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
          ) : (
            <Pressable
              onPress={handleGenerate}
              disabled={isLoading}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text size="sm" weight="semibold" color="onPrimary">
                Gerar novo código
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={styles.secondaryButton}
          >
            <Text size="sm" weight="semibold" color="primary">
              {code ? "Concluir" : "Cancelar"}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    content: {
      gap: Spacing.three,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
    },
    codeBox: {
      alignItems: "center",
      paddingVertical: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    code: {
      letterSpacing: 4,
    },
    actions: {
      gap: Spacing.two,
    },
    primaryButton: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    secondaryButton: {
      alignSelf: "center",
      padding: Spacing.two,
    },
    pressed: {
      opacity: 0.8,
    },
  });
