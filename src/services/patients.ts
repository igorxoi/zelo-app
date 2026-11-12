import { request } from "@/services/api";

export type CaregiverStatus = "active" | "pending";

export type Caregiver = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CaregiverStatus;
  isMaster?: boolean;
  inviteExpiresInDays?: number;
};

export type Patient = {
  id: string;
  name: string;
  relationship?: string;
  isMaster?: boolean;
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

export type InvitePreview = {
  caregiverName: string;
  email: string;
  invitedBy: string;
  patientName: string;
};

export function getPatients(): Promise<Patient[]> {
  return request<Patient[]>("GET", "/patients");
}

export function getPatient(id: string): Promise<PatientDetails> {
  return request<PatientDetails>("GET", `/patients/${id}`);
}

export async function createPatient(
  payload: CreatePatientPayload,
): Promise<CreatePatientResult> {
  if (!payload.fullName.trim()) {
    throw new Error("Informe o nome do paciente.");
  }

  const result = await request<CreatePatientResult>("POST", "/patients", {
    body: payload,
  });
  return { patient: result.patient, pairingCode: result.pairingCode };
}

export async function createPairingCode(
  patientId: string,
): Promise<{ pairingCode: string; expiresAt: string }> {
  const result = await request<{
    pairingCode: string;
    pairingCodeExpiresAt: string;
  }>("POST", `/patients/${patientId}/pairing-codes`);

  return {
    pairingCode: result.pairingCode,
    expiresAt: result.pairingCodeExpiresAt,
  };
}

export function updatePatient(
  id: string,
  payload: UpdatePatientPayload,
): Promise<PatientDetails> {
  return request<PatientDetails>("PATCH", `/patients/${id}`, {
    body: payload,
  });
}

export function deletePatient(id: string): Promise<void> {
  return request("DELETE", `/patients/${id}`);
}

export async function inviteCaregiver({
  patientId,
  name,
  email,
}: InviteCaregiverPayload): Promise<CaregiverInvite> {
  if (!name.trim() || !email.trim()) {
    throw new Error("Informe o nome e o e-mail do cuidador.");
  }

  return request<CaregiverInvite>("POST", `/patients/${patientId}/invites`, {
    body: { name: name.trim(), email: email.trim() },
  });
}

export function resendCaregiverInvite(
  patientId: string,
  caregiverId: string,
): Promise<CaregiverInvite> {
  return request<CaregiverInvite>(
    "POST",
    `/patients/${patientId}/invites/${caregiverId}/resend`,
  );
}

export function cancelCaregiverInvite(
  patientId: string,
  caregiverId: string,
): Promise<void> {
  return request("DELETE", `/patients/${patientId}/invites/${caregiverId}`);
}

export function getInvite(token: string): Promise<InvitePreview> {
  return request<InvitePreview>(
    "GET",
    `/invites/${encodeURIComponent(token)}`,
    {
      auth: false,
    },
  );
}

export function acceptInvite(token: string): Promise<Patient> {
  return request<Patient>(
    "POST",
    `/invites/${encodeURIComponent(token)}/accept`,
  );
}
