import { request } from "@/services/api";

export type DoseStatus = "onTime" | "late" | "missed";

export type AlertDoseStatus = "pending" | "missed" | "skipped";

export type Medication = {
  id: string;
  name: string;
  scheduledTime: string;
  status?: AlertDoseStatus;
};

export type ConfirmDosePayload = {
  medicationId: string;
  status: DoseStatus;
  time: string;
  notes: string;
};

export type PatientDose = {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
};

export type SkipReason =
  | "feelingUnwell"
  | "ranOut"
  | "notNow"
  | "other"
  | "noAnswer";

export type SkipDosePayload = {
  doseId: string;
  reason: SkipReason;
};

export function confirmDose({
  medicationId: doseId,
  status,
  time,
  notes,
}: ConfirmDosePayload): Promise<void> {
  return request("POST", `/doses/${doseId}/confirm`, {
    body: { status, time, notes },
  });
}

export function getMissedDoses(patientId: string): Promise<Medication[]> {
  return request<Medication[]>("GET", `/patients/${patientId}/doses/missed`);
}

export function getPendingDoses(_patientId?: string): Promise<PatientDose[]> {
  return request<PatientDose[]>("GET", "/patient/doses/pending");
}

export function takeDose(doseId: string): Promise<{ time: string }> {
  return request<{ time: string }>("POST", `/patient/doses/${doseId}/take`);
}

export function skipDose({ doseId, reason }: SkipDosePayload): Promise<void> {
  return request("POST", `/patient/doses/${doseId}/skip`, {
    body: { reason },
  });
}
