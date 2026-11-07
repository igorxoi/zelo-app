import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { Texto } from "@/components/Texto";
import {
  Espacamento,
  FamiliaFonte,
  Raio,
  TamanhoFonte,
} from "@/constants/tema";
import { useTema } from "@/hooks/useTema";

type Props = TextInputProps & {
  rotulo: string;
};

export function Input({ rotulo, secureTextEntry, style, ...rest }: Props) {
  const cores = useTema();

  const ehSenha = !!secureTextEntry;
  const [oculta, setOculta] = useState(true);

  return (
    <View style={estilos.container}>
      <Texto tamanho="p" peso="seminegrito" cor="texto">
        {rotulo}
      </Texto>

      <View style={[estilos.campo, { borderColor: cores.borda }]}>
        <TextInput
          {...rest}
          secureTextEntry={ehSenha && oculta}
          placeholderTextColor={cores.textoDica}
          style={[estilos.entrada, { color: cores.texto }, style]}
        />

        {ehSenha && (
          <Pressable
            onPress={() => setOculta((anterior) => !anterior)}
            hitSlop={Espacamento.dois}
            accessibilityRole="button"
            accessibilityLabel={oculta ? "Mostrar senha" : "Ocultar senha"}
          >
            <Feather
              name={oculta ? "eye" : "eye-off"}
              size={20}
              color={cores.textoSecundario}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    gap: Espacamento.dois,
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: Raio.medio,
    paddingHorizontal: Espacamento.tres,
    gap: Espacamento.dois,
  },
  entrada: {
    flex: 1,
    height: "100%",
    fontFamily: FamiliaFonte.regular,
    fontSize: TamanhoFonte.p,
  },
});
