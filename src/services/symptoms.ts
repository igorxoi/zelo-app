import { request } from "@/services/api";

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

export function reportSymptom(
  _patientId: string,
  symptom: SymptomType,
): Promise<void> {
  return request("POST", "/patient/symptoms", { body: { symptom } });
}
