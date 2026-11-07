import { useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Texto } from "@/components/Texto";
import {
  Espacamento,
  FamiliaFonte,
  Raio,
  TamanhoFonte,
} from "@/constants/tema";
import { useTema } from "@/hooks/useTema";

type Props = {
  rotulo?: string;
  ajuda?: string;
  tamanho?: number;
  valor?: string;
  onChange?: (codigo: string) => void;
  onComplete?: (codigo: string) => void;
};

export function InputCodigo({
  rotulo,
  ajuda,
  tamanho = 6,
  valor,
  onChange,
  onComplete,
}: Props) {
  const cores = useTema();
  const refEntrada = useRef<TextInput>(null);

  const [interno, setInterno] = useState("");
  const [focado, setFocado] = useState(false);

  const codigo = valor ?? interno;

  const handleChange = (texto: string) => {
    const proximo = texto.replace(/\D/g, "").slice(0, tamanho);
    setInterno(proximo);
    onChange?.(proximo);
    if (proximo.length === tamanho) onComplete?.(proximo);
  };

  return (
    <View style={estilos.container}>
      {rotulo && (
        <Texto tamanho="p" peso="seminegrito">
          {rotulo}
        </Texto>
      )}

      <Pressable onPress={() => refEntrada.current?.focus()}>
        <View style={estilos.linha}>
          {Array.from({ length: tamanho }).map((_, indice) => {
            const digito = codigo[indice] ?? "";
            const ativo =
              focado && indice === Math.min(codigo.length, tamanho - 1);

            return (
              <View
                key={indice}
                style={[
                  estilos.caixa,
                  {
                    borderColor: ativo ? cores.primaria : cores.borda,
                    backgroundColor: cores.fundo,
                  },
                ]}
              >
                <Texto tamanho="g" peso="seminegrito">
                  {digito}
                </Texto>
              </View>
            );
          })}
        </View>

        {/* Input real, invisível: cuida de teclado, colar e autopreenchimento */}
        <TextInput
          ref={refEntrada}
          value={codigo}
          onChangeText={handleChange}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={tamanho}
          caretHidden
          style={estilos.entradaInvisivel}
          accessibilityLabel={rotulo ?? "Código"}
        />
      </Pressable>

      {ajuda && (
        <Texto tamanho="pp" cor="textoSecundario" style={estilos.ajuda}>
          {ajuda}
        </Texto>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    gap: Espacamento.dois,
  },
  linha: {
    flexDirection: "row",
    gap: Espacamento.dois,
  },
  caixa: {
    flex: 1,
    aspectRatio: 0.85,
    maxHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Raio.medio,
  },
  entradaInvisivel: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
    fontFamily: FamiliaFonte.regular,
    fontSize: TamanhoFonte.m,
  },
  ajuda: {
    textAlign: "center",
  },
});
