import './Button.css';

// children = le texte du bouton
// onClick = fonction à exécuter quand on clique
// disabled = désactive le bouton (optionnel)
// variant = style du bouton : 'primary' (vert) ou 'secondary' (optionnel)
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
