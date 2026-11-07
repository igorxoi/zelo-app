import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useTema } from "@/hooks/useTema";

type Props = {
  telaCheia?: boolean;
};

export function Loader({ telaCheia = false }: Props) {
  const cores = useTema();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
      style={[
        estilos.container,
        telaCheia && StyleSheet.absoluteFill,
        telaCheia && { backgroundColor: cores.fundo },
      ]}
    >
      <ActivityIndicator size="large" color={cores.primaria} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
