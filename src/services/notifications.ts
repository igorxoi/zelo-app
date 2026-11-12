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

export function getNotifications(): Promise<AppNotification[]> {
  return request<AppNotification[]>("GET", "/notifications");
}
