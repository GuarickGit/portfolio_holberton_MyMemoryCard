import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import CommentForm from '../CommentForm/CommentForm.jsx';
import CommentItem from '../CommentItem/CommentItem.jsx';
import api from '../../../../services/api.js';
import './CommentSection.css';

/**
 * CommentSection - Section complète des commentaires
 *
 * @param {string} targetType - 'review' ou 'memory'
 * @param {string} targetId - ID de la review ou memory
 */
const CommentSection = ({ targetType, targetId }) => {
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les commentaires au montage
  useEffect(() => {
    fetchComments();
  }, [targetType, targetId]);

  /**
   * Récupère tous les commentaires
   */
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/comments/${targetType}/${targetId}`);
      setComments(response.data.comments);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
      setError('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback après ajout d'un commentaire
   */
  const handleCommentAdded = (newComment) => {
    // Ajoute le nouveau commentaire en haut de la liste
    setComments([newComment, ...comments]);
  };

  /**
   * Callback après modification d'un commentaire
   */
  const handleCommentUpdated = (updatedComment) => {
    setComments(comments.map(c =>
      c.id === updatedComment.id ? updatedComment : c
    ));
  };

  /**
   * Callback après suppression d'un commentaire
   */
  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section__title">
        Commentaires ({comments.length})
      </h3>

      {/* FORMULAIRE D'AJOUT - Seulement si connecté */}
      {isAuthenticated ? (
        <CommentForm
          targetType={targetType}
          targetId={targetId}
          onCommentAdded={handleCommentAdded}
        />
      ) : (
        <div className="comment-section__login-prompt">
          <p>Connectez-vous pour commenter</p>
        </div>
      )}

      {/* LISTE DES COMMENTAIRES */}
      {loading ? (
        <div className="comment-section__loading">
          <div className="spinner"></div>
          <p>Chargement des commentaires...</p>
        </div>
      ) : error ? (
        <div className="comment-section__error">
          <p>{error}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="comment-section__empty">
          <p>Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
        </div>
      ) : (
        <div className="comment-section__list">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
