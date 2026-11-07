import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const CHAVE_ARMAZENAMENTO = "zelo:usuario";

export type Usuario = {
  id: string;
  nome: string;
  perfil: "cuidador" | "paciente";
};

type ValorAutenticacao = {
  usuario: Usuario | null;
  carregando: boolean;
  login: (usuario: Usuario) => Promise<void>;
  logout: () => Promise<void>;
};

const AutenticacaoContext = createContext<ValorAutenticacao | null>(null);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE_ARMAZENAMENTO);
        if (salvo) setUsuario(JSON.parse(salvo));
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const login = async (proximo: Usuario) => {
    await AsyncStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(proximo));
    setUsuario(proximo);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(CHAVE_ARMAZENAMENTO);
    setUsuario(null);
  };

  return (
    <AutenticacaoContext.Provider
      value={{ usuario, carregando, login, logout }}
    >
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext);
  if (!contexto)
    throw new Error(
      "useAutenticacao deve ser usado dentro de AutenticacaoProvider",
    );
  return contexto;
}
