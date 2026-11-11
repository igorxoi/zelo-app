import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"] as const;

const DAY_WIDTH = 56;
const GAP = Spacing.two;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

type Props = {
  dates: readonly Date[];
  value: Date;
  onChange: (date: Date) => void;
};

export function DateSelector({ dates, value, onChange }: Props) {
  const colors = useTheme();

  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const firstScroll = useRef(true);

  useEffect(() => {
    if (width === 0) return;

    const index = dates.findIndex((date) => isSameDay(date, value));
    if (index < 0) return;

    const itemCenter =
      Spacing.three + index * (DAY_WIDTH + GAP) + DAY_WIDTH / 2;
    const x = Math.max(0, itemCenter - width / 2);

    scrollRef.current?.scrollTo({ x, animated: !firstScroll.current });
    firstScroll.current = false;
  }, [value, dates, width]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.days}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {dates.map((date) => {
          const active = isSameDay(date, value);

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onChange(date)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.day,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundElement,
                },
              ]}
            >
              <Text
                size="md"
                weight="semibold"
                color={active ? "onPrimary" : "text"}
              >
                {String(date.getDate()).padStart(2, "0")}
              </Text>
              <Text size="xs" color={active ? "onPrimary" : "textSecondary"}>
                {WEEKDAYS[date.getDay()]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  scroll: {
    marginHorizontal: -Spacing.three,
  },
  days: {
    gap: GAP,
    paddingHorizontal: Spacing.three,
  },
  day: {
    width: DAY_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
});
