import { useState } from 'react';
import './ImagePreview.css';

// Composant ImagePreview avec fallback
// src = URL de l'image
// alt = texte alternatif
// type = "avatar" ou "banner" (définit le style)
// fallbackIcon = émoji/texte affiché si pas d'image (défaut: 🖼️)
function ImagePreview({
  src,
  alt = "Preview",
  type = "banner",
  fallbackIcon = "🖼️"
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Réinitialise l'erreur quand l'URL change
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Si pas de src ou erreur, affiche le fallback
  const showFallback = !src || imageError;

  return (
    <div className={`image-preview image-preview-${type}`}>
      {showFallback ? (
        <div className="image-preview-fallback">
          <span className="image-preview-icon">{fallbackIcon}</span>
          <p className="image-preview-text">
            {type === 'avatar' ? 'Aucun avatar' : 'Aucune bannière'}
          </p>
        </div>
      ) : (
        <>
          {imageLoading && (
            <div className="image-preview-loading">Chargement...</div>
          )}
          <img
            src={src}
            alt={alt}
            className="image-preview-img"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        </>
      )}
    </div>
  );
}

export default ImagePreview;
