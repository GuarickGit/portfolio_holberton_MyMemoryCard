import { useState } from 'react';
import './Textarea.css';

// placeholder = texte d'indication
// value = valeur contrôlée
// onChange = fonction appelée au changement
// maxLength = nombre maximum de caractères (optionnel)
// showCounter = affiche le compteur de caractères (optionnel)
// rows = nombre de lignes visibles (défaut: 4)
function Textarea({
  placeholder,
  value,
  onChange,
  maxLength,
  showCounter = false,
  rows = 4,
  ...props
}) {
  return (
    <div className="textarea-wrapper">
      <textarea
        className="textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        {...props}
      />

      {/* Compteur de caractères si activé */}
      {showCounter && maxLength && (
        <div className="textarea-counter">
          {value.length}/{maxLength} caractères
        </div>
      )}
    </div>
  );
}

export default Textarea;
