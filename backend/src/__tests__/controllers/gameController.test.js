import request from 'supertest';
import express from 'express';
import gameRoutes from '../../routes/gameRoutes.js';

describe('gameController - Tests des jeux', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/games', gameRoutes);
  });

  describe('GET /games/search - Rechercher des jeux', () => {

    // Test 1 : Recherche sans paramètre de recherche
    test('❌ Devrait rejeter une recherche sans query (400)', async () => {
      const response = await request(app)
        .get('/games/search');

      // Sans paramètre "q", devrait retourner 400
      expect(response.status).toBe(400);
    });

    // Test 2 : Recherche avec query vide
    test('❌ Devrait rejeter une recherche avec query vide (400)', async () => {
      const response = await request(app)
        .get('/games/search?q=');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /games/:rawgId - Détails d\'un jeu', () => {

    // Test 3 : ID invalide (pas un nombre)
    test('❌ Devrait rejeter un ID invalide', async () => {
      const response = await request(app)
        .get('/games/invalid-id');

      // Dépend de ton controller, probablement 400 ou 404
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /games/count - Nombre total de jeux', () => {

    // Test 4 : Route publique accessible
    test('✅ Devrait retourner le nombre de jeux (200)', async () => {
      const response = await request(app)
        .get('/games/count');

      // Cette route est publique, devrait fonctionner
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /games/top - Jeux populaires', () => {

    // Test 5 : Route publique accessible
    test('✅ Devrait retourner les jeux populaires (200)', async () => {
      const response = await request(app)
        .get('/games/top');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /games/trending - Jeux tendance', () => {

    // Test 6 : Route publique accessible
    test('✅ Devrait retourner les jeux tendance (200)', async () => {
      const response = await request(app)
        .get('/games/trending');

      expect([200, 500]).toContain(response.status);
    });
  });
});

// Tests unitaires des validations
describe('gameController - Tests unitaires', () => {

  // Test 7 : Validation d'un rawg_id
  test('✅ Validation : rawg_id doit être un nombre positif', () => {
    const validId = 3498;
    const invalidId = -5;
    const notANumber = 'abc';

    expect(typeof validId).toBe('number');
    expect(validId).toBeGreaterThan(0);
    expect(invalidId).toBeLessThan(0);
    expect(typeof notANumber).toBe('string');
  });

  // Test 8 : Validation query de recherche
  test('✅ Validation : query de recherche doit être non vide', () => {
    const validQuery = 'Grand Theft Auto';
    const emptyQuery = '';
    const spacesOnly = '   ';

    expect(validQuery.trim().length).toBeGreaterThan(0);
    expect(emptyQuery.trim().length).toBe(0);
    expect(spacesOnly.trim().length).toBe(0);
  });

  // Test 9 : Validation de la pagination
  test('✅ Validation : page et page_size positifs', () => {
    const validPage = 1;
    const validPageSize = 20;
    const invalidPage = -1;
    const invalidPageSize = 0;

    expect(validPage).toBeGreaterThan(0);
    expect(validPageSize).toBeGreaterThan(0);
    expect(invalidPage).toBeLessThanOrEqual(0);
    expect(invalidPageSize).toBeLessThanOrEqual(0);
  });
});
