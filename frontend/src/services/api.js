// Backend
const API_URL = 'http://localhost:5000';

// Fonction pour se connecter
export async function login(email, password) {
  try {
    // Appel POST au backend
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Si erreur (401, 404, 500, etc.)
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur de connexion');
    }

    // Si succès, on récupère les données
    const data = await response.json();
    return data; // { token, user }

  } catch (error) {
    throw error;
  }
}

// Fonction pour s'inscrire
export async function signup(username, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur d\'inscription');
    }

    const data = await response.json();
    return data; // { token, user }

  } catch (error) {
    throw error;
  }
}
