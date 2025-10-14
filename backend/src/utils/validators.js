/**
 * Valide le format d'un email
 * @param {string} email - Email à valider
 * @returns {boolean} true si valide
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide la force d'un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {boolean} true si valide (min 6 caractères)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Valide le format d'un username
 * @param {string} username - Username à valider
 * @returns {boolean} true si valide (3-30 caractères, alphanumerique + underscore)
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};
