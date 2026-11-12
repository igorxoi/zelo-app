import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { CaregiverCard } from "@/components/CaregiverCard";
import { InviteActionsSheet } from "@/components/InviteActionsSheet";
import { Text } from "@/components/Text";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import type { Caregiver } from "@/services/patients";

type Props = {
  patientId: string;
  caregivers: Caregiver[];
  canInvite?: boolean;
  onClose: () => void;
  onChanged: () => void;
};

export function CaregiversSheet({
  patientId,
  caregivers,
  canInvite = true,
  onClose,
  onChanged,
}: Props) {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selected, setSelected] = useState<Caregiver | null>(null);

  const handleInvitePress = () => {
    onClose();
    router.push(`/caregiver/invite-caregiver?patientId=${patientId}` as Href);
  };

  if (selected) {
    return (
      <InviteActionsSheet
        patientId={patientId}
        caregiver={selected}
        onClose={() => setSelected(null)}
        onChanged={onChanged}
      />
    );
  }

  return (
    <BottomSheet visible onClose={onClose} title="Cuidadores">
      <View style={styles.content}>
        {caregivers.map((caregiver) => (
          <CaregiverCard
            key={caregiver.id}
            caregiver={caregiver}
            onPress={
              caregiver.status === "pending"
                ? () => setSelected(caregiver)
                : undefined
            }
          />
        ))}

        {canInvite && (
          <Pressable
            onPress={handleInvitePress}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text size="sm" weight="semibold" color="onPrimary">
              Convidar cuidador
            </Text>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    content: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
    },
    button: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      marginTop: Spacing.two,
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
    },
    pressed: {
      opacity: 0.8,
    },
  });
