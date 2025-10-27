import { useState } from 'react';
import Button from '../../ui/Button/Button';
import api from '../../../services/api';
import './ReviewForm.css';

/**
 * ReviewForm - Formulaire de création/édition de review
 *
 * @param {String} gameId - ID RAWG du jeu
 * @param {Object} initialData - Données initiales (pour édition)
 * @param {Function} onSuccess - Callback après succès
 * @param {Function} onCancel - Callback annulation
 */
const ReviewForm = ({
  gameId,
  initialData = null,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    content: initialData?.content || '',
    spoiler: initialData?.spoiler || false
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /**
   * Validation du formulaire
   */
  const validate = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Veuillez donner une note';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Le titre ne peut pas dépasser 100 caractères';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis';
    } else if (formData.content.length < 50) {
      newErrors.content = 'La critique doit contenir au moins 50 caractères';
    } else if (formData.content.length > 5000) {
      newErrors.content = 'La critique ne peut pas dépasser 5000 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      const endpoint = initialData
        ? `/reviews/${initialData.id}`
        : '/reviews';

      const method = initialData ? 'put' : 'post';

      const response = await api[method](endpoint, {
        gameId: gameId,
        ...formData
      });

      onSuccess(response.data.review.id);

    } catch (err) {
      console.error('Erreur soumission review:', err);
      setErrors({
        submit: err.response?.data?.message || 'Une erreur est survenue'
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Gestion des changements
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {/* RATING */}
      <div className="review-form__group">
        <label className="review-form__label">
          Note <span className="review-form__required">*</span>
        </label>
        <div className="review-form__rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`review-form__star ${
                star <= formData.rating ? 'review-form__star--filled' : ''
              }`}
              onClick={() => handleChange('rating', star)}
            >
              ★
            </button>
          ))}
          <span className="review-form__rating-text">
            {formData.rating > 0 ? `${formData.rating}/5` : 'Pas de note'}
          </span>
        </div>
        {errors.rating && (
          <p className="review-form__error">{errors.rating}</p>
        )}
      </div>

      {/* TITLE */}
      <div className="review-form__group">
        <label htmlFor="title" className="review-form__label">
          Titre <span className="review-form__required">*</span>
        </label>
        <input
          id="title"
          type="text"
          className="review-form__input"
          placeholder="Ex: Un chef-d'œuvre intemporel"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={100}
        />
        <div className="review-form__helper">
          <span>{formData.title.length}/100</span>
        </div>
        {errors.title && (
          <p className="review-form__error">{errors.title}</p>
        )}
      </div>

      {/* CONTENT */}
      <div className="review-form__group">
        <label htmlFor="content" className="review-form__label">
          Critique <span className="review-form__required">*</span>
        </label>
        <textarea
          id="content"
          className="review-form__textarea"
          placeholder="Partagez votre avis détaillé sur ce jeu..."
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={12}
          maxLength={5000}
        />
        <div className="review-form__helper">
          <span>{formData.content.length}/5000</span>
          <span>Minimum 50 caractères</span>
        </div>
        {errors.content && (
          <p className="review-form__error">{errors.content}</p>
        )}
      </div>

      {/* SPOILER CHECKBOX */}
      <div className="review-form__group">
        <label className="review-form__checkbox">
          <input
            type="checkbox"
            checked={formData.spoiler}
            onChange={(e) => handleChange('spoiler', e.target.checked)}
          />
          <span>Cette critique contient des spoilers</span>
        </label>
      </div>

      {/* ERROR MESSAGE */}
      {errors.submit && (
        <div className="review-form__submit-error">
          {errors.submit}
        </div>
      )}

      {/* ACTIONS */}
      <div className="review-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
        >
          {submitting ? 'Publication...' : initialData ? 'Mettre à jour' : 'Publier'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
