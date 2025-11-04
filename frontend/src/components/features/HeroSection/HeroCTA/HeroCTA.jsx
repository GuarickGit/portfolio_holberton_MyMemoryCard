import { useAuthModal } from '../../../../contexts/AuthModalContext';
import Button from '../../../ui/Button/Button';
import './HeroCTA.css';

/**
 * HeroCTA - Version Hero pour utilisateurs non-connectés
 * Affiche un Call-To-Action pour inciter à s'inscrire
 */
const HeroCTA = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <div className="hero-cta">
      <h1 className="hero-cta__title">
        Sauvegardez vos souvenirs de jeux vidéo
      </h1>
      <p className="hero-cta__subtitle">
        Créez votre collection, partagez vos expériences et revivez vos meilleurs moments gaming
      </p>
      <Button
        variant="primary"
        size="large"
        onClick={() => openAuthModal('signup')}
      >
        Commencer gratuitement
      </Button>
    </div>
  );
};

export default HeroCTA;
