import { Feather } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Loading } from "@/components/Loading";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { skipDose, type SkipReason } from "@/services/doses";

const REASONS: readonly { value: SkipReason; label: string }[] = [
  { value: "feelingUnwell", label: "Estou passando mal" },
  { value: "ranOut", label: "O remédio acabou" },
  { value: "notNow", label: "Prefiro não tomar agora" },
  { value: "other", label: "Outro motivo" },
];

const ICON_SIZE = 24;
const CHEVRON_SIZE = 20;

export default function SkipDose() {
  const router = useRouter();
  const { doseId } = useLocalSearchParams<{ doseId: string }>();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const goHome = () => {
    router.navigate("/patient" as Href);
  };

  const handleSelect = async (reason: SkipReason) => {
    if (!doseId || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await skipDose({ doseId, reason });

      showSnackbar({
        variant: "success",
        title: "Anotado!",
        message: "Registramos que você não tomou este remédio.",
      });
      goHome();
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

  const renderOption = (value: SkipReason, label: string) => (
    <Pressable
      key={value}
      onPress={() => handleSelect(value)}
      disabled={isSubmitting}
      accessibilityRole="button"
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
    >
      <Text size="md" weight="semibold">
        {label}
      </Text>
      <Feather
        name="chevron-right"
        size={CHEVRON_SIZE}
        color={colors.textSecondary}
      />
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <Pressable
        onPress={goHome}
        hitSlop={Spacing.two}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        style={[styles.back, { paddingTop: insets.top + Spacing.three }]}
      >
        <Feather name="chevron-left" size={ICON_SIZE} color={colors.text} />
        <Text size="md" weight="semibold">
          Voltar
        </Text>
      </Pressable>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View>
          <Text size="lg" weight="bold">
            Por que não vai tomar?
          </Text>
          <Text size="sm" color="textSecondary">
            Isso ajuda quem cuida de você. Tocar numa opção já registra.
          </Text>
        </View>

        {REASONS.map((reason) => renderOption(reason.value, reason.label))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Spacing.three + insets.bottom },
        ]}
      >
        {renderOption("noAnswer", "Prefiro não informar")}
      </View>

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
    back: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.three,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.three,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    pressed: {
      opacity: 0.8,
    },
  });
