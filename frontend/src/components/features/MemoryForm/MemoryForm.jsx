import { useState } from 'react';
import Button from '../../ui/Button/Button';
import api from '../../../services/api';
import './MemoryForm.css';

/**
 * MemoryForm - Formulaire de création/édition de souvenir
 *
 * @param {String} gameId - ID RAWG du jeu
 * @param {Object} initialData - Données initiales (pour édition)
 * @param {Function} onSuccess - Callback après succès
 * @param {Function} onCancel - Callback annulation
 */
const MemoryForm = ({
  gameId,
  initialData = null,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
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

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Le titre ne peut pas dépasser 100 caractères';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Le souvenir doit contenir au moins 20 caractères';
    } else if (formData.content.length > 5000) {
      newErrors.content = 'Le souvenir ne peut pas dépasser 5000 caractères';
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
        ? `/memories/${initialData.id}`
        : '/memories';

      const method = initialData ? 'put' : 'post';

      const response = await api[method](endpoint, {
        gameId,
        title: formData.title,
        content: formData.content,
        spoiler: formData.spoiler
      });

      onSuccess(response.data.memory.id);

    } catch (err) {
      console.error('Erreur soumission souvenir:', err);

      // Extraire le message d'erreur spécifique du backend
      const errorMessage = err.response?.data?.error
        || err.response?.data?.message
        || 'Une erreur est survenue';

      setErrors({
        submit: errorMessage
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
    <form className="memory-form" onSubmit={handleSubmit}>
      {/* TITLE */}
      <div className="memory-form__group">
        <label htmlFor="title" className="memory-form__label">
          Titre <span className="memory-form__required">*</span>
        </label>
        <input
          id="title"
          type="text"
          className="memory-form__input"
          placeholder="Ex: Ma première victoire épique"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={100}
        />
        <div className="memory-form__helper">
          <span>{formData.title.length}/100</span>
        </div>
        {errors.title && (
          <p className="memory-form__error">{errors.title}</p>
        )}
      </div>

      {/* CONTENT */}
      <div className="memory-form__group">
        <label htmlFor="content" className="memory-form__label">
          Souvenir <span className="memory-form__required">*</span>
        </label>
        <textarea
          id="content"
          className="memory-form__textarea"
          placeholder="Partagez votre souvenir de ce jeu..."
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={12}
          maxLength={5000}
        />
        <div className="memory-form__helper">
          <span>{formData.content.length}/5000</span>
          <span>Minimum 20 caractères</span>
        </div>
        {errors.content && (
          <p className="memory-form__error">{errors.content}</p>
        )}
      </div>

      {/* SPOILER CHECKBOX */}
      <div className="memory-form__group">
        <label className="memory-form__checkbox">
          <input
            type="checkbox"
            checked={formData.spoiler}
            onChange={(e) => handleChange('spoiler', e.target.checked)}
          />
          <span>Ce souvenir contient des spoilers</span>
        </label>
      </div>

      {/* ERROR MESSAGE */}
      {errors.submit && (
        <div className="memory-form__submit-error">
          {errors.submit}
        </div>
      )}

      {/* ACTIONS */}
      <div className="memory-form__actions">
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

export default MemoryForm;
