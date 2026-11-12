import { Feather } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Avatar, getInitials } from "@/components/Avatar";
import { BackHeader } from "@/components/BackHeader";
import { CaregiversSheet } from "@/components/CaregiversSheet";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { PairingCodeSheet } from "@/components/PairingCodeSheet";
import { ProfileMenuItem } from "@/components/ProfileMenuItem";
import { RemovePatientSheet } from "@/components/RemovePatientSheet";
import { SignOutSheet } from "@/components/SignOutSheet";
import { SupportSheet } from "@/components/SupportSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/contexts/PatientContext";
import { useTheme } from "@/hooks/useTheme";
import {
  getPatient,
  getPatients,
  type Patient,
  type PatientDetails,
} from "@/services/patients";
import { getUserProfile, type UserProfile } from "@/services/profile";

type Sheet = "support" | "signOut" | null;

const USER_AVATAR_SIZE = 48;
const PATIENT_AVATAR_SIZE = 32;
const TRASH_ICON_SIZE = 20;

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { patientId, setPatientId } = usePatient();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null,
  );
  const [patientToRemove, setPatientToRemove] = useState<Patient | null>(null);
  const [patientForCode, setPatientForCode] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestId = useRef(0);

  const loadProfile = useCallback(async () => {
    const currentRequest = ++requestId.current;
    const isCurrent = () => currentRequest === requestId.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [profileResult, patientsResult] = await Promise.all([
        getUserProfile(),
        getPatients(),
      ]);

      if (isCurrent()) {
        setProfile(profileResult);
        setPatients(patientsResult);
      }
    } catch {
      if (isCurrent()) {
        setProfile(null);
        setPatients([]);
        setErrorMessage("Não foi possível carregar o perfil.");
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const openCaregivers = async (patient: Patient) => {
    setIsLoading(true);

    try {
      setPatientDetails(await getPatient(patient.id));
    } catch {
      setErrorMessage("Não foi possível carregar os cuidadores.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCaregivers = async () => {
    if (!patientDetails) return;

    try {
      setPatientDetails(await getPatient(patientDetails.id));
    } catch {
      setPatientDetails(null);
    }
  };

  const handlePatientRemoved = () => {
    if (patientToRemove?.id === patientId) setPatientId("");
    loadProfile();
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/" as Href);
  };

  return (
    <View style={styles.screen}>
      <BackHeader
        title="Perfil"
        onBackPress={() => router.navigate("/caregiver" as Href)}
      />

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
                  initials={getInitials(profile.name)}
                />

                <View style={styles.userInfo}>
                  <Text size="md" weight="bold">
                    {profile.name}
                  </Text>
                  <Text size="xs" color="textSecondary">
                    {profile.email}
                  </Text>
                  <Text size="xs" color="textSecondary">
                    {profile.phone}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text size="md" weight="bold">
                  Pacientes sob seus cuidados
                </Text>

                {patients.map((patient) => (
                  <View key={patient.id} style={styles.patientRow}>
                    <Pressable
                      onPress={() => openCaregivers(patient)}
                      accessibilityRole="button"
                      accessibilityLabel={`Cuidadores de ${patient.name}`}
                      style={({ pressed }) => [
                        styles.patientCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Avatar
                        size={PATIENT_AVATAR_SIZE}
                        backgroundColor="primarySoft"
                      />

                      <View style={styles.patientInfo}>
                        <Text size="sm" weight="semibold">
                          {patient.name}
                        </Text>
                        {patient.relationship && (
                          <Text size="xs" color="textSecondary">
                            {patient.relationship}
                          </Text>
                        )}
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => setPatientForCode(patient)}
                      hitSlop={Spacing.two}
                      accessibilityRole="button"
                      accessibilityLabel={`Gerar novo código de acesso de ${patient.name}`}
                      style={({ pressed }) => [
                        styles.trashButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Feather
                        name="key"
                        size={TRASH_ICON_SIZE}
                        color={colors.primary}
                      />
                    </Pressable>

                    {patient.isMaster && (
                      <Pressable
                        onPress={() => setPatientToRemove(patient)}
                        hitSlop={Spacing.two}
                        accessibilityRole="button"
                        accessibilityLabel={`Excluir ${patient.name}`}
                        style={({ pressed }) => [
                          styles.trashButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Feather
                          name="trash-2"
                          size={TRASH_ICON_SIZE}
                          color={colors.danger}
                        />
                      </Pressable>
                    )}
                  </View>
                ))}

                <Pressable
                  onPress={() => router.push("/caregiver/new-patient" as Href)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Feather name="plus" size={20} color={colors.primary} />
                  <Text size="sm" weight="semibold" color="primary">
                    Adicionar um novo paciente
                  </Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text size="md" weight="bold">
                  Conta
                </Text>

                <View>
                  <ProfileMenuItem
                    icon="bell"
                    label="Notificações"
                    onPress={() =>
                      router.push("/caregiver/notifications" as Href)
                    }
                  />
                  <ProfileMenuItem
                    icon="user-plus"
                    label="Tenho um convite"
                    onPress={() =>
                      router.push("/caregiver/join-invite" as Href)
                    }
                  />
                  <ProfileMenuItem
                    icon="help-circle"
                    label="Ajuda e suporte"
                    onPress={() => setSheet("support")}
                  />
                  <ProfileMenuItem
                    icon="log-out"
                    label="Sair da conta"
                    onPress={() => setSheet("signOut")}
                  />
                </View>
              </View>
            </>
          )
        )}
      </ScrollView>

      {sheet === "support" && <SupportSheet onClose={() => setSheet(null)} />}

      {sheet === "signOut" && (
        <SignOutSheet
          description="Você vai parar de receber os alertas dos seus pacientes neste celular. Para voltar, entre de novo com seu e-mail e senha."
          onConfirm={handleSignOut}
          onClose={() => setSheet(null)}
        />
      )}

      {patientDetails && profile && (
        <CaregiversSheet
          patientId={patientDetails.id}
          caregivers={patientDetails.caregivers}
          canInvite={
            patients.find((item) => item.id === patientDetails.id)?.isMaster ??
            false
          }
          onClose={() => setPatientDetails(null)}
          onChanged={refreshCaregivers}
        />
      )}

      {patientForCode && (
        <PairingCodeSheet
          patientId={patientForCode.id}
          patientName={patientForCode.name}
          onClose={() => setPatientForCode(null)}
        />
      )}

      {patientToRemove && (
        <RemovePatientSheet
          patientId={patientToRemove.id}
          onClose={() => setPatientToRemove(null)}
          onRemoved={handlePatientRemoved}
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
      alignItems: "flex-start",
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.lg,
    },
    userInfo: {
      flex: 1,
    },
    section: {
      gap: Spacing.three,
    },
    patientRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    patientInfo: {
      flex: 1,
    },
    trashButton: {
      padding: Spacing.two,
    },
    patientCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      padding: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
      height: 48,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: Radius.md,
    },
    pressed: {
      opacity: 0.8,
    },
  });
