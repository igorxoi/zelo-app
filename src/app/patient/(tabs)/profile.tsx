import { Feather } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, getInitials } from "@/components/Avatar";
import { BackHeader } from "@/components/BackHeader";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { SignOutSheet } from "@/components/SignOutSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTheme } from "@/hooks/useTheme";
import { getPatientProfile, type PatientProfile } from "@/services/profile";

const USER_AVATAR_SIZE = 48;
const CAREGIVER_AVATAR_SIZE = 32;
const ACTION_ICON_SIZE = 18;

export default function PatientProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showSnackbar } = useSnackbar();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestId = useRef(0);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const currentRequest = ++requestId.current;
    const isCurrent = () => currentRequest === requestId.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getPatientProfile(user.id);
      if (isCurrent()) setProfile(result);
    } catch {
      if (isCurrent()) {
        setProfile(null);
        setErrorMessage("Não foi possível carregar o perfil.");
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleCall = async (phone: string) => {
    try {
      await Linking.openURL(`tel:${phone.replace(/\D/g, "")}`);
    } catch {
      showSnackbar({
        variant: "error",
        title: "Não foi possível ligar",
        message: "Tente ligar pelo telefone do seu aparelho.",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/" as Href);
  };

  return (
    <View style={styles.screen}>
      <BackHeader title="Perfil" hideBack />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {errorMessage ? (
          <EmptyState
            icon="alert-circle"
            title="Algo deu errado"
            message={errorMessage}
          />
        ) : (
          profile && (
            <>
              <View style={styles.userCard}>
                <Avatar
                  size={USER_AVATAR_SIZE}
                  initials={getInitials(profile.nickname)}
                />

                <View>
                  <Text size="md" weight="bold">
                    {profile.nickname}
                  </Text>
                  <Text size="xs" color="textSecondary">
                    {profile.age} anos
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text size="md" weight="bold">
                  Quem cuida de você!
                </Text>

                {profile.caregivers.map((caregiver) => (
                  <View key={caregiver.id} style={styles.caregiverCard}>
                    <View style={styles.caregiverInfo}>
                      <Avatar
                        size={CAREGIVER_AVATAR_SIZE}
                        backgroundColor="primarySoft"
                      />
                      <Text size="sm" weight="semibold">
                        {caregiver.name}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleCall(caregiver.phone)}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.callButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Feather
                        name="phone"
                        size={ACTION_ICON_SIZE}
                        color={colors.onPrimary}
                      />
                      <Text size="sm" weight="semibold" color="onPrimary">
                        Ligar para {caregiver.name.split(" ")[0]}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          )
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Spacing.three + insets.bottom },
        ]}
      >
        <Pressable
          onPress={() => setIsSignOutOpen(true)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.pressed,
          ]}
        >
          <Feather
            name="log-out"
            size={ACTION_ICON_SIZE}
            color={colors.danger}
          />
          <Text size="sm" weight="semibold" color="danger">
            Sair da conta
          </Text>
        </Pressable>
      </View>

      {isSignOutOpen && (
        <SignOutSheet
          description="Você vai parar de receber os lembretes dos seus remédios neste celular. Para voltar, peça um novo código para quem cuida de você."
          notice="Quem cuida de você será avisado."
          onConfirm={handleSignOut}
          onClose={() => setIsSignOutOpen(false)}
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
      gap: Spacing.four,
    },
    userCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
    },
    section: {
      gap: Spacing.three,
    },
    caregiverCard: {
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    caregiverInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    callButton: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    signOutButton: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: Radius.md,
    },
    pressed: {
      opacity: 0.8,
    },
  });
