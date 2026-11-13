import { ReactNode } from "react";
import { StyleSheet } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { Text } from "@/components/Text";
import { Spacing } from "@/constants/theme";

type Props = {
  lead: string;
  trail?: ReactNode;
};

export function NoPatientState({ lead, trail = "." }: Props) {
  return (
    <EmptyState
      icon="user-plus"
      title="Nenhum paciente cadastrado"
      style={styles.container}
      message={
        <>
          {lead}{" "}
          <Text size="sm" weight="bold">
            Perfil
          </Text>
          {" > "}
          <Text size="sm" weight="bold">
            Adicionar um novo paciente
          </Text>
          {trail}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.five,
  },
});
