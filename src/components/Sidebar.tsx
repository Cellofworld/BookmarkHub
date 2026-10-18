import { Category, Bookmark } from '../types';
import { exportData, importData } from '../utils/dataStorage';
import { AppData } from '../utils/dataStorage';

interface SidebarProps {
  categories: Category[];
  bookmarks: Bookmark[];
  tablesCount: number;
  activeCategory: string | null;
  activeView: 'bookmarks' | 'tables';
  onSelectCategory: (id: string | null) => void;
  onChangeView: (view: 'bookmarks' | 'tables') => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  data: AppData;
  onDataImport: (data: AppData) => void;
}

export default function Sidebar({
  categories,
  bookmarks,
  tablesCount,
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
}: SidebarProps) {
  const getCategoryCount = (catId: string) => {
    return bookmarks.filter((b) => b.categoryId === catId).length;
  };

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

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">🔖</div>
          <div className="sidebar__logo-text">
            <div className="sidebar__logo-title">BookmarkHub</div>
            <div className="sidebar__logo-subtitle">Менеджер закладок</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sidebar__nav">
        <div className="sidebar__tabs">
          <button
            className={`sidebar__tab ${activeView === 'bookmarks' ? 'sidebar__tab--active' : ''}`}
            onClick={() => onChangeView('bookmarks')}
          >
            <span className="sidebar__tab-icon">🔖</span>
            <span>Закладки</span>
            <span className="sidebar__tab-count">{bookmarks.length}</span>
          </button>
          <button
            className={`sidebar__tab ${activeView === 'tables' ? 'sidebar__tab--active' : ''}`}
            onClick={() => onChangeView('tables')}
          >
            <span className="sidebar__tab-icon">📊</span>
            <span>Таблицы</span>
            <span className="sidebar__tab-count">{tablesCount}</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="sidebar__data-btns">
        <button className="sidebar__data-btn" onClick={handleExport}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Экспорт
        </button>
        <button className="sidebar__data-btn" onClick={handleImport}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Импорт
        </button>
      </div>

      {/* Categories / Tables Info */}
      <div className="sidebar__categories">
        {activeView === 'bookmarks' ? (
          <>
            <div className="sidebar__section-header">
              <span className="sidebar__section-title">Категории</span>
              <button className="sidebar__add-btn" onClick={onAddCategory} title="Добавить категорию">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* All bookmarks */}
            <div className="sidebar__item">
              <button
                className={`sidebar__item-btn ${activeCategory === null ? 'sidebar__item-btn--active' : ''}`}
                onClick={() => onSelectCategory(null)}
              >
                <span className="sidebar__item-icon">📋</span>
                <span className="sidebar__item-name">Все закладки</span>
                <span className="sidebar__item-count">{bookmarks.length}</span>
              </button>
            </div>

            {/* Category list */}
            {categories.map((cat) => (
              <div key={cat.id} className="sidebar__item">
                <button
                  className={`sidebar__item-btn ${activeCategory === cat.id ? 'sidebar__item-btn--active' : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span className="sidebar__item-icon">{cat.icon}</span>
                  <span className="sidebar__item-name">{cat.name}</span>
                  <span className="sidebar__item-count">{getCategoryCount(cat.id)}</span>
                </button>
                <div className="sidebar__item-actions">
                  <button
                    className="sidebar__item-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(cat);
                    }}
                    title="Редактировать"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {categories.length > 1 && (
                    <button
                      className="sidebar__item-action sidebar__item-action--delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(cat.id);
                      }}
                      title="Удалить"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="sidebar__info">
            <div className="sidebar__info-icon">📊</div>
            <div className="sidebar__info-title">Таблицы</div>
            <div className="sidebar__info-description">
              Создавайте и управляйте таблицами для хранения структурированных данных
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <button className="sidebar__theme-btn" onClick={onToggleDark}>
          <span className="sidebar__theme-icon">{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
        </button>
      </div>
    </aside>
  );
}
