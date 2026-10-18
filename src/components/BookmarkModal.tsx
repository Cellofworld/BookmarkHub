import { useState, useEffect, useRef } from 'react';
import { Bookmark, Category } from '../types';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'favicon'>) => void;
  bookmark?: Bookmark | null;
  categories: Category[];
}

export default function BookmarkModal({ isOpen, onClose, onSave, bookmark, categories }: BookmarkModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (bookmark) {
        setTitle(bookmark.title);
        setUrl(bookmark.url);
        setDescription(bookmark.description);
        setCategoryId(bookmark.categoryId);
      } else {
        setTitle('');
        setUrl('');
        setDescription('');
        setCategoryId(categories[0]?.id || '');
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, bookmark, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    onSave({
      title: title.trim(),
      url: finalUrl,
      description: description.trim(),
      categoryId: categoryId || categories[0]?.id || '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {bookmark ? '✏️ Редактировать закладку' : '🔖 Новая закладка'}
          </h2>
          <form onSubmit={handleSubmit} className="modal__form">
            <div className="form-field">
              <label className="form-field__label">Название *</label>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Google"
                className="form-field__input"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-field__label">URL *</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="form-field__input"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-field__label">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Необязательное описание..."
                rows={2}
                className="form-field__textarea"
              />
            </div>
            <div className="form-field">
              <label className="form-field__label">Категория</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-field__select"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
        <div className="modal__footer">
          <button type="button" onClick={onClose} className="modal__btn modal__btn--secondary">
            Отмена
          </button>
          <button type="button" onClick={handleSubmit} className="modal__btn modal__btn--primary">
            {bookmark ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
