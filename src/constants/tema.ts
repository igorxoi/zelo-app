import "@/global.css";
import { Platform } from "react-native";

export const Cores = {
  claro: {
    texto: "#1A1A2E",
    textoSecundario: "#6B6B85",
    fundo: "#FFFFFF",
    fundoElemento: "#F0F0F3",
    fundoSelecionado: "#E0E1E6",
    primaria: "#3D9E86",
    primariaClara: "#E9F7F3",
    sobrePrimaria: "#FFFFFF",
    borda: "#CCCCCC",
    bordaClara: "#ECECF5",
    textoDica: "#999999",
    primariaSuave: "#E3F3EF",
    perigo: "#E0374B",
    perigoSuave: "#FFE9E9",
    alerta: "#D98C00",
    alertaSuave: "#FFF4E0",
    informacao: "#4C4DDC",
    informacaoSuave: "#ECECFD",
  },
} as const;

export type CorDoTema = keyof typeof Cores.claro;

/** Poppins carregada uma vez no _layout. No Android cada peso é uma família própria. */
export const FamiliaFonte = {
  regular: "Poppins_400Regular",
  media: "Poppins_500Medium",
  seminegrito: "Poppins_600SemiBold",
  negrito: "Poppins_700Bold",
} as const;

export type PesoFonte = keyof typeof FamiliaFonte;

/** pp = extra pequeno, p = pequeno, m = médio, g = grande, gg = extra grande, ggg = enorme */
export const TamanhoFonte = {
  pp: 12,
  p: 14,
  m: 16,
  g: 18,
  gg: 22,
  ggg: 26,
} as const;
export type TokenTamanhoFonte = keyof typeof TamanhoFonte;

export const Espacamento = {
  meio: 2,
  um: 4,
  dois: 8,
  tres: 16,
  quatro: 24,
  cinco: 32,
  seis: 64,
} as const;

export const Raio = {
  pequeno: 8,
  medio: 10,
  grande: 16,
} as const;

export const Fontes = Platform.select({
  ios: {
    semSerifa: "system-ui",
    serifa: "ui-serif",
    arredondada: "ui-rounded",
    monoespacada: "ui-monospace",
  },
  default: {
    semSerifa: "normal",
    serifa: "serif",
    arredondada: "normal",
    monoespacada: "monospace",
  },
  web: {
    semSerifa: "var(--fonte-titulo)",
    serifa: "var(--fonte-serifa)",
    arredondada: "var(--fonte-arredondada)",
    monoespacada: "var(--fonte-monoespacada)",
  },
});

export const MargemInferiorAbas = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const LarguraMaximaConteudo = 800;
