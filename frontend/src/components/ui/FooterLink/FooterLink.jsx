import { Link } from 'react-router-dom';
import './FooterLink.css';

// to = destination du lien
// children = texte du lien
// external = si c'est un lien externe (optionnel)
function FooterLink({ to, children, external = false }) {
  // Si lien externe, utilise <a> au lieu de <Link>
  if (external) {
    return (
      <a
        href={to}
        className="footer-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  // Sinon, utilise React Router Link
  return (
    <Link to={to} className="footer-link">
      {children}
    </Link>
  );
}

export default FooterLink;
