import { request } from "@/services/api";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: readonly { value: Weekday; label: string }[] = [
  { value: "mon", label: "Seg" },
  { value: "tue", label: "Ter" },
  { value: "wed", label: "Qua" },
  { value: "thu", label: "Qui" },
  { value: "fri", label: "Sex" },
  { value: "sat", label: "Sáb" },
  { value: "sun", label: "Dom" },
];

export type MedicationSchedule =
  | { type: "interval"; everyHours: number; startTime: string }
  | { type: "daily"; time: string }
  | { type: "weekdays"; days: Weekday[]; time: string }
  | { type: "custom"; times: string[] };

export type ScheduleType = MedicationSchedule["type"];

export type Medication = {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  schedule: MedicationSchedule;
  times: string[];
  startDate: string;
  endDate: string | null;
  notes: string;
};

export type CreateMedicationPayload = {
  patientId: string;
  name: string;
  dosage: string;
  schedule: MedicationSchedule;
  startDate: string;
  endDate: string | null;
  notes: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function getScheduleTimes(schedule: MedicationSchedule): string[] {
  switch (schedule.type) {
    case "interval": {
      const [hour, minute] = schedule.startTime.split(":").map(Number);
      const doses = Math.floor(24 / schedule.everyHours);

      return Array.from({ length: doses }, (_, index) => {
        const doseHour = (hour + index * schedule.everyHours) % 24;
        return `${pad(doseHour)}:${pad(minute)}`;
      }).sort();
    }
    case "daily":
      return [schedule.time];
    case "weekdays":
      return [schedule.time];
    case "custom":
      return [...schedule.times].sort();
  }
}

function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function getMedicationSummary(medication: Medication): string {
  const { schedule, endDate } = medication;

  const frequency = (() => {
    switch (schedule.type) {
      case "interval":
        return `A cada ${schedule.everyHours}h`;
      case "daily":
        return "Uma vez ao dia";
      case "weekdays":
        return WEEKDAYS.filter((day) => schedule.days.includes(day.value))
          .map((day) => day.label)
          .join(", ");
      case "custom":
        return "Horários personalizados";
    }
  })();

  const period = endDate ? `Até ${formatDate(endDate)}` : "Uso contínuo";

  return `${frequency} · ${period}`;
}

export function getMedications(patientId: string): Promise<Medication[]> {
  return request<Medication[]>("GET", `/patients/${patientId}/medications`);
}

export async function createMedication({
  patientId,
  ...payload
}: CreateMedicationPayload): Promise<Medication> {
  if (!payload.name.trim() || !payload.dosage.trim()) {
    throw new Error("Informe o nome e a dosagem do medicamento.");
  }

  return request<Medication>("POST", `/patients/${patientId}/medications`, {
    body: payload,
  });
}

export function endMedication(id: string): Promise<void> {
  return request("DELETE", `/medications/${id}`);
}
