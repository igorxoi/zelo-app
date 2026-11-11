import { Tabs } from "expo-router";

import { BottomNav } from "@/components/BottomNav";

/**
 * Navegação do app do paciente: só duas abas (Início e Perfil). A tela de
 * motivo ("Não tomei") fica fora da barra e a BottomNav some nela.
 */
export default function PatientLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen name="skip-dose" options={{ href: null }} />
    </Tabs>
  );
}
