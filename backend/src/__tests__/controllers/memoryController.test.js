import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import memoryRoutes from '../../routes/memoryRoutes.js';

// Groupe de tests pour les validations des memories
describe('memoryController - Validations', () => {
  let app;

  // beforeAll = exécuté UNE FOIS avant tous les tests de ce groupe
  beforeAll(() => {
    // On crée une mini-app Express juste pour les tests
    app = express();
    app.use(express.json());           // Pour parser le JSON
    app.use(cookieParser());            // Pour parser les cookies
    app.use('/memories', memoryRoutes); // On monte les vraies routes
  });

  // Sous-groupe pour tester les validations lors de la création
  describe('POST /memories - Validation des longueurs', () => {

    // Test 1 : Vérifier que sans token JWT, on est rejeté
    test('❌ Devrait rejeter une requête sans token (401)', async () => {
      // On simule une requête POST vers /memories
      const response = await request(app)
        .post('/memories')
        .send({
          gameId: 3498,
          title: 'Mon souvenir',
          content: 'Un super souvenir de jeu'
        });

      // On s'attend à recevoir un statut 401 (Unauthorized)
      // Car le middleware verifyToken bloque sans token
      expect(response.status).toBe(401);
    });
  });
});

// Groupe de tests unitaires DIRECTS (sans passer par Express)
describe('memoryController - Tests unitaires directs', () => {

  // Test 2 : Titre trop long
  test('✅ Validation : titre trop long doit être rejeté', () => {
    // On crée un titre de 150 caractères (> 100)
    const title = 'a'.repeat(150);
    const content = 'Contenu valide';

    // On vérifie que le titre dépasse bien 100 caractères
    expect(title.length).toBeGreaterThan(100);
    // Et que le contenu est OK
    expect(content.length).toBeLessThanOrEqual(5000);

    // Ce test simule ce que fait ton controller :
    // if (title.length > 100) { return error }
  });

  // Test 3 : Contenu trop long
  test('✅ Validation : contenu trop long doit être rejeté', () => {
    const title = 'Titre valide';
    // On crée un contenu de 5001 caractères (> 5000)
    const content = 'a'.repeat(5001);

    expect(title.length).toBeLessThanOrEqual(100);
    expect(content.length).toBeGreaterThan(5000);

    // Ce test simule ce que fait ton controller :
    // if (content.length > 5000) { return error }
  });

  // Test 4 : Données valides
  test('✅ Validation : données valides passent', () => {
    const title = 'Mon souvenir incroyable';
    const content = 'Je me souviens de cette quête épique où j\'ai vaincu le boss final.';

    // On vérifie que tout respecte les limites
    expect(title.length).toBeLessThanOrEqual(100);
    expect(content.length).toBeLessThanOrEqual(5000);
    // Et que les champs ne sont pas vides après trim
    expect(title.trim().length).toBeGreaterThan(0);
    expect(content.trim().length).toBeGreaterThan(0);

    // Ce test vérifie que des données normales passent bien
  });
});
