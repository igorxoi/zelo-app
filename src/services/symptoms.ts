/**
 * Diário de sintomas do paciente ("Como está se sentindo hoje?").
 * Cada toque vira um relato no histórico do cuidador (etiqueta "Anormalidade")
 * e uma notificação do tipo "symptom".
 */

export type SymptomType =
  | "pain"
  | "nausea"
  | "dizziness"
  | "fatigue"
  | "shortnessOfBreath"
  | "other";

export const SYMPTOMS: readonly {
  value: SymptomType;
  label: string;
  emoji: string;
}[] = [
  { value: "pain", label: "Dor", emoji: "🤕" },
  { value: "nausea", label: "Enjoo", emoji: "🤢" },
  { value: "dizziness", label: "Tontura", emoji: "😵‍💫" },
  { value: "fatigue", label: "Cansaço", emoji: "😴" },
  { value: "shortnessOfBreath", label: "Falta de ar", emoji: "😮‍💨" },
  { value: "other", label: "Outro", emoji: "🤔" },
];

/**
 * Registra um sintoma relatado pelo paciente.
 * TODO: trocar pela chamada da API.
 */
export async function reportSymptom(
  patientId: string,
  symptom: SymptomType,
): Promise<void> {
  console.log("reportSymptom", { patientId, symptom });
  await new Promise((resolve) => setTimeout(resolve, 600)); // simula a requisição
}
