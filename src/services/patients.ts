export type CaregiverStatus = "active" | "pending";

export type Caregiver = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CaregiverStatus;
  inviteExpiresInDays?: number;
};

export type Patient = {
  id: string;
  name: string;
  relationship?: string;
};

export type PatientDetails = Patient & {
  nickname: string;
  birthDate: string;
  caregivers: Caregiver[];
};

export type CreatePatientPayload = {
  fullName: string;
  nickname: string;
  birthDate: string;
  cpf: string;
};

export type CreatePatientResult = {
  patient: Patient;
  pairingCode: string;
};

export type UpdatePatientPayload = {
  fullName: string;
  nickname: string;
  birthDate: string;
};

export type InviteCaregiverPayload = {
  patientId: string;
  name: string;
  email: string;
};

export type CaregiverInvite = {
  caregiver: Caregiver;
  link: string;
};

const INVITE_VALID_DAYS = 7;

const CURRENT_CAREGIVER: Caregiver = {
  id: "1",
  name: "Igor Xavier",
  email: "igor.xavier@email.com",
  phone: "(11) 98888-7777",
  status: "active",
};

let patients: PatientDetails[] = [
  {
    id: "1",
    name: "Maria Xavier",
    relationship: "Mãe",
    nickname: "Dona Maria",
    birthDate: "1950-03-12",
    caregivers: [
      CURRENT_CAREGIVER,
      {
        id: "2",
        name: "Pedro Silva",
        email: "pedro@email.com",
        status: "pending",
        inviteExpiresInDays: INVITE_VALID_DAYS,
      },
    ],
  },
  {
    id: "2",
    name: "João Xavier",
    relationship: "Pai",
    nickname: "Seu João",
    birthDate: "1948-07-25",
    caregivers: [CURRENT_CAREGIVER],
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createInviteLink = () =>
  `https://zelo.app/convite/${Math.random().toString(36).slice(2, 10)}`;

function findPatient(id: string) {
  const patient = patients.find((item) => item.id === id);

  if (!patient) throw new Error("Paciente não encontrado.");

  return patient;
}

function savePatient(updated: PatientDetails) {
  patients = patients.map((item) => (item.id === updated.id ? updated : item));
}

/**
 * Busca os pacientes acompanhados pelo cuidador.
 * TODO: trocar pela chamada da API.
 */
export async function getPatients(): Promise<Patient[]> {
  await wait(600);

  return patients.map(({ id, name, relationship }) => ({
    id,
    name,
    relationship,
  }));
}

/**
 * Busca os dados completos de um paciente, com os cuidadores vinculados.
 * TODO: trocar pela chamada da API.
 */
export async function getPatient(id: string): Promise<PatientDetails> {
  await wait(600);

  return findPatient(id);
}

/*
 * Regras de negócio dos pacientes (valem para a API real):
 *   - A relação paciente x cuidador é N para N.
 *   - Cada paciente tem um único cuidador master: quem o cadastrou. Só o
 *     master convida cuidadores e exclui o paciente.
 *   - O CPF identifica o paciente e evita cadastros duplicados. É dado
 *     sensível (LGPD): o back-end guarda só o hash.
 *   - O código de pareamento tem 6 números, vale 24 horas e só pode ser usado
 *     uma vez.
 */

/**
 * Cadastra o paciente (quem cadastra vira o cuidador master) e gera o código
 * de pareamento que o paciente digita no celular dele.
 * TODO: trocar pela chamada da API.
 */
export async function createPatient(
  payload: CreatePatientPayload,
): Promise<CreatePatientResult> {
  await wait(600);

  if (!payload.fullName.trim()) {
    throw new Error("Informe o nome do paciente.");
  }

  const patient: PatientDetails = {
    id: String(Date.now()),
    name: payload.fullName,
    nickname: payload.nickname,
    birthDate: payload.birthDate,
    caregivers: [CURRENT_CAREGIVER],
  };

  patients = [...patients, patient];

  const pairingCode = String(Math.floor(100000 + Math.random() * 900000));

  return { patient: { id: patient.id, name: patient.name }, pairingCode };
}

/**
 * Atualiza os dados pessoais do paciente.
 * TODO: trocar pela chamada da API.
 */
export async function updatePatient(
  id: string,
  payload: UpdatePatientPayload,
): Promise<PatientDetails> {
  await wait(600);

  if (!payload.fullName.trim()) {
    throw new Error("Informe o nome do paciente.");
  }

  const updated: PatientDetails = {
    ...findPatient(id),
    name: payload.fullName,
    nickname: payload.nickname,
    birthDate: payload.birthDate,
  };

  savePatient(updated);

  return updated;
}

/**
 * Remove o paciente e todos os seus dados, de forma permanente.
 * TODO: trocar pela chamada da API.
 */
export async function deletePatient(id: string): Promise<void> {
  await wait(600);

  patients = patients.filter((item) => item.id !== id);
}

/**
 * Cria o convite para um novo cuidador. Ele fica "pendente" até aceitar o link.
 * TODO: trocar pela chamada da API.
 */
export async function inviteCaregiver({
  patientId,
  name,
  email,
}: InviteCaregiverPayload): Promise<CaregiverInvite> {
  await wait(600);

  if (!name.trim() || !email.trim()) {
    throw new Error("Informe o nome e o e-mail do cuidador.");
  }

  const patient = findPatient(patientId);

  const caregiver: Caregiver = {
    id: String(Date.now()),
    name: name.trim(),
    email: email.trim(),
    status: "pending",
    inviteExpiresInDays: INVITE_VALID_DAYS,
  };

  savePatient({ ...patient, caregivers: [...patient.caregivers, caregiver] });

  return { caregiver, link: createInviteLink() };
}

/**
 * Gera um novo link para um convite pendente e renova o prazo de 7 dias.
 * TODO: trocar pela chamada da API.
 */
export async function resendCaregiverInvite(
  patientId: string,
  caregiverId: string,
): Promise<CaregiverInvite> {
  await wait(600);

  const patient = findPatient(patientId);
  const current = patient.caregivers.find((item) => item.id === caregiverId);

  if (!current) throw new Error("Convite não encontrado.");

  const caregiver: Caregiver = {
    ...current,
    inviteExpiresInDays: INVITE_VALID_DAYS,
  };

  savePatient({
    ...patient,
    caregivers: patient.caregivers.map((item) =>
      item.id === caregiverId ? caregiver : item,
    ),
  });

  return { caregiver, link: createInviteLink() };
}

/**
 * Cancela um convite pendente. O link deixa de funcionar.
 * TODO: trocar pela chamada da API.
 */
export async function cancelCaregiverInvite(
  patientId: string,
  caregiverId: string,
): Promise<void> {
  await wait(600);

  const patient = findPatient(patientId);

  savePatient({
    ...patient,
    caregivers: patient.caregivers.filter((item) => item.id !== caregiverId),
  });
}
