import { Tabs } from "expo-router";
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

export function BottomNav({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const currentRoute = state.routes[state.index].name;
  const activeTab = PARENT_TABS[currentRoute] ?? currentRoute;

  if (!ROUTE_ICONS[activeTab]) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundSelected,
          paddingBottom: PADDING + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const active = route.name === activeTab;
        const color = active ? colors.primary : colors.textSecondary;

        const iconName = ROUTE_ICONS[route.name];
        if (!iconName) return null;

        const Icon = Icons[iconName];

        const handlePress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
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
    borderTopWidth: 1,
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
