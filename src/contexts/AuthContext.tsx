import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAuthToken,
  setAuthToken,
  setUnauthorizedHandler,
} from "@/services/api";

const STORAGE_KEY = "zelo:session";

export type User = {
  id: string;
  name: string;
  profile: "caregiver" | "patient";
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sessão do usuário logado (cuidador ou paciente). O usuário e o token da API
 * ficam salvos no aparelho (AsyncStorage) para o app abrir direto na home.
 * `signOut` apaga a sessão; o paciente só volta com um novo código de
 * pareamento. Se a API recusar o token (sessão vencida), o app sai sozinho.
 *
 * Os services de login (services/auth) guardam o token ao entrar; o `signIn`
 * daqui só salva usuário e token no aparelho.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const session = JSON.parse(saved) as { user: User; token: string };
          setAuthToken(session.token);
          setUser(session.user);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (next: User) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: next, token: getAuthToken() }),
    );
    setUser(next);
  };

  const signOut = useCallback(async () => {
    setAuthToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
