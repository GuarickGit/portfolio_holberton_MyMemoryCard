import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import CommentForm from '../CommentForm/CommentForm.jsx';
import api from '../../../../services/api.js';
import './CommentItem.css';

/**
 * CommentItem - Affiche un commentaire individuel
 *
 * @param {object} comment - Données du commentaire
 * @param {object} currentUser - Utilisateur connecté
 * @param {function} onCommentUpdated - Callback après modification
 * @param {function} onCommentDeleted - Callback après suppression
 */
const CommentItem = ({ comment, currentUser, onCommentUpdated, onCommentDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Vérifier si l'utilisateur est l'auteur
  const isOwner = currentUser && currentUser.id === comment.user_id;

  /**
   * Suppression du commentaire
   */
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/comments/${comment.id}`);
      onCommentDeleted(comment.id);
    } catch (err) {
      console.error('Erreur suppression commentaire:', err);
      alert('Impossible de supprimer le commentaire');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Formater la date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="comment-item">
      {/* HEADER - Avatar + Username + Date */}
      <div className="comment-item__header">
        <img
          src={comment.avatar_url || '/default-avatar.png'}
          alt={comment.username}
          className="comment-item__avatar"
        />
        <div className="comment-item__author">
          <span className="comment-item__username">{comment.username}</span>
          <span className="comment-item__date">{formatDate(comment.created_at)}</span>
        </div>

        {/* ACTIONS - Modifier / Supprimer (seulement si propriétaire) */}
        {isOwner && !isEditing && (
          <div className="comment-item__actions">
            <button
              className="comment-item__action comment-item__action--edit"
              onClick={() => setIsEditing(true)}
              title="Modifier"
            >
              <Pencil size={14} />
            </button>
            <button
              className="comment-item__action comment-item__action--delete"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* CONTENU - Texte ou Formulaire d'édition */}
      {isEditing ? (
        <CommentForm
          editingComment={comment}
          onCommentUpdated={onCommentUpdated}
          onCancelEdit={() => setIsEditing(false)}
        />
      ) : (
        <p className="comment-item__content">{comment.content}</p>
      )}
    </div>
  );
};

export default CommentItem;
