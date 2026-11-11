/** Mínimo de 8 caracteres, com letra e número. */
export function isValidPassword(password: string) {
  return (
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
  );
}

/**
 * Força da senha para a barra de progresso:
 * 0 = vazia, 1 = fraca (não atende o mínimo), 2 = boa, 3 = forte (12+ caracteres).
 */
export function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  if (!isValidPassword(password)) return 1;

  return password.length >= 12 ? 3 : 2;
}
