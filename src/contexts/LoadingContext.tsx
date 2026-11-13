import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

type LoadingState = {
  register: () => () => void;
};

const LoadingContext = createContext<LoadingState | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const colors = useTheme();
  const [visible, setVisible] = useState(false);
  const count = useRef(0);

  const register = useCallback(() => {
    count.current += 1;

    if (count.current === 1) setVisible(true);

    let done = false;

    return () => {
      if (done) return;
      done = true;
      count.current = Math.max(0, count.current - 1);

      if (count.current === 0) setVisible(false);
    };
  }, []);

  const value = useMemo(() => ({ register }), [register]);

  return (
    <LoadingContext.Provider value={value}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        supportedOrientations={["portrait", "landscape"]}
        onRequestClose={() => {}}
      >
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Carregando"
          style={[styles.overlay, { backgroundColor: colors.background }]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
}

export function useLoadingContext() {
  return useContext(LoadingContext);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
