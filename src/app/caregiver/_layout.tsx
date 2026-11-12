import { Stack } from "expo-router";

import { PatientProvider } from "@/contexts/PatientContext";
import { useTheme } from "@/hooks/useTheme";

export default function CaregiverLayout() {
  const colors = useTheme();

  return (
    <PatientProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new-patient" />
        <Stack.Screen name="new-medication" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="invite-caregiver" />
        <Stack.Screen name="join-invite" />
      </Stack>
    </PatientProvider>
  );
}
