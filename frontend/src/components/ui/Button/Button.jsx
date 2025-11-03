import './Button.css';

/**
 * Button - Composant bouton réutilisable
 *
 * @param {ReactNode} children - Le texte/contenu du bouton
 * @param {function} onClick - Fonction à exécuter au clic
 * @param {boolean} disabled - Désactive le bouton (défaut: false)
 * @param {string} variant - Style du bouton : 'primary' (vert) | 'secondary' (gris) | 'danger' (rouge)
 */
function Button({ children, onClick, disabled = false, variant = 'primary' }) {
  return (
    <button
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
