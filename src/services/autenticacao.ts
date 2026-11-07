export type Perfil = "cuidador" | "paciente";

export type UsuarioAutenticado = {
  id: string;
  nome: string;
  perfil: Perfil;
};

export type CredenciaisCuidador = {
  email: string;
  senha: string;
};

/**
 * Login do cuidador (e-mail + senha).
 * TODO: trocar pela chamada real.
 */
export async function loginCuidador({
  email,
  senha,
}: CredenciaisCuidador): Promise<UsuarioAutenticado> {
  await new Promise((resolver) => setTimeout(resolver, 600)); // simula a requisição

  if (!email.trim() || !senha) {
    throw new Error("Informe e-mail e senha.");
  }

  return { id: "1", nome: "Pedro Silva", perfil: "cuidador" };
}

/**
 * Login do paciente.
 * TODO: trocar pela chamada real da API.
 */
export async function loginPaciente(
  codigo: string,
): Promise<UsuarioAutenticado> {
  await new Promise((resolver) => setTimeout(resolver, 600)); // simula a requisição

  if (codigo.length !== 6) {
    throw new Error("O código deve ter 6 números.");
  }

  return { id: "2", nome: "Maria Xavier", perfil: "paciente" };
}
