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

/**
 * Login do cuidador (e-mail + senha).
 * TODO: trocar pela chamada real.
 */
export async function signInCaregiver({
  email,
  password,
}: CaregiverCredentials): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 600)); // simula a requisição

  if (!email.trim() || !password) {
    throw new Error("Informe e-mail e senha.");
  }

  return { id: "1", name: "Pedro Silva", profile: "caregiver" };
}

export type RegisterCaregiverPayload = {
  name: string;
  email: string;
  /** Telefone com WhatsApp. */
  phone: string;
  /** Somente números. Dado sensível (LGPD): o back-end guarda só o hash. */
  cpf: string;
  password: string;
};

/**
 * Cadastro do cuidador. Já devolve o usuário logado.
 * TODO: trocar pela chamada real da API. Em caso de falha, lance um erro (throw).
 */
export async function registerCaregiver({
  name,
  email,
  password,
}: RegisterCaregiverPayload): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 600)); // simula a requisição

  if (!name.trim() || !email.trim() || !password) {
    throw new Error("Preencha todos os dados para criar a conta.");
  }

  return { id: "1", name: name.trim(), profile: "caregiver" };
}

/**
 * Login do paciente: ele não tem e-mail nem senha, só entra com o código de
 * pareamento de 6 números gerado pelo cuidador no cadastro do paciente
 * (uso único, vale 24 horas).
 * TODO: trocar pela chamada real da API.
 */
export async function signInPatient(code: string): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 600)); // simula a requisição

  if (code.length !== 6) {
    throw new Error("O código deve ter 6 números.");
  }

  return { id: "2", name: "Maria Xavier", profile: "patient" };
}
