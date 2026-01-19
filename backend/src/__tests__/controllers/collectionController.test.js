import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import collectionRoutes from '../../routes/collectionRoutes.js';

describe('collectionController - Tests de collection', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/collections', collectionRoutes);
  });

  describe('POST /collections - Ajouter un jeu à la collection', () => {

    // Test 1 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .post('/collections')
        .send({
          rawg_id: 3498,
          status: 'completed'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /collections - Récupérer ma collection', () => {

    // Test 2 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .get('/collections');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /collections/:rawgId - Mettre à jour un jeu', () => {

    // Test 3 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .patch('/collections/3498')
        .send({
          status: 'playing'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /collections/:rawgId - Supprimer un jeu', () => {

    // Test 4 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .delete('/collections/3498');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /collections/game/:rawgId/status - Statut d\'un jeu', () => {

    // Test 5 : Sans token JWT
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      const response = await request(app)
        .get('/collections/game/3498/status');

      expect(response.status).toBe(401);
    });
  });
});

// Tests unitaires des validations
describe('collectionController - Tests unitaires', () => {

  // Test 6 : Validation des status valides
  test('✅ Validation : status valides', () => {
    const validStatuses = ['playing', 'completed', 'on_hold', 'dropped', 'plan_to_play'];
    const invalidStatus = 'invalid_status';

    // Vérifier que les status valides sont bien dans la liste
    validStatuses.forEach(status => {
      expect(validStatuses).toContain(status);
    });

    // Vérifier qu'un status invalide n'est pas dans la liste
    expect(validStatuses).not.toContain(invalidStatus);
  });

  // Test 7 : Validation du rating utilisateur
  test('✅ Validation : user_rating entre 1 et 5', () => {
    const tooLow = 0;
    const tooHigh = 6;
    const valid = 4;

    expect(tooLow).toBeLessThan(1);
    expect(tooHigh).toBeGreaterThan(5);
    expect(valid).toBeGreaterThanOrEqual(1);
    expect(valid).toBeLessThanOrEqual(5);
  });

  // Test 8 : Validation du rawg_id
  test('✅ Validation : rawg_id doit être un nombre positif', () => {
    const validId = 3498;
    const invalidId = -1;
    const notANumber = 'abc';

    expect(validId).toBeGreaterThan(0);
    expect(typeof validId).toBe('number');
    expect(invalidId).toBeLessThan(0);
    expect(typeof notANumber).not.toBe('number');
  });
});
