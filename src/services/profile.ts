export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleLabel: string;
  /**
   * Cuidador master: é quem cadastra o paciente e a única pessoa que pode
   * convidar outros cuidadores e excluir o paciente (cada paciente tem um
   * único master, definido no cadastro).
   */
  isMaster: boolean;
};

const profile: UserProfile = {
  id: "1",
  name: "Igor Xavier",
  email: "igor.xavier@email.com",
  phone: "(11) 98888-7777",
  roleLabel: "Cuidador master",
  isMaster: true,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Busca os dados do cuidador logado.
 * TODO: trocar pela chamada da API.
 */
export async function getUserProfile(): Promise<UserProfile> {
  await wait(600);
  return profile;
}

export type PatientProfile = {
  id: string;
  name: string;
  nickname: string;
  /** Idade em anos, calculada a partir da data de nascimento. */
  age: number;
  caregivers: { id: string; name: string; phone: string }[];
};

/**
 * Perfil do paciente logado no app dele: nome, idade e quem cuida dele
 * (usado no botão "Ligar para ...").
 * TODO: trocar pela chamada da API.
 */
export async function getPatientProfile(
  patientId: string,
): Promise<PatientProfile> {
  console.log("getPatientProfile", { patientId });
  await wait(600);

  return {
    id: patientId,
    name: "Maria Xavier",
    nickname: "Dona Maria",
    age: 78,
    caregivers: [{ id: "1", name: "Igor Xavier", phone: "(11) 98888-7777" }],
  };
}
