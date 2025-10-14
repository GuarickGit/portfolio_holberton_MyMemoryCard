import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';

// Créer une mini-app Express pour les tests
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Variables pour stocker des identifiants uniques
let testEmail;
let testUsername;

// Avant chaque test, générer des identifiants uniques
beforeEach(() => {
  const timestamp = Date.now();
  testEmail = `test${timestamp}@example.com`;
  testUsername = `TestUser${timestamp}`;
});

describe('Auth Routes Tests', () => {

  // ========================================
  // TESTS SIGNUP
  // ========================================

  describe('POST /auth/signup', () => {

    test('Devrait créer un utilisateur avec des données valides', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          username: testUsername,
          email: testEmail,
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(testUsername);
      expect(response.body.user.email).toBe(testEmail);
    });

    test('Devrait rejeter un email invalide', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          username: testUsername,
          email: 'emailinvalide',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Format d'email invalide.");
    });

    test('Devrait rejeter un username trop court', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          username: 'ab',
          email: testEmail,
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pseudo doit contenir entre 3 et 30 caractères');
    });

    test('Devrait rejeter un mot de passe trop court', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          username: testUsername,
          email: testEmail,
          password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Le mot de passe doit contenir au moins 6 caractères.');
    });

    test('Devrait rejeter un email déjà utilisé', async () => {
      // Créer un premier utilisateur
      await request(app)
        .post('/auth/signup')
        .send({
          username: testUsername,
          email: testEmail,
          password: 'password123'
        });

      // Essayer de créer un deuxième utilisateur avec le même email
      const response = await request(app)
        .post('/auth/signup')
        .send({
          username: `${testUsername}2`,
          email: testEmail,
          password: 'password456'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('email');
    });

  });

  // ========================================
  // TESTS LOGIN
  // ========================================

  describe('POST /auth/login', () => {

    test('Devrait connecter un utilisateur avec les bons identifiants', async () => {
      // D'abord créer un utilisateur
      await request(app)
        .post('/auth/signup')
        .send({
          username: testUsername,
          email: testEmail,
          password: 'password123'
        });

      // Puis se connecter
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Connexion réussie');
    });

    test('Devrait rejeter un email inexistant', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'inexistant@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou mot de passe incorrect');
    });

    test('Devrait rejeter un mauvais mot de passe', async () => {
      // Créer un utilisateur
      await request(app)
        .post('/auth/signup')
        .send({
          username: testUsername,
          email: testEmail,
          password: 'password123'
        });

      // Essayer de se connecter avec un mauvais mot de passe
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'mauvaismdp'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou mot de passe incorrect');
    });

  });

});
