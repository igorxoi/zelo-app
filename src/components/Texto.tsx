import { Text as RNText, TextProps } from "react-native";

import {
  FamiliaFonte,
  TamanhoFonte,
  type CorDoTema,
  type PesoFonte,
  type TokenTamanhoFonte,
} from "@/constants/tema";
import { useTema } from "@/hooks/useTema";

type Props = TextProps & {
  tamanho?: TokenTamanhoFonte;
  peso?: PesoFonte;
  cor?: CorDoTema;
};

export function Texto({
  tamanho = "m",
  peso = "regular",
  cor = "texto",
  style,
  ...rest
}: Props) {
  const cores = useTema();

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: FamiliaFonte[peso],
          fontSize: TamanhoFonte[tamanho],
          color: cores[cor],
        },
        style,
      ]}
    />
  );
}
