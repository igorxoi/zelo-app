import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoticeCard } from "@/components/NoticeCard";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type SnackbarVariant = "success" | "error";

export type SnackbarOptions = {
  variant: SnackbarVariant;
  title: string;
  message?: string;
};

type SnackbarState = {
  snackbar: SnackbarOptions | null;
  progress: Animated.Value;
  showSnackbar: (options: SnackbarOptions) => void;
  hideSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarState | null>(null);

const VISIBLE_DURATION = 4000;
const ANIMATION_DURATION = 200;

function useSnackbarState() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("O Snackbar deve ser usado dentro de um SnackbarProvider");
  }

  return context;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarOptions | null>(null);

  const [progress] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  const hideSnackbar = useCallback(() => {
    clearTimer();

    Animated.timing(progress, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setSnackbar(null);
    });
  }, [progress]);

  const showSnackbar = useCallback(
    (options: SnackbarOptions) => {
      clearTimer();
      setSnackbar(options);

      Animated.timing(progress, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();

      timer.current = setTimeout(hideSnackbar, VISIBLE_DURATION);
    },
    [hideSnackbar, progress],
  );

  useEffect(() => clearTimer, []);

  const value = useMemo(
    () => ({ snackbar, progress, showSnackbar, hideSnackbar }),
    [snackbar, progress, showSnackbar, hideSnackbar],
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <SnackbarHost />
    </SnackbarContext.Provider>
  );
}

export function SnackbarHost() {
  const { snackbar, progress, hideSnackbar } = useSnackbarState();

  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  if (!snackbar) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          top: insets.top + Spacing.two,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-Spacing.four, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={hideSnackbar}
        accessibilityRole="alert"
        accessibilityLabel="Fechar aviso"
        style={styles.card}
      >
        <NoticeCard
          variant={snackbar.variant}
          title={snackbar.title}
          message={snackbar.message}
        />
      </Pressable>
    </Animated.View>
  );
}

export function useSnackbar() {
  const { showSnackbar } = useSnackbarState();

  return { showSnackbar };
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: Spacing.three,
      right: Spacing.three,
      zIndex: 1000,
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: Radius.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
  });
