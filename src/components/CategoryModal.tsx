import { useState, useEffect, useRef } from 'react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>) => void;
  category?: Category | null;
}

const ICONS = ['📁', '💼', '🎮', '📚', '🎵', '🎬', '🛒', '💡', '🔧', '🌐', '📰', '🏠', '❤️', '⭐', '🚀', '🎨'];
const COLORS = [
  '#6366f1', '#a855f7', '#10b981', '#f59e0b',
  '#06b6d4', '#f43f5e', '#eab308', '#8b5cf6',
];

export default function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setIcon(category.icon);
        setColor(category.color);
      } else {
        setName('');
        setIcon(ICONS[Math.floor(Math.random() * ICONS.length)]);
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {category ? '✏️ Редактировать категорию' : '📁 Новая категория'}
          </h2>
          <form onSubmit={handleSubmit} className="modal__form">
            <div className="form-field">
              <label className="form-field__label">Название *</label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Работа"
                className="form-field__input"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-field__label">Иконка</label>
              <div className="icon-picker">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`icon-picker__item ${icon === i ? 'icon-picker__item--active' : ''}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label className="form-field__label">Цвет</label>
              <div className="color-picker">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`color-picker__item ${color === c ? 'color-picker__item--active' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>
        <div className="modal__footer">
          <button type="button" onClick={onClose} className="modal__btn modal__btn--secondary">
            Отмена
          </button>
          <button type="button" onClick={handleSubmit} className="modal__btn modal__btn--primary">
            {category ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
