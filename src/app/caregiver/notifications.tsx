import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { BackHeader } from "@/components/BackHeader";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Text } from "@/components/Text";
import { Icons, type IconName } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import {
  getNotifications,
  type AppNotification,
  type NotificationType,
} from "@/services/notifications";
import { formatRelativeTime, getDayLabel } from "@/utils/dates";

type Section = {
  label: string;
  notifications: AppNotification[];
};

const ICON_BOX_SIZE = 40;
const ICON_SIZE = 22;
const DOT_SIZE = 8;

const TYPE_STYLES: Record<
  NotificationType,
  { icon: IconName; main: ThemeColor; soft: ThemeColor }
> = {
  missedDose: { icon: "error", main: "danger", soft: "dangerSoft" },
  symptom: { icon: "warning", main: "warning", soft: "warningSoft" },
};

function groupByDay(notifications: AppNotification[]): Section[] {
  const sections: Section[] = [];

  for (const notification of notifications) {
    const label = getDayLabel(notification.createdAt);
    const section = sections.find((item) => item.label === label);

    if (section) {
      section.notifications.push(notification);
    } else {
      sections.push({ label, notifications: [notification] });
    }
  }

  return sections;
}

export default function Notifications() {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestId = useRef(0);

  const loadNotifications = useCallback(async () => {
    const currentRequest = ++requestId.current;
    const isCurrent = () => currentRequest === requestId.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getNotifications();
      if (isCurrent()) setNotifications(result);
    } catch {
      if (isCurrent()) {
        setNotifications([]);
        setErrorMessage("Não foi possível carregar as notificações.");
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const sections = useMemo(() => groupByDay(notifications), [notifications]);

  return (
    <View style={styles.screen}>
      <BackHeader
        title="Notificações"
        onBackPress={() => router.navigate("/caregiver/profile" as Href)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {errorMessage ? (
          <EmptyState
            icon="alert-circle"
            title="Algo deu errado"
            message={errorMessage}
          />
        ) : notifications.length === 0 && !isLoading ? (
          <EmptyState
            icon="bell"
            title="Nenhuma notificação"
            message="Quando houver algo importante, avisamos por aqui."
          />
        ) : (
          sections.map((section) => (
            <View key={section.label}>
              <Text size="md" weight="bold" style={styles.sectionTitle}>
                {section.label}
              </Text>

              {section.notifications.map((notification) => {
                const { icon, main, soft } = TYPE_STYLES[notification.type];
                const Icon = Icons[icon];

                return (
                  <View key={notification.id} style={styles.item}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors[soft] },
                      ]}
                    >
                      <Icon
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                        color={colors[main]}
                      />
                    </View>

                    <View style={styles.info}>
                      <Text size="sm" weight="bold">
                        {notification.title}
                      </Text>
                      <Text size="xs" color="textSecondary">
                        {notification.message}
                      </Text>
                      <Text size="xs" color="placeholder">
                        {notification.patientName} ·{" "}
                        {formatRelativeTime(notification.createdAt)}
                      </Text>
                    </View>

                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {isLoading && <Loading fullScreen />}
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.four,
    },
    sectionTitle: {
      marginBottom: Spacing.one,
    },
    item: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBox: {
      width: ICON_BOX_SIZE,
      height: ICON_BOX_SIZE,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.md,
    },
    info: {
      flex: 1,
      gap: Spacing.half,
    },
    unreadDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      marginTop: Spacing.two,
      backgroundColor: colors.info,
      borderRadius: DOT_SIZE / 2,
    },
  });
