/**
 * Doses de medicamento.
 *
 * Ciclo de uma dose no MVP:
 *   1. O cuidador cadastra o medicamento com os horários (services/medications).
 *   2. Cada horário vira uma dose do dia, com status "pending".
 *   3. O paciente confirma "Tomei" (taken) ou "Não tomei" (skipped, com motivo).
 *   4. Se passar do horário sem confirmação, a dose fica "missed" e o cuidador
 *      vê o alerta na home (DoseAlert) e na tela de notificações.
 */

export type DoseStatus = "onTime" | "late" | "missed";

export type Medication = {
  id: string;
  name: string;
  scheduledTime: string;
};

export type ConfirmDosePayload = {
  medicationId: string;
  status: DoseStatus;
  time: string;
  notes: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Só no mock: doses já respondidas, para não voltarem na lista de pendentes. */
const answeredDoseIds = new Set<string>();

/**
 * Confirmação de dose de medicamento feita pelo cuidador (ex.: o paciente
 * tomou mas esqueceu de confirmar no celular dele).
 * TODO: Registra a confirmação da dose.
 */
export async function confirmDose(payload: ConfirmDosePayload): Promise<void> {
  console.log("confirmDose", payload);
  await wait(600); // simula a requisição
}

/**
 * Doses do paciente que já passaram do horário e não foram confirmadas.
 * Alimenta os alertas (DoseAlert) na home do cuidador.
 * TODO: trocar pela chamada da API.
 */
export async function getMissedDoses(patientId: string): Promise<Medication[]> {
  console.log("getMissedDoses", { patientId });
  await wait(600); // simula a requisição

  return [{ id: "2", name: "Paracetamol 750mg", scheduledTime: "14:00" }];
}

// ---------------------------------------------------------------------------
// App do paciente
// ---------------------------------------------------------------------------

export type PatientDose = {
  id: string;
  /** Nome do medicamento (ex.: "Losartana"). */
  name: string;
  /** Dosagem (ex.: "50mg"). */
  dosage: string;
  /** Horário previsto, "HH:mm". */
  scheduledTime: string;
};

/**
 * Doses de hoje que o paciente ainda precisa confirmar ("Tomei" / "Não tomei").
 * TODO: trocar pela chamada da API.
 */
export async function getPendingDoses(
  patientId: string,
): Promise<PatientDose[]> {
  console.log("getPendingDoses", { patientId });
  await wait(600); // simula a requisição

  const doses: PatientDose[] = [
    { id: "1", name: "Losartana", dosage: "50mg", scheduledTime: "08:00" },
  ];

  return doses.filter((dose) => !answeredDoseIds.has(dose.id));
}

/**
 * Paciente confirma que tomou a dose. O horário real é o do toque no botão;
 * se for depois do previsto, o back-end marca como tomada com atraso.
 * TODO: trocar pela chamada da API.
 */
export async function takeDose(doseId: string): Promise<{ time: string }> {
  console.log("takeDose", { doseId });
  await wait(600); // simula a requisição
  answeredDoseIds.add(doseId);

  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return { time: `${pad(now.getHours())}:${pad(now.getMinutes())}` };
}

/** Motivos que o paciente pode escolher ao tocar em "Não tomei". */
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

/**
 * Paciente informa que não vai tomar a dose. A dose fica como "skipped" e o
 * motivo aparece no histórico do cuidador; "Estou passando mal" e "O remédio
 * acabou" também geram notificação para os cuidadores.
 * TODO: trocar pela chamada da API.
 */
export async function skipDose(payload: SkipDosePayload): Promise<void> {
  console.log("skipDose", payload);
  await wait(600); // simula a requisição
  answeredDoseIds.add(payload.doseId);
}
