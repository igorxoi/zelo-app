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

const MOCK_SCHEDULES: Record<string, MedicationSchedule> = {
  losartana: { type: "interval", everyHours: 12, startTime: "08:00" },
  paracetamol: { type: "custom", times: ["08:00", "14:00", "20:00"] },
};

let medications: Medication[] = [
  {
    id: "1",
    patientId: "1",
    name: "Losartana",
    dosage: "50mg",
    schedule: MOCK_SCHEDULES.losartana,
    times: getScheduleTimes(MOCK_SCHEDULES.losartana),
    startDate: "2026-09-01",
    endDate: null,
    notes: "",
  },
  {
    id: "2",
    patientId: "1",
    name: "Paracetamol",
    dosage: "150mg",
    schedule: MOCK_SCHEDULES.paracetamol,
    times: getScheduleTimes(MOCK_SCHEDULES.paracetamol),
    startDate: "2026-09-01",
    endDate: null,
    notes: "Tomar após as refeições",
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Lista os medicamentos ativos do paciente.
 * TODO: trocar pela chamada da API.
 */
export async function getMedications(patientId: string): Promise<Medication[]> {
  await wait(600); // simula a requisição

  return medications.filter((medication) => medication.patientId === patientId);
}

/**
 * Cadastra um medicamento e devolve o registro criado.
 * TODO: trocar pela chamada da API.
 */
export async function createMedication(
  payload: CreateMedicationPayload,
): Promise<Medication> {
  await wait(600);

  if (!payload.name.trim() || !payload.dosage.trim()) {
    throw new Error("Informe o nome e a dosagem do medicamento.");
  }

  const medication: Medication = {
    ...payload,
    id: String(Date.now()),
    times: getScheduleTimes(payload.schedule),
  };

  medications = [...medications, medication];

  return medication;
}

/**
 * Encerra o medicamento: ele sai da lista, mas o histórico de doses já
 * registradas continua disponível.
 * TODO: trocar pela chamada da API.
 */
export async function endMedication(id: string): Promise<void> {
  await wait(600);
  medications = medications.filter((medication) => medication.id !== id);
}
