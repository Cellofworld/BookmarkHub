import { useState, useMemo, useEffect } from 'react';
import { Bookmark, Category, Table } from './types';
import { useAppData } from './hooks/useAppData';
import { AppData, generateId, saveData } from './utils/dataStorage';
import Sidebar from './components/Sidebar';
import BookmarkCard from './components/BookmarkCard';
import BookmarkModal from './components/BookmarkModal';
import CategoryModal from './components/CategoryModal';
import TableEditorModal from './components/TableEditorModal';
import TableCard from './components/TableCard';
import TableViewModal from './components/TableViewModal';

function App() {
  const { data, loading, updateData } = useAppData();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'bookmarks' | 'tables'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [isDark, setIsDark] = useState(false);

  // Modals
  const [bookmarkModal, setBookmarkModal] = useState<{ open: boolean; bookmark: Bookmark | null }>({
    open: false,
    bookmark: null,
  });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [tableModal, setTableModal] = useState<{ open: boolean; table: Table | null }>({
    open: false,
    table: null,
  });
  const [tableViewModal, setTableViewModal] = useState<{ open: boolean; table: Table | null }>({
    open: false,
    table: null,
  });

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  // Filtered and sorted bookmarks
  const filteredBookmarks = useMemo(() => {
    if (!data) return [];
    let filtered = data.bookmarks;

    if (activeCategory) {
      filtered = filtered.filter((b: Bookmark) => b.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b: Bookmark) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a: Bookmark, b: Bookmark) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt;
      return a.title.localeCompare(b.title);
    });
  }, [data, activeCategory, searchQuery, sortBy]);

  // Filtered and sorted tables
  const filteredTables = useMemo(() => {
    if (!data) return [];
    let filtered = data.tables;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t: Table) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a: Table, b: Table) => {
      if (sortBy === 'date') return b.updatedAt - a.updatedAt;
      return a.title.localeCompare(b.title);
    });
  }, [data, searchQuery, sortBy]);

  // Bookmark actions
  const handleSaveBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'favicon'>) => {
    if (bookmarkModal.bookmark) {
      updateData((prev: AppData) => ({
        ...prev,
        bookmarks: prev.bookmarks.map((b: Bookmark) =>
          b.id === bookmarkModal.bookmark!.id ? { ...b, ...bookmarkData } : b
        ),
      }));
    } else {
      const newBookmark: Bookmark = {
        ...bookmarkData,
        id: generateId(),
        createdAt: Date.now(),
        favicon: '',
      };
      updateData((prev: AppData) => ({
        ...prev,
        bookmarks: [newBookmark, ...prev.bookmarks],
      }));
    }
  };

  const handleDeleteBookmark = (id: string) => {
    updateData((prev: AppData) => ({
      ...prev,
      bookmarks: prev.bookmarks.filter((b: Bookmark) => b.id !== id),
    }));
  };

  // Category actions
  const handleSaveCategory = (categoryData: Omit<Category, 'id'>) => {
    if (categoryModal.category) {
      updateData((prev: AppData) => ({
        ...prev,
        categories: prev.categories.map((c: Category) =>
          c.id === categoryModal.category!.id ? { ...c, ...categoryData } : c
        ),
      }));
    } else {
      const newCategory: Category = {
        ...categoryData,
        id: generateId(),
      };
      updateData((prev: AppData) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
    }
  };

  const handleDeleteCategory = (id: string) => {
    updateData((prev: AppData) => {
      const firstCat = prev.categories.find((c: Category) => c.id !== id);
      const newBookmarks = firstCat
        ? prev.bookmarks.map((b: Bookmark) =>
            b.categoryId === id ? { ...b, categoryId: firstCat.id } : b
          )
        : prev.bookmarks;
      
      return {
        ...prev,
        categories: prev.categories.filter((c: Category) => c.id !== id),
        bookmarks: newBookmarks,
      };
    });
    if (activeCategory === id) setActiveCategory(null);
  };

  // Table actions
  const handleSaveTable = (tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (tableModal.table) {
      updateData((prev: AppData) => ({
        ...prev,
        tables: prev.tables.map((t: Table) =>
          t.id === tableModal.table!.id
            ? { ...t, ...tableData, updatedAt: Date.now() }
            : t
        ),
      }));
    } else {
      const newTable: Table = {
        ...tableData,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updateData((prev: AppData) => ({
        ...prev,
        tables: [newTable, ...prev.tables],
      }));
    }
  };

  const handleDeleteTable = (id: string) => {
    updateData((prev: AppData) => ({
      ...prev,
      tables: prev.tables.filter((t: Table) => t.id !== id),
    }));
  };

  const handleDataImport = (importedData: AppData) => {
    updateData(() => importedData);
    saveData(importedData);
  };

  const getCategoryById = (id: string) => data?.categories.find((c: Category) => c.id === id);

  const activeCategoryData = activeCategory ? getCategoryById(activeCategory) : null;

  if (loading || !data) {
    return (
      <div className="app__loading">
        <div className="app__loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        categories={data.categories}
        bookmarks={data.bookmarks}
        tablesCount={data.tables.length}
        activeCategory={activeCategory}
        activeView={activeView}
        onSelectCategory={setActiveCategory}
        onChangeView={setActiveView}
        onAddCategory={() => setCategoryModal({ open: true, category: null })}
        onEditCategory={(cat) => setCategoryModal({ open: true, category: cat })}
        onDeleteCategory={handleDeleteCategory}
        isDark={isDark}
        onToggleDark={toggleDark}
        data={data}
        onDataImport={handleDataImport}
      />

      {/* Main content */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="header__title">
            {activeView === 'bookmarks' ? (
              <>
                {activeCategoryData ? (
                  <>
                    <span className="header__title-icon">{activeCategoryData.icon}</span>
                    <span className="header__title-text">{activeCategoryData.name}</span>
                  </>
                ) : (
                  <>
                    <span className="header__title-icon">📋</span>
                    <span className="header__title-text">Все закладки</span>
                  </>
                )}
                <span className="header__count">({filteredBookmarks.length})</span>
              </>
            ) : (
              <>
                <span className="header__title-icon">📊</span>
                <span className="header__title-text">Таблицы</span>
                <span className="header__count">({filteredTables.length})</span>
              </>
            )}
          </div>

          {/* Search */}
          <div className="search">
            <svg className="search__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeView === 'bookmarks' ? 'Поиск закладок...' : 'Поиск таблиц...'}
              className="search__input"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="sort-select"
          >
            <option value="date">По дате</option>
            <option value="name">По имени</option>
          </select>

          {/* Add button */}
          <button
            onClick={() => {
              if (activeView === 'bookmarks') {
                setBookmarkModal({ open: true, bookmark: null });
              } else {
                setTableModal({ open: true, table: null });
              }
            }}
            className="add-btn"
          >
            <svg className="add-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {activeView === 'bookmarks' ? 'Добавить' : 'Создать таблицу'}
          </button>
        </header>

        {/* Content */}
        <div className="content">
          {activeView === 'bookmarks' ? (
            filteredBookmarks.length > 0 ? (
              <div className="grid">
                {filteredBookmarks.map((bookmark: Bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    category={getCategoryById(bookmark.categoryId)}
                    onEdit={(b) => setBookmarkModal({ open: true, bookmark: b })}
                    onDelete={handleDeleteBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">
                  {searchQuery ? '🔍' : '📭'}
                </div>
                <h3 className="empty-state__title">
                  {searchQuery ? 'Ничего не найдено' : 'Нет закладок'}
                </h3>
                <p className="empty-state__description">
                  {searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Добавьте свою первую закладку, нажав кнопку "Добавить"'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setBookmarkModal({ open: true, bookmark: null })}
                    className="empty-state__btn"
                  >
                    Добавить закладку
                  </button>
                )}
              </div>
            )
          ) : (
            filteredTables.length > 0 ? (
              <div className="grid grid--tables">
                {filteredTables.map((table: Table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onEdit={(t) => setTableModal({ open: true, table: t })}
                    onDelete={handleDeleteTable}
                    onView={(t) => setTableViewModal({ open: true, table: t })}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">
                  {searchQuery ? '🔍' : '📭'}
                </div>
                <h3 className="empty-state__title">
                  {searchQuery ? 'Ничего не найдено' : 'Нет таблиц'}
                </h3>
                <p className="empty-state__description">
                  {searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Создайте свою первую таблицу, нажав кнопку "Создать таблицу"'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setTableModal({ open: true, table: null })}
                    className="empty-state__btn"
                  >
                    Создать таблицу
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </main>

      {/* Modals */}
      <BookmarkModal
        isOpen={bookmarkModal.open}
        onClose={() => setBookmarkModal({ open: false, bookmark: null })}
        onSave={handleSaveBookmark}
        bookmark={bookmarkModal.bookmark}
        categories={data.categories}
      />
      <CategoryModal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false, category: null })}
        onSave={handleSaveCategory}
        category={categoryModal.category}
      />
      <TableEditorModal
        isOpen={tableModal.open}
        onClose={() => setTableModal({ open: false, table: null })}
        onSave={handleSaveTable}
        table={tableModal.table}
      />
      <TableViewModal
        isOpen={tableViewModal.open}
        onClose={() => setTableViewModal({ open: false, table: null })}
        table={tableViewModal.table}
        onEdit={(t) => setTableModal({ open: true, table: t })}
      />
    </div>
  );
}

export default App;
