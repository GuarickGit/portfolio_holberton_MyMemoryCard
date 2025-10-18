import { useState } from 'react';
import { login } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import './Login.css';

function Login({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      loginUser(data.user, data.token);
      onClose();
      alert(`Bienvenue ${data.user.username} !`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Bouton fermer */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Bordure dégradée */}
        <div className="modal-gradient-border"></div>

        {/* Contenu */}
        <div className="modal-inner">
          <h1 className="login-title">
            <span className="gradient-text">MyMemoryCard</span>
          </h1>
          <p className="login-subtitle">Accède à ta carte mémoire virtuelle</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p className="login-footer">
            Pas encore de compte ? <a href="/signup">S'inscrire</a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
