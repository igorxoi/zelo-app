import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/Text";
import { Href, router } from "expo-router";

type Props = {
  title: string;
  linkLabel?: string;
  href?: Href;
  onLinkPress?: () => void;
};

export function SectionHeader({ title, linkLabel, href, onLinkPress }: Props) {
  const handlePress = () => {
    if (onLinkPress) onLinkPress();
    else if (href) router.push(href);
  };

  const showLink = !!linkLabel && (!!href || !!onLinkPress);

  return (
    <View style={styles.header}>
      <Text weight="semibold">{title}</Text>

      {showLink && (
        <Pressable onPress={handlePress} accessibilityRole="link">
          <Text size="sm" weight="medium" color="primary">
            {linkLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
