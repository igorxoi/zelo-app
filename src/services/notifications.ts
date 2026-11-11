/**
 * Tipos de notificação do cuidador: dose não confirmada no horário
 * ("missedDose") e sintoma relatado pelo paciente ("symptom").
 */
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

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Lista as notificações do cuidador, da mais recente para a mais antiga.
 * TODO: trocar pela chamada da API.
 */
export async function getNotifications(): Promise<AppNotification[]> {
  await wait(600); // simula a requisição

  return [
    {
      id: "1",
      type: "missedDose",
      title: "Dose não confirmada",
      message: "Paracetamol 750mg deveria ter sido tomado às 14:00",
      patientName: "Maria Xavier",
      createdAt: ago(20 * MINUTE),
      read: false,
    },
    {
      id: "2",
      type: "symptom",
      title: "Relato de sintoma",
      message: "Náusea registrada após a medicação das 16:45",
      patientName: "Maria Xavier",
      createdAt: ago(HOUR),
      read: true,
    },
    {
      id: "3",
      type: "missedDose",
      title: "Dose não confirmada",
      message: "Losartana 50mg deveria ter sido tomada às 20:00",
      patientName: "Maria Xavier",
      createdAt: ago(24 * HOUR),
      read: false,
    },
  ];
}
