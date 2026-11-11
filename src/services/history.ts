import type { TimelineEvent } from "@/components/Timeline";

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
  /** 0 a 11 */
  month: number;
  year: number;
};

const MOCK_EVENT_MEDICATIONS: Record<string, string> = {
  "1": "1",
  "3": "2",
};

const MOCK_MEDICATIONS: HistoryMedication[] = [
  { id: "1", name: "Losartana", dosage: "50mg" },
  { id: "2", name: "Paracetamol", dosage: "750mg" },
];

const MOCK_EVENTS: TimelineEvent[] = [
  {
    id: "1",
    time: "08:05",
    scheduledTime: "08:00",
    title: "Losartana 50mg tomada",
    description: "Administrado após o café da manhã",
    tag: "Medicamento",
    variant: "medication",
  },
  {
    id: "2",
    time: "11:30",
    title: "Relato de dor",
    description: "Dor leve na região lombar, intensidade 3/10",
    tag: "Anormalidade",
    variant: "abnormality",
  },
  {
    id: "3",
    time: "14:20",
    scheduledTime: "14:00",
    lastChangedBy: "Igor Xavier",
    changes: [
      {
        time: "14:40",
        text: "Igor Xavier mudou de Não tomou para Tomou com atraso. Motivo: esqueci de confirmar.",
      },
      {
        time: "14:30",
        text: "o app marcou como Não tomou, sem confirmação.",
      },
    ],
    title: "Paracetamol 750mg tomado",
    description: "Administrado após o almoço",
    tag: "Medicamento",
    variant: "medication",
  },
  {
    id: "4",
    time: "16:45",
    title: "Relato de náusea",
    description: "Episódio isolado após a medicação",
    tag: "Anormalidade",
    variant: "abnormality",
  },
];

/**
 * Busca os eventos do paciente em um dia.
 * TODO: trocar pela chamada da API.
 */
export async function getHistory({
  patientId,
  date,
  medicationId,
}: GetHistoryParams): Promise<TimelineEvent[]> {
  console.log("getHistory", { patientId, date, medicationId });
  await new Promise((resolve) => setTimeout(resolve, 600));

  const isEmptyDay =
    date.getFullYear() === 2026 &&
    date.getMonth() === 9 &&
    date.getDate() === 1;

  if (isEmptyDay) return [];

  if (medicationId) {
    return MOCK_EVENTS.filter(
      (event) => MOCK_EVENT_MEDICATIONS[event.id] === medicationId,
    );
  }

  return MOCK_EVENTS;
}

/**
 * Medicamentos que tiveram doses no mês. Alimenta o filtro do histórico.
 * TODO: trocar pela chamada da API.
 */
export async function getHistoryMedications({
  patientId,
  month,
  year,
}: GetHistoryMedicationsParams): Promise<HistoryMedication[]> {
  console.log("getHistoryMedications", { patientId, month, year });
  await new Promise((resolve) => setTimeout(resolve, 600)); // simula a requisição

  return MOCK_MEDICATIONS;
}
