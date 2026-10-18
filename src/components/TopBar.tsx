import { Category, AppData } from '../types';
import { exportData, importData, loadFromPath, getSyncPath, setSyncPath } from '../utils/dataStorage';
import { useState } from 'react';

interface TopBarProps {
  categories: Category[];
  bookmarksCount: number;
  tablesCount: number;
  tasksCount: number;
  activeCategory: string | null;
  activeView: 'bookmarks' | 'tables' | 'tasks';
  onSelectCategory: (id: string | null) => void;
  onChangeView: (view: 'bookmarks' | 'tables' | 'tasks') => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  data: AppData;
  onDataImport: (data: AppData) => void;
}

export default function TopBar({
  categories,
  bookmarksCount,
  tablesCount,
  tasksCount,
  activeCategory,
  activeView,
  onSelectCategory,
  onChangeView,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isDark,
  onToggleDark,
  data,
  onDataImport,
}: TopBarProps) {
  const [syncPath, setSyncPathState] = useState(getSyncPath() || '');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const handleExport = () => {
    exportData(data);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const importedData = await importData(file);
          onDataImport(importedData);
        } catch (error) {
          alert('Ошибка при импорте файла');
        }
      }
    };
    input.click();
  };

  const handleSync = async () => {
    if (!syncPath.trim()) {
      alert('Укажите путь к файлу');
      return;
    }
    setSyncStatus('loading');
    try {
      const syncedData = await loadFromPath(syncPath.trim());
      onDataImport(syncedData);
      setSyncPath(syncPath.trim());
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <div className="topbar__logo">
            <div className="topbar__logo-icon">🔖</div>
            <span className="topbar__logo-text">BookmarkHub</span>
          </div>

          <nav className="topbar__nav">
            <button
              className={`topbar__nav-btn ${activeView === 'bookmarks' ? 'topbar__nav-btn--active' : ''}`}
              onClick={() => onChangeView('bookmarks')}
            >
              <span>🔖</span>
              <span>Закладки</span>
              <span className="topbar__nav-count">{bookmarksCount}</span>
            </button>
            <button
              className={`topbar__nav-btn ${activeView === 'tables' ? 'topbar__nav-btn--active' : ''}`}
              onClick={() => onChangeView('tables')}
            >
              <span>📊</span>
              <span>Таблицы</span>
              <span className="topbar__nav-count">{tablesCount}</span>
            </button>
            <button
              className={`topbar__nav-btn ${activeView === 'tasks' ? 'topbar__nav-btn--active' : ''}`}
              onClick={() => onChangeView('tasks')}
            >
              <span>✅</span>
              <span>Задачи</span>
              <span className="topbar__nav-count">{tasksCount}</span>
            </button>
          </nav>

          {activeView === 'bookmarks' && (
            <div className="topbar__categories">
              <button
                className={`topbar__cat-btn ${activeCategory === null ? 'topbar__cat-btn--active' : ''}`}
                onClick={() => onSelectCategory(null)}
              >
                Все
              </button>
              {categories.map((cat) => (
                <div key={cat.id} className="topbar__cat-wrapper">
                  <button
                    className={`topbar__cat-btn ${activeCategory === cat.id ? 'topbar__cat-btn--active' : ''}`}
                    onClick={() => onSelectCategory(cat.id)}
                    style={{ '--cat-color': cat.color } as React.CSSProperties}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                  <div className="topbar__cat-actions">
                    <button onClick={() => onEditCategory(cat)} title="Редактировать">✏️</button>
                    {categories.length > 1 && (
                      <button onClick={() => onDeleteCategory(cat.id)} title="Удалить">🗑️</button>
                    )}
                  </div>
                </div>
              ))}
              <button className="topbar__cat-btn topbar__cat-btn--add" onClick={onAddCategory} title="Добавить категорию">
                +
              </button>
            </div>
          )}
        </div>

        <div className="topbar__right">
          <button
            className={`topbar__sync-btn ${syncStatus}`}
            onClick={() => setShowSyncModal(true)}
            title="Синхронизация"
          >
            <svg className={`topbar__sync-icon ${syncStatus === 'loading' ? 'topbar__sync-icon--spinning' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Синхр.</span>
            {syncStatus === 'success' && <span className="topbar__sync-status">✓</span>}
            {syncStatus === 'error' && <span className="topbar__sync-status">✗</span>}
          </button>

          <button className="topbar__action-btn" onClick={handleExport} title="Экспорт">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button className="topbar__action-btn" onClick={handleImport} title="Импорт">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button className="topbar__theme-btn" onClick={onToggleDark} title="Сменить тему">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {showSyncModal && (
        <div className="modal-overlay" onClick={() => setShowSyncModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">🔄 Синхронизация данных</h2>
              <p className="modal__subtitle">Укажите путь к JSON файлу для загрузки данных</p>
            </div>
            <div className="modal__body">
              <div className="form-field">
                <label className="form-field__label">Путь к файлу</label>
                <input
                  type="text"
                  value={syncPath}
                  onChange={(e) => setSyncPathState(e.target.value)}
                  placeholder="/data.json или https://example.com/data.json"
                  className="form-field__input"
                />
              </div>
              {getSyncPath() && (
                <div className="sync-info">
                  <span className="sync-info__label">Сохранённый путь:</span>
                  <code className="sync-info__path">{getSyncPath()}</code>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button className="modal__btn modal__btn--secondary" onClick={() => setShowSyncModal(false)}>
                Отмена
              </button>
              <button className="modal__btn modal__btn--primary" onClick={handleSync}>
                Синхронизировать
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
