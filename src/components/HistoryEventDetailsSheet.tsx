import { type ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Text } from "@/components/Text";
import type { TimelineEvent } from "@/components/Timeline";
import { Icons } from "@/constants/icons";
import { Radius, Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  event: TimelineEvent;
  onClose: () => void;
};

type Row = { label: string; value: string };

const HEADER_ICON_SIZE = 22;
const INFO_ICON_SIZE = 16;

function getRows(event: TimelineEvent): Row[] {
  const rows: Row[] = [];

  if (event.variant === "medication" || event.variant === "missed") {
    if (event.scheduledTime) {
      rows.push({ label: "Previsto para", value: event.scheduledTime });
    }

    if (event.skipReason) {
      rows.push({ label: "Situação", value: "Não tomou" });
      rows.push({ label: "Motivo", value: event.skipReason });
    } else {
      rows.push({ label: "Tomada às", value: event.time });
    }
  } else {
    rows.push({ label: "Horário do relato", value: event.time });
  }

  if (event.lastChangedBy) {
    rows.push({ label: "Última alteração", value: event.lastChangedBy });
  }

  return rows;
}

export function HistoryEventDetailsSheet({ event, onClose }: Props) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isMissed = event.variant === "missed";
  const isMedication = event.variant === "medication" || isMissed;
  const rows = getRows(event);
  const changes = event.changes ?? [];

  const HeaderIcon = isMedication ? Icons.pill : Icons.warning;

  const accentColor = isMissed
    ? colors.warning
    : isMedication
      ? colors.primary
      : colors.danger;

  const accentSoftColor = isMissed
    ? colors.warningSoft
    : isMedication
      ? colors.primarySoft
      : colors.dangerSoft;

  const subtitle =
    isMedication && event.scheduledTime
      ? `Previsto para ${event.scheduledTime}`
      : `Registrado às ${event.time}`;

  return (
    <>
      <BottomSheet visible onClose={onClose}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View
              style={[styles.iconWrapper, { backgroundColor: accentSoftColor }]}
            >
              <HeaderIcon
                width={HEADER_ICON_SIZE}
                height={HEADER_ICON_SIZE}
                color={accentColor}
              />
            </View>

            <View style={styles.headerText}>
              <Text size="md" weight="semibold">
                {event.title}
              </Text>
              <Text size="xs" color="textSecondary">
                {subtitle}
              </Text>
            </View>
          </View>

          <View>
            {rows.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.row,
                  index < rows.length - 1 && styles.rowDivider,
                ]}
              >
                <Text size="sm">{row.label}</Text>
                <Text size="sm" weight="semibold">
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {changes.length > 0 && (
            <InfoBox title="Alterações">
              {changes.map((change) => (
                <Text
                  key={`${change.time}-${change.text}`}
                  size="xs"
                  color="textSecondary"
                >
                  <Text size="xs" weight="bold">
                    {change.time}
                  </Text>
                  , {change.text}
                </Text>
              ))}
            </InfoBox>
          )}
        </View>
      </BottomSheet>
    </>
  );
}

type InfoBoxProps = {
  title: string;
  children: ReactNode;
};

function InfoBox({ title, children }: InfoBoxProps) {
  const colors = useTheme();
  const styles = useMemo(() => createInfoBoxStyles(colors), [colors]);

  const InfoIcon = Icons.info;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <InfoIcon
          width={INFO_ICON_SIZE}
          height={INFO_ICON_SIZE}
          color={colors.textSecondary}
        />
        <Text size="xs" weight="bold">
          {title}
        </Text>
      </View>

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const createStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: Spacing.four,
      gap: Spacing.three,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.md,
    },
    headerText: {
      flex: 1,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Spacing.three,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
  });

const createInfoBoxStyles = (colors: Record<ThemeColor, string>) =>
  StyleSheet.create({
    container: {
      gap: Spacing.two,
      padding: Spacing.three,
      backgroundColor: colors.backgroundElement,
      borderRadius: Radius.md,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    body: {
      gap: Spacing.two,
    },
  });
