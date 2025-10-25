import './GameHero.css';

/**
 * GameHero - Bannière avec background + cover + infos principales
 *
 * @param {Object} game - Données du jeu
 */
const GameHero = ({ game }) => {
  // Extraire genres et plateformes
  const genres = game.genres
    ? (typeof game.genres === 'string' ? JSON.parse(game.genres) : game.genres)
    : [];

  const platforms = game.platforms
    ? (typeof game.platforms === 'string' ? JSON.parse(game.platforms) : game.platforms)
    : [];

  // Année de sortie
  const releaseYear = game.released ? new Date(game.released).getFullYear() : 'N/A';

  return (
    <div className="game-hero">
      {/* Background */}
      <div
        className="game-hero__background"
        style={{ backgroundImage: `url(${game.background_image})` }}
      >
        <div className="game-hero__overlay"></div>
      </div>

      {/* Contenu */}
      <div className="game-hero__content">
        {/* Cover à gauche */}
        <div className="game-hero__cover">
          <img
            src={game.cover_url || game.background_image}
            alt={`${game.name} cover`}
          />
        </div>

        {/* Infos à droite */}
        <div className="game-hero__info">
          <h1 className="game-hero__title">{game.name}</h1>

          <div className="game-hero__meta">
            <span className="game-hero__year">{releaseYear}</span>
            {game.rating && (
              <>
                <span className="game-hero__separator">•</span>
                <span className="game-hero__rating">
                  ⭐ {game.rating}
                </span>
              </>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="game-hero__section">
              <span className="game-hero__label">Genres :</span>
              <span className="game-hero__values">
                {genres.slice(0, 5).map((genre, index) => (
                  <span key={index}>
                    {genre.name || genre}
                    {index < Math.min(genres.length, 5) - 1 && ', '}
                  </span>
                ))}
              </span>
            </div>
          )}

          {/* Plateformes */}
          {platforms.length > 0 && (
            <div className="game-hero__section">
              <span className="game-hero__label">Plateformes :</span>
              <span className="game-hero__values">
                {platforms.slice(0, 6).map((platform, index) => (
                  <span key={index}>
                    {platform.platform?.name || platform}
                    {index < Math.min(platforms.length, 6) - 1 && ', '}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHero;
