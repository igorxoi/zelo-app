import type { TimelineEvent } from "@/components/Timeline";
import { request } from "@/services/api";

export type GetHistoryParams = {
  patientId: string;
  date: Date;
  medicationId?: string | null;
};

export type HistoryMedication = {
  id: string;
  name: string;
  dosage: string;
};

export type GetHistoryMedicationsParams = {
  patientId: string;
  month: number;
  year: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

const toApiDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function getHistory({
  patientId,
  date,
  medicationId,
}: GetHistoryParams): Promise<TimelineEvent[]> {
  const query = new URLSearchParams({ date: toApiDate(date) });
  if (medicationId) query.set("medicationId", medicationId);

  return request<TimelineEvent[]>(
    "GET",
    `/patients/${patientId}/history?${query}`,
  );
}

export function getHistoryMedications({
  patientId,
  month,
  year,
}: GetHistoryMedicationsParams): Promise<HistoryMedication[]> {
  return request<HistoryMedication[]>(
    "GET",
    `/patients/${patientId}/history/medications?month=${month}&year=${year}`,
  );
}
