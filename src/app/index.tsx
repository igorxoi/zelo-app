import { Href, Redirect, router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CodeInput } from "@/components/CodeInput";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Text } from "@/components/Text";
import { ToggleGroup } from "@/components/ToggleGroup";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { type Profile, signInCaregiver, signInPatient } from "@/services/auth";

const PROFILE_OPTIONS = [
  { label: "Sou cuidador", value: "caregiver" },
  { label: "Sou paciente", value: "patient" },
] as const;

export default function LoginScreen() {
  const { user, loading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile>("caregiver");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (completeCode?: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const signedUser =
        profile === "caregiver"
          ? await signInCaregiver({ email, password })
          : await signInPatient(completeCode ?? code);

      await signIn(signedUser);

      router.replace(
        (signedUser.profile === "caregiver"
          ? "/caregiver"
          : "/patient") as Href,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível entrar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    router.push("/register" as Href);
  };

  const handleProfileChange = (value: Profile) => {
    setProfile(value);

    setEmail("");
    setPassword("");
    setCode("");
    setErrorMessage(null);
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Loading fullScreen />
      </View>
    );
  }

  if (user) {
    return (
      <Redirect
        href={
          (user.profile === "caregiver" ? "/caregiver" : "/patient") as Href
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require("@/assets/logo.png")} style={styles.logo} />
        <Text size="xl" weight="semibold">
          Bem-vindo a Zelo
        </Text>
        <Text size="sm" color="textSecondary" style={styles.subtitle}>
          Entre para acompanhar o tratamento de quem você cuida.
        </Text>
      </View>

      <ToggleGroup
        options={PROFILE_OPTIONS}
        value={profile}
        onChange={handleProfileChange}
      />

      {profile === "caregiver" ? (
        <View style={styles.form}>
          <Input
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/*
            "Esqueci minha senha" fica fora do MVP (exige envio de e-mail).
            Quando entrar, volta aqui com um handler que abre a recuperação.
          */}
        </View>
      ) : (
        <CodeInput
          label="Código do seu cuidador"
          helper="São 6 números."
          value={code}
          onChange={setCode}
          onComplete={(completeCode) => handleSignIn(completeCode)}
        />
      )}

      {errorMessage && (
        <Text
          size="xs"
          color="danger"
          accessibilityRole="alert"
          style={styles.error}
        >
          {errorMessage}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSignIn()}
        disabled={isSubmitting}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text weight="semibold" color="onPrimary" size="sm">
          Entrar
        </Text>
      </TouchableOpacity>

      <Text size="xs" color="textSecondary" style={styles.footer}>
        {profile === "caregiver" ? (
          <>
            Não tem uma conta?{" "}
            <Text
              size="xs"
              weight="semibold"
              color="primary"
              onPress={handleSignUp}
            >
              Criar conta
            </Text>
          </>
        ) : (
          "Não tem o código? Peça para quem cuida de você."
        )}
      </Text>

      {isSubmitting && <Loading fullScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    justifyContent: "center",
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  logo: {
    width: 56,
    height: 56,
  },
  form: {
    gap: Spacing.three,
  },
  error: {
    textAlign: "center",
  },
  button: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    textAlign: "center",
  },
});
