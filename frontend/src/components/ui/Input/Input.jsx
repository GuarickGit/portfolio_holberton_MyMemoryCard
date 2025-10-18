import './Input.css';

// Composant Input
// type = type d'input (text, email, password, etc.)
// placeholder = texte qui s'affiche quand l'input est vide
// value = valeur de l'input
// onChange = fonction appelée quand on tape dans l'input
function Input({ type, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input"
    />
  );
}

export default Input;
