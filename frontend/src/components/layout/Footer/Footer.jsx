import { Link } from 'react-router-dom';
import FooterLink from '../../ui/FooterLink/FooterLink';
import Logo from '../../../assets/images/Logo.png';
import './Footer.css';

function Footer() {
  // Date actuelle pour le copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Colonne 1 : Logo + Description */}
        <div className="footer-section footer-brand">
          <Link to="/" className="footer-logo">
            <img src={Logo} alt="MyMemoryCard" />
          </Link>
          <p className="footer-tagline">
            Sauvegarde tes souvenirs de jeux vidéo
          </p>
        </div>

        {/* Colonne 2 : Informations */}
        <div className="footer-section">
          <h3 className="footer-title">Informations</h3>
          <nav className="footer-links">
            <FooterLink to="/about">À propos</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/faq">Foire aux questions</FooterLink>
          </nav>
        </div>

        {/* Colonne 3 : Réseaux sociaux (préparé mais caché pour l'instant) */}
        <div className="footer-section footer-social">
          <h3 className="footer-title">Suivez-nous</h3>
          <div className="footer-social-links">
            {/* On prépare les liens mais on les cache avec CSS pour l'instant */}
            <a
              href="https://twitter.com"
              className="footer-social-link hidden"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a
              href="https://discord.com"
              className="footer-social-link hidden"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              Discord
            </a>
            <a
              href="https://github.com"
              className="footer-social-link hidden"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              GitHub
            </a>
            <p className="footer-social-placeholder">Bientôt disponible</p>
          </div>
        </div>

      </div>

      {/* Barre de copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} MyMemoryCard - Projet RNCP5 Holberton
        </p>
      </div>
    </footer>
  );
}

export default Footer;
