export function isValidPassword(password: string) {
  return (
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
  );
}

export function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  if (!isValidPassword(password)) return 1;

  return password.length >= 12 ? 3 : 2;
}
