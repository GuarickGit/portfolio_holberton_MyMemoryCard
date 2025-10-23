import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Profile() {
  const { userId } = useParams(); // Récupère l'ID depuis l'URL
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 24px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>
        Profil
      </h1>
      {user && user.id === userId ? (
        <p style={{ color: '#0ad06f', fontSize: '18px' }}>
          Bienvenue sur ton profil, {user.username} !
        </p>
      ) : (
        <p style={{ color: '#b0b0b0', fontSize: '18px' }}>
          Profil de l'utilisateur {userId}
        </p>
      )}
    </div>
  );
}

export default Profile;
