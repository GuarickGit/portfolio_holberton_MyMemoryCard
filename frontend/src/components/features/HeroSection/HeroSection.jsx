import HeroCTA from './HeroCTA/HeroCTA';
import HeroProfile from './HeroProfile/HeroProfile';
import BannerFF7 from '../../../assets/images/Banner_FF7.jpeg';
import './HeroSection.css';

/**
 * HeroSection - Composant réutilisable pour la section Hero
 *
 * @param {String} type - Type de hero: 'cta' | 'profile' | 'game'
 * @param {String} backgroundImage - URL de l'image de fond
 * @param {Object} user - Données utilisateur (si type='profile')
 * @param {Boolean} isOwnProfile - True si c'est notre propre profil
 * @param {Object} game - Données du jeu (si type='game', pour plus tard)
 */
const HeroSection = ({
  type = 'cta',
  backgroundImage = null,
  user = null,
  isOwnProfile = false,
  game = null
}) => {
  const getBackgroundImage = () => {
    if (backgroundImage) return backgroundImage;
    if (type === 'profile' && user?.banner_url) return user.banner_url;
    if (type === 'game' && game?.background_image) return game.background_image;
    return BannerFF7;
  };

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`
      }}
    >
      <div className="hero-section__overlay"></div>

      <div className="hero-section__content">
        {type === 'cta' && <HeroCTA />}
        {type === 'profile' && user && (
          <HeroProfile user={user} isOwnProfile={isOwnProfile} />
        )}
      </div>
    </section>
  );
};

export default HeroSection;
