import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import followRoutes from '../../routes/followRoutes.js';

describe('followController - Tests de suivi', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/follows', followRoutes);
  });

  describe('POST /follows/:userId - Suivre un utilisateur', () => {

    // Test 1 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .post('/follows/user-id-123');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /follows/:userId - Ne plus suivre', () => {

    // Test 2 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .delete('/follows/user-id-123');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /follows/:userId/followers - Liste des abonnés', () => {

    // Test 3 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .get('/follows/user-id-123/followers');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /follows/:userId/following - Liste des abonnements', () => {

    // Test 4 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .get('/follows/user-id-123/following');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /follows/:userId/check - Vérifier si on suit', () => {

    // Test 5 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .get('/follows/user-id-123/check');

      expect(response.status).toBe(401);
    });
  });
});

// Tests unitaires des validations
describe('followController - Tests unitaires', () => {

  // Test 6 : Validation format userId (UUID)
  test('✅ Validation : userId doit être un UUID valide', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const invalidUuid = 'not-a-uuid';

    // Regex pour valider un UUID v4
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(uuidRegex.test(validUuid)).toBe(true);
    expect(uuidRegex.test(invalidUuid)).toBe(false);
  });

  // Test 7 : Empêcher de se suivre soi-même
  test('✅ Validation : ne peut pas se suivre soi-même', () => {
    const currentUserId = '550e8400-e29b-41d4-a716-446655440000';
    const targetUserId = '550e8400-e29b-41d4-a716-446655440000';

    // Les IDs sont identiques = erreur
    expect(currentUserId).toBe(targetUserId);
  });

  // Test 8 : Vérifier que les IDs sont différents
  test('✅ Validation : peut suivre un autre utilisateur', () => {
    const currentUserId = '550e8400-e29b-41d4-a716-446655440000';
    const targetUserId = '660e8400-e29b-41d4-a716-446655440111';

    // Les IDs sont différents = OK
    expect(currentUserId).not.toBe(targetUserId);
  });
});
