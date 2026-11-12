import { type ComponentRef, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { DoseAlert } from "@/components/DoseAlert";
import { Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import type { Medication } from "@/services/doses";

type Props = {
  doses: Medication[];
  onResolved?: () => void;
};

const DOT_SIZE = 8;
const ACTIVE_DOT_WIDTH = 20;

export function DoseAlertCarousel({ doses, onResolved }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(
    Dimensions.get("window").width - Spacing.three * 2,
  );
  const [rawIndex, setIndex] = useState(0);
  const index = Math.min(rawIndex, Math.max(doses.length - 1, 0));
  const [heights, setHeights] = useState<Record<string, number>>({});
  const knownIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    const current = new Set(doses.map((dose) => dose.id));
    const previous = knownIds.current;
    knownIds.current = current;

    if (previous && doses.some((dose) => !previous.has(dose.id))) {
      scrollRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [doses]);

  useEffect(() => {
    if (doses.length > 0 && rawIndex > doses.length - 1) {
      scrollRef.current?.scrollTo({
        x: (doses.length - 1) * width,
        animated: false,
      });
    }
  }, [doses.length, rawIndex, width]);

  if (doses.length === 0) return null;

  const handleLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (next > 0 && next !== width) setWidth(next);
  };

  const handlePageLayout = (id: string, event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setHeights((previous) =>
      previous[id] === height ? previous : { ...previous, [id]: height },
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.min(Math.max(page, 0), doses.length - 1));
  };

  return (
    <View onLayout={handleLayout} style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        style={{ height: heights[doses[index]?.id] }}
        contentContainerStyle={styles.pages}
      >
        {doses.map((dose) => (
          <View
            key={dose.id}
            style={{ width }}
            onLayout={(event) => handlePageLayout(dose.id, event)}
          >
            <DoseAlert medication={dose} onResolved={onResolved} />
          </View>
        ))}
      </ScrollView>

      {doses.length > 1 && (
        <View
          style={styles.dots}
          accessibilityRole="adjustable"
          accessibilityLabel={`Alerta ${index + 1} de ${doses.length}`}
        >
          {doses.map((dose, position) => (
            <View
              key={dose.id}
              style={[styles.dot, position === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.two,
    },
    pages: {
      alignItems: "flex-start",
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.one,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: colors.border,
    },
    activeDot: {
      width: ACTIVE_DOT_WIDTH,
      backgroundColor: colors.primary,
    },
  });
