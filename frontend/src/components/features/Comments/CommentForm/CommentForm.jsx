import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../../../services/api.js';
import './CommentForm.css';

/**
 * CommentForm - Formulaire pour ajouter ou modifier un commentaire
 *
 * @param {string} targetType - 'review' ou 'memory' (pour ajout)
 * @param {string} targetId - ID de la review ou memory (pour ajout)
 * @param {object} editingComment - Commentaire en cours d'édition (optionnel)
 * @param {function} onCommentAdded - Callback après ajout
 * @param {function} onCommentUpdated - Callback après modification
 * @param {function} onCancelEdit - Callback pour annuler l'édition
 */
const CommentForm = ({
  targetType,
  targetId,
  editingComment = null,
  onCommentAdded,
  onCommentUpdated,
  onCancelEdit
}) => {
  const [content, setContent] = useState(editingComment?.content || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!editingComment;

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (content.trim().length === 0) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing) {
        // MODIFICATION
        const response = await api.put(`/comments/${editingComment.id}`, {
          content: content.trim()
        });
        onCommentUpdated(response.data.comment);
        onCancelEdit();
      } else {
        // AJOUT
        const response = await api.post('/comments', {
          targetType,
          targetId,
          content: content.trim()
        });
        onCommentAdded(response.data.comment);
        setContent(''); // Reset le formulaire
      }

    } catch (err) {
      console.error('Erreur soumission commentaire:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-form__textarea"
        placeholder={isEditing ? 'Modifier votre commentaire...' : 'Ajouter un commentaire...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={submitting}
      />

      {error && (
        <div className="comment-form__error">
          {error}
        </div>
      )}

      <div className="comment-form__actions">
        {isEditing && (
          <button
            type="button"
            className="comment-form__cancel"
            onClick={onCancelEdit}
            disabled={submitting}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="comment-form__submit"
          disabled={submitting || content.trim().length === 0}
        >
          {submitting ? (
            'Envoi...'
          ) : (
            <>
              <Send size={16} />
              {isEditing ? 'Modifier' : 'Envoyer'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
