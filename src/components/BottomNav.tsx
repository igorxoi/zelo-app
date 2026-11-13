import { Href, Tabs, useRouter, useSegments } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ICON_SIZE, Icons, type IconName } from "@/constants/icons";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

const ROUTE_ICONS: Record<string, IconName> = {
  index: "home",
  history: "calendar",
  medications: "pill",
  profile: "user",
};

const PARENT_TABS: Record<string, string> = {
  notifications: "profile",
};

const PADDING = 10;

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

export function BottomNav({ state, descriptors }: BottomTabBarProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  const basePath = segments[0] === "patient" ? "/patient" : "/caregiver";

  const routeKey = (name: string) => name.split("/").pop() ?? name;

  if (__DEV__) {
    console.log(
      "[BottomNav]",
      state.routes.map((r) => r.name),
      "ativa:",
      state.index,
      "grupo:",
      segments[0],
    );
  }

  const currentRoute = routeKey(state.routes[state.index].name);
  const activeTab = PARENT_TABS[currentRoute] ?? currentRoute;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: PADDING + insets.bottom,
        },
      ]}
    >
      <View
        style={[styles.divider, { backgroundColor: colors.backgroundSelected }]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const key = routeKey(route.name);
        const active = key === activeTab;
        const color = active ? colors.primary : colors.textSecondary;

        const iconName = ROUTE_ICONS[key];
        if (!iconName) return null;

        const Icon = Icons[iconName];

        const handlePress = () => {
          if (focused) return;

          const path = key === "index" ? "" : `/${key}`;
          router.navigate(`${basePath}${path}` as Href);
        };

        return (
          <Pressable
            key={route.key}
            onPress={handlePress}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityLabel={options.title}
            accessibilityState={{ selected: active }}
          >
            <View style={styles.iconWrapper}>
              <Icon width={ICON_SIZE} height={ICON_SIZE} color={color} />
            </View>

            <View
              style={[
                styles.indicator,
                { backgroundColor: active ? colors.primary : "transparent" },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: PADDING,
    paddingTop: PADDING + 1,
    zIndex: 1,
  },
  divider: {
    position: "absolute",
    top: 1,
    left: 0,
    right: 0,
    height: 1,
    pointerEvents: "none",
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.one,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: Radius.sm,
  },
});
