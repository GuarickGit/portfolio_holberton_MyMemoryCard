import { useEffect, useState } from 'react';
import './CircularStat.css';

/**
 * CircularStat - Composant réutilisable pour afficher une stat circulaire animée
 *
 * @param {String} label - Label de la stat (ex: "en cours", "terminés")
 * @param {Number} value - Valeur numérique à afficher
 * @param {String} color - Couleur du cercle (green, blue, orange, red, pink, cyan, yellow, purple)
 * @param {Number} percentage - Pourcentage de remplissage (0-100) optionnel
 */
const CircularStat = ({ label, value, color = 'green', percentage = null }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animation du compteur
  useEffect(() => {
    const duration = 1000; // 1 seconde
    const steps = 60;
    const increment = value / steps;
    const percentIncrement = percentage ? percentage / steps : 0;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedValue(value);
        setAnimatedPercentage(percentage || 0);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(increment * currentStep));
        setAnimatedPercentage(Math.floor(percentIncrement * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, percentage]);

  // Calcul du strokeDashoffset pour l'animation du cercle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = percentage !== null
    ? circumference - (animatedPercentage / 100) * circumference
    : circumference;  // Cercle vide si pas de percentage

  return (
    <div className={`circular-stat circular-stat--${color}`}>
      <svg className="circular-stat__svg" viewBox="0 0 100 100">
        {/* Cercle de fond */}
        <circle
          className="circular-stat__circle-bg"
          cx="50"
          cy="50"
          r={radius}
        />
        {/* Cercle de progression */}
        <circle
          className="circular-stat__circle-progress"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div className="circular-stat__content">
        <span className="circular-stat__value">{animatedValue}</span>
        <span className="circular-stat__label">{label}</span>
      </div>
    </div>
  );
};

export default CircularStat;
