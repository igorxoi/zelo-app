import { request, setAuthToken } from "@/services/api";

export type Profile = "caregiver" | "patient";

export type AuthUser = {
  id: string;
  name: string;
  profile: Profile;
};

export type CaregiverCredentials = {
  email: string;
  password: string;
};

export type RegisterCaregiverPayload = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
};

async function startSession(path: string, body: unknown): Promise<AuthUser> {
  const session = await request<{ token: string; user: AuthUser }>(
    "POST",
    path,
    { body, auth: false },
  );
  setAuthToken(session.token);
  return session.user;
}

export async function signInCaregiver({
  email,
  password,
}: CaregiverCredentials): Promise<AuthUser> {
  if (!email.trim() || !password) {
    throw new Error("Informe e-mail e senha.");
  }

  return startSession("/auth/caregiver/sign-in", {
    email: email.trim(),
    password,
  });
}

export async function registerCaregiver(
  payload: RegisterCaregiverPayload,
): Promise<AuthUser> {
  if (!payload.name.trim() || !payload.email.trim() || !payload.password) {
    throw new Error("Preencha todos os dados para criar a conta.");
  }

  return startSession("/auth/caregiver/register", {
    ...payload,
    name: payload.name.trim(),
    email: payload.email.trim(),
  });
}

export async function signInPatient(code: string): Promise<AuthUser> {
  if (code.length !== 6) {
    throw new Error("O código deve ter 6 números.");
  }

  return startSession("/auth/patient/sign-in", { code });
}
