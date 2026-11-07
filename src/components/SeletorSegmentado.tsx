import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Texto } from "@/components/Texto";
import { Espacamento, Raio } from "@/constants/tema";
import { useTema } from "@/hooks/useTema";

export type OpcaoSegmentada<T extends string> = {
  rotulo: string;
  valor: T;
};

type Props<T extends string> = {
  opcoes: readonly OpcaoSegmentada<T>[];
  valor?: T;
  valorInicial?: T;
  onChange?: (valor: T) => void;
};

export function SeletorSegmentado<T extends string>({
  opcoes,
  valor,
  valorInicial,
  onChange,
}: Props<T>) {
  const cores = useTema();

  const [interno, setInterno] = useState<T | undefined>(
    valorInicial ?? opcoes[0]?.valor,
  );
  const selecionado = valor ?? interno;

  const handlePress = (proximo: T) => {
    if (proximo === selecionado) return;
    setInterno(proximo);
    onChange?.(proximo);
  };

  return (
    <View
      style={[estilos.container, { backgroundColor: cores.fundoElemento }]}
      accessibilityRole="tablist"
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === selecionado;

        return (
          <Pressable
            key={opcao.valor}
            onPress={() => handlePress(opcao.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            style={[
              estilos.segmento,
              ativo && { backgroundColor: cores.fundo },
            ]}
          >
            <Texto
              tamanho="p"
              peso={ativo ? "seminegrito" : "media"}
              cor={ativo ? "primaria" : "textoSecundario"}
            >
              {opcao.rotulo}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: Espacamento.dois,
    gap: Espacamento.dois,
    borderRadius: Raio.grande,
  },
  segmento: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Raio.medio,
  },
});
