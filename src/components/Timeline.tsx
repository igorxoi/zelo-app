import { Pressable, StyleSheet, View } from "react-native";

import { Tag, TagVariant } from "@/components/Tag";
import { Text } from "@/components/Text";
import { ICON_SIZE, Icons } from "@/constants/icons";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type EventChange = {
  time: string;
  text: string;
};

export type TimelineEvent = {
  id: string;
  time: string;
  scheduledTime?: string;
  title: string;
  description: string;
  tag: string;
  variant: TagVariant;
  lastChangedBy?: string;
  changes?: EventChange[];
  skipReason?: string;
};

type ItemProps = {
  event: TimelineEvent;
  isLast: boolean;
  showDetails?: boolean;
  onEventPress?: (event: TimelineEvent) => void;
};

function TimelineItem({
  event,
  isLast,
  showDetails = false,
  onEventPress,
}: ItemProps) {
  const colors = useTheme();

  const Icon = Icons.arrowRight;

  const dotColor =
    event.variant === "abnormality" ? colors.danger : colors.primary;

  return (
    <View style={styles.item}>
      <Text size="xs" color="textSecondary" style={styles.time}>
        {event.time}
      </Text>

      <View style={styles.track}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        {!isLast && (
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        )}
      </View>

      <View style={[styles.content, !isLast && styles.contentSpacing]}>
        <Text weight="semibold" size="sm">
          {event.title}
        </Text>
        <Text size="xs" color="textSecondary">
          {event.description}
        </Text>
        {event.scheduledTime && !event.skipReason && (
          <Text size="xs" color="textSecondary">
            Previsto {event.scheduledTime} · Tomado {event.time}
          </Text>
        )}
        <Tag label={event.tag} variant={event.variant} />
      </View>

      {showDetails && (
        <Pressable
          onPress={() => onEventPress?.(event)}
          hitSlop={Spacing.two}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalhes: ${event.title}`}
          style={styles.icon}
        >
          <Icon
            width={ICON_SIZE}
            height={ICON_SIZE}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
}

type Props = {
  events: readonly TimelineEvent[];
  showDetails?: boolean;
  onEventPress?: (event: TimelineEvent) => void;
};

export function Timeline({ events, showDetails = false, onEventPress }: Props) {
  return (
    <View style={styles.container}>
      <View>
        {events.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            showDetails={showDetails}
            isLast={index === events.length - 1}
            onEventPress={onEventPress}
          />
        ))}
      </View>
    </View>
  );
}

const DOT_SIZE = 10;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  item: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  time: {
    width: 44,
    paddingTop: Spacing.half,
  },
  track: {
    alignItems: "center",
    width: DOT_SIZE,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginTop: Spacing.one,
  },
  line: {
    flex: 1,
    width: 1,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  contentSpacing: {
    paddingBottom: Spacing.four,
  },
  icon: {
    alignSelf: "center",
  },
});
