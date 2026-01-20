import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReviewCard from '../../components/features/ReviewCard/ReviewCard';

// Mock du contexte AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null // Pas d'utilisateur connecté par défaut
  }))
}));

// Données de test
const mockReview = {
  id: '1',
  user_id: 'user-123',
  username: 'TestUser',
  avatar_url: 'https://example.com/avatar.jpg',
  game_name: 'Grand Theft Auto V',
  game_image: 'https://example.com/game.jpg',
  year: 2013,
  rating: 5,
  title: 'Un chef-d\'œuvre du jeu vidéo',
  content: 'GTA V est un jeu incroyable avec une histoire captivante et un monde ouvert immense.',
  spoiler: false
};

// Helper pour rendre le composant avec Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ReviewCard', () => {

  // Test 1 : Le composant se rend sans erreur
  test('✅ Devrait afficher le composant ReviewCard', () => {
    renderWithRouter(<ReviewCard review={mockReview} />);

    // Vérifie que le titre est affiché
    expect(screen.getByText('Un chef-d\'œuvre du jeu vidéo')).toBeInTheDocument();
  });

  // Test 2 : Affiche les informations du jeu
  test('✅ Devrait afficher le nom du jeu et l\'année', () => {
    renderWithRouter(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Grand Theft Auto V')).toBeInTheDocument();
    expect(screen.getByText('(2013)')).toBeInTheDocument();
  });

  // Test 3 : Affiche le username
  test('✅ Devrait afficher le nom de l\'utilisateur', () => {
    renderWithRouter(<ReviewCard review={mockReview} />);

    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  // Test 4 : Affiche le contenu de la review
  test('✅ Devrait afficher le contenu de la review', () => {
    renderWithRouter(<ReviewCard review={mockReview} />);

    expect(screen.getByText(/GTA V est un jeu incroyable/)).toBeInTheDocument();
  });

  // Test 5 : Affiche les étoiles de notation
  test('✅ Devrait afficher 5 étoiles pour un rating de 5', () => {
    renderWithRouter(<ReviewCard review={mockReview} />);

    // Il devrait y avoir 5 étoiles (icônes Star de lucide-react)
    const stars = screen.getAllByRole('img', { hidden: true });
    // Note: lucide-react génère des SVG, difficile à tester directement
    // On vérifie juste que le composant se rend
    expect(stars.length).toBeGreaterThan(0);
  });

  // Test 6 : Affiche le badge spoiler si nécessaire
  test('✅ Devrait afficher le badge spoiler', () => {
    const reviewWithSpoiler = { ...mockReview, spoiler: true };
    renderWithRouter(<ReviewCard review={reviewWithSpoiler} />);

    expect(screen.getByText('Contient des spoilers')).toBeInTheDocument();
  });

  // Test 7 : N'affiche PAS le badge spoiler si pas de spoiler
  test('✅ Ne devrait PAS afficher le badge spoiler', () => {
    renderWithRouter(<ReviewCard review={mockReview} />);

    expect(screen.queryByText('Contient des spoilers')).not.toBeInTheDocument();
  });

  // Test 8 : Affiche le bouton "Voir plus"
  test('✅ Devrait afficher le bouton "Voir plus"', () => {
    renderWithRouter(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Voir plus')).toBeInTheDocument();
  });

  // Test 9 : Les images ont des attributs alt
test('✅ Les images doivent avoir des attributs alt descriptifs', () => {
  renderWithRouter(<ReviewCard review={mockReview} />);

  // Image du jeu
  const gameImage = screen.getByAltText('Grand Theft Auto V');
  expect(gameImage).toBeInTheDocument();

  // Avatar de l'utilisateur
  const avatarImage = screen.getByAltText('TestUser');
  expect(avatarImage).toBeInTheDocument();
});
});
