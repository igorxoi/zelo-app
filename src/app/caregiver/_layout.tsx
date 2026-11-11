import { Tabs } from "expo-router";

import { BottomNav } from "@/components/BottomNav";
import { PatientProvider } from "@/contexts/PatientContext";

export default function CaregiverLayout() {
  return (
    <PatientProvider>
      <Tabs
        tabBar={(props) => <BottomNav {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: "Início" }} />
        <Tabs.Screen name="history" options={{ title: "Histórico" }} />
        <Tabs.Screen name="medications" options={{ title: "Medicamentos" }} />
        <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
        <Tabs.Screen name="new-medication" options={{ href: null }} />
        <Tabs.Screen name="new-patient" options={{ href: null }} />
      </Tabs>
    </PatientProvider>
  );
}
