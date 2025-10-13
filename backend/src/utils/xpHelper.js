/**
 * Calcule le niveau en fonction de l'XP
 * @param {number} exp - Points d'expérience
 * @returns {number} Le niveau calculé
 */
export const calculateLevel = (exp) => {
  if (exp < 0) return 1;

  // Formule exponentielle avec racine carrée
  // Niveau 1 : 0-49 XP
  // Niveau 2 : 50-199 XP
  // Niveau 3 : 200-449 XP
  // Niveau 4 : 450-799 XP
  // Niveau 5 : 800-1249 XP
  return Math.floor(Math.sqrt(exp / 50)) + 1;
};


/**
 * Calcule l'XP nécessaire pour le prochain niveau
 * @param {number} currentLevel - Niveau actuel
 * @returns {number} XP nécessaire pour le prochain niveau
 */
export const getXpForNextLevel = (currentLevel) => {
  return Math.pow(currentLevel, 2) * 50;
};


/**
 * Calcule la progression vers le prochain niveau (en %)
 * @param {number} exp - XP actuel
 * @param {number} level - Niveau actuel
 * @returns {number} Pourcentage de progression (0-100)
 */
export const getProgressToNextLevel = (exp, level) => {
  const currentLevelXp = Math.pow(level - 1, 2) * 50;
  const nextLevelXp = getXpForNextLevel(level);
  const xpInCurrentLevel = exp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;

  return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100));
};


/**
 * Constantes des gains d'XP
 */
export const XP_REWARDS = {
  CREATE_MEMORY: 10,
  CREATE_REVIEW: 20,
};
