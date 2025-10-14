import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import memoryRoutes from '../routes/memoryRoutes.js';
import userRoutes from '../routes/userRoutes.js';

// Créer une mini-app Express pour les tests
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/memories', memoryRoutes);
app.use('/users', userRoutes);

let testUser;
let testToken;
let testEmail;
let testUsername;

// Avant tous les tests, créer un utilisateur de test
beforeAll(async () => {
  const timestamp = Date.now();
  testEmail = `memorytest${timestamp}@example.com`;
  testUsername = `MemoryTester${timestamp}`;

  const response = await request(app)
    .post('/auth/signup')
    .send({
      username: testUsername,
      email: testEmail,
      password: 'password123'
    });

  testUser = response.body.user;
  testToken = response.body.token;
});

describe('Memory Routes Tests', () => {

  // ========================================
  // TESTS CRÉATION SOUVENIR
  // ========================================

  describe('POST /memories', () => {

    test('Devrait créer un souvenir avec un token valide', async () => {
      const response = await request(app)
        .post('/memories')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          gameId: 3498,
          content: 'Test souvenir - GTA V est incroyable !'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory.content).toBe('Test souvenir - GTA V est incroyable !');
      expect(response.body.memory.user_id).toBe(testUser.id);
    });

    test('Devrait rejeter une requête sans token', async () => {
      const response = await request(app)
        .post('/memories')
        .send({
          gameId: 3498,
          content: 'Souvenir sans authentification'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Token');
    });

    test('Devrait rejeter un souvenir sans contenu', async () => {
      const response = await request(app)
        .post('/memories')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          gameId: 3498,
          content: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('requis');
    });

    test('Devrait rejeter un souvenir sans gameId', async () => {
      const response = await request(app)
        .post('/memories')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          content: 'Souvenir sans jeu'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('requis');
    });

  });

  // ========================================
  // TEST GAIN XP
  // ========================================

  describe('XP System', () => {

    test('Devrait gagner 10 XP en créant un souvenir', async () => {
      // Récupérer XP initial
      const profileBefore = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testToken}`);

      const xpBefore = profileBefore.body.user.exp;

      // Créer un souvenir
      await request(app)
        .post('/memories')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          gameId: 3498,
          content: 'Test XP - nouveau souvenir'
        });

      // Récupérer XP après
      const profileAfter = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testToken}`);

      const xpAfter = profileAfter.body.user.exp;

      // Vérifier que l'XP a augmenté de 10
      expect(xpAfter).toBe(xpBefore + 10);
    });

  });

});
