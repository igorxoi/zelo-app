import { request } from "@/services/api";

export type NotificationType = "missedDose" | "symptom";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  patientName: string;
  createdAt: string;
  read: boolean;
};

export async function getUnreadNotificationsCount(): Promise<number> {
  const result = await request<{ count: number }>(
    "GET",
    "/notifications/unread-count",
  );
  return result.count;
}

export function markAllNotificationsRead(): Promise<void> {
  return request<void>("POST", "/notifications/read-all");
}

export function getNotifications(): Promise<AppNotification[]> {
  return request<AppNotification[]>("GET", "/notifications");
}
