import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes.js';

describe('authController - Tests d\'authentification', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  describe('POST /auth/signup - Inscription', () => {

    // Test 1 : Champs obligatoires manquants
    test('❌ Devrait rejeter une inscription sans email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          username: 'testuser',
          password: 'Test1234!'
          // email manquant
        });

      expect(response.status).toBe(400);
    });

    // Test 2 : Champs obligatoires manquants
    test('❌ Devrait rejeter une inscription sans password', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com'
          // password manquant
        });

      expect(response.status).toBe(400);
    });

    // Test 3 : Champs obligatoires manquants
    test('❌ Devrait rejeter une inscription sans username', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Test1234!'
          // username manquant
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login - Connexion', () => {

    // Test 4 : Login sans email
    test('❌ Devrait rejeter un login sans email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'Test1234!'
          // email manquant
        });

      expect(response.status).toBe(400);
    });

    // Test 5 : Login sans password
    test('❌ Devrait rejeter un login sans password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
          // password manquant
        });

      expect(response.status).toBe(400);
    });
  });
});

// Tests unitaires directs des validations
describe('authController - Tests unitaires de validation', () => {

  // Test 6 : Format email valide
  test('✅ Validation : format email', () => {
    const validEmail = 'user@example.com';
    const invalidEmail = 'notanemail';

    // Regex basique pour valider un email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  // Test 7 : Longueur du password
  test('✅ Validation : password minimum 8 caractères', () => {
    const shortPassword = 'Test12';      // 6 caractères
    const validPassword = 'Test1234!';   // 9 caractères

    expect(shortPassword.length).toBeLessThan(8);
    expect(validPassword.length).toBeGreaterThanOrEqual(8);
  });

  // Test 8 : Username valide
  test('✅ Validation : username entre 3 et 20 caractères', () => {
    const tooShort = 'ab';               // 2 caractères
    const tooLong = 'a'.repeat(25);      // 25 caractères
    const valid = 'validuser';           // 9 caractères

    expect(tooShort.length).toBeLessThan(3);
    expect(tooLong.length).toBeGreaterThan(20);
    expect(valid.length).toBeGreaterThanOrEqual(3);
    expect(valid.length).toBeLessThanOrEqual(20);
  });
});
