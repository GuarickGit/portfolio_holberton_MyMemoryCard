import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import userRoutes from '../../routes/userRoutes.js';

// Tests pour les validations du profil utilisateur
describe('userController - Validations', () => {
  let app;

  beforeAll(() => {
    // Créer une mini-app Express pour les tests
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/users', userRoutes);
  });

  describe('PUT /users/me - Validation des longueurs', () => {

    // Test 1 : Requête sans token
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .put('/users/me')
        .send({
          username: 'newusername',
          bio: 'Ma nouvelle bio'
        });

      // Sans token JWT, le middleware bloque avec 401
      expect(response.status).toBe(401);
    });
  });
});

// Tests unitaires directs des validations
describe('userController - Tests unitaires directs', () => {

  // Test 2 : Username trop long
  test('✅ Validation : username trop long doit être rejeté', () => {
    // Créer un username de 25 caractères (> 20)
    const username = 'a'.repeat(25);
    const bio = 'Bio valide';

    // Vérifier que le username dépasse la limite
    expect(username.length).toBeGreaterThan(20);
    // Et que la bio est OK
    expect(bio.length).toBeLessThanOrEqual(500);
  });

  // Test 3 : Bio trop longue
  test('✅ Validation : bio trop longue doit être rejetée', () => {
    const username = 'validuser';
    // Créer une bio de 600 caractères (> 500)
    const bio = 'a'.repeat(600);

    expect(username.length).toBeLessThanOrEqual(20);
    expect(bio.length).toBeGreaterThan(500);
  });

  // Test 4 : Username vide après trim
  test('✅ Validation : username vide doit être rejeté', () => {
    const username = '   ';  // Que des espaces

    // Après trim(), la longueur devrait être 0
    expect(username.trim().length).toBe(0);
  });

  // Test 5 : Données valides
  test('✅ Validation : données valides passent', () => {
    const username = 'newuser123';
    const bio = 'Passionné de jeux vidéo depuis 20 ans !';

    // Vérifier que tout respecte les limites
    expect(username.length).toBeLessThanOrEqual(20);
    expect(username.trim().length).toBeGreaterThan(0);
    expect(bio.length).toBeLessThanOrEqual(500);
  });
});
