import { useState, useMemo, useEffect } from 'react';
import { Bookmark, Category, Table } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import BookmarkCard from './components/BookmarkCard';
import BookmarkModal from './components/BookmarkModal';
import CategoryModal from './components/CategoryModal';
import TableEditorModal from './components/TableEditorModal';
import TableCard from './components/TableCard';
import TableViewModal from './components/TableViewModal';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Работа', icon: '💼', color: 'from-indigo-500 to-blue-500' },
  { id: '2', name: 'Развлечения', icon: '🎮', color: 'from-purple-500 to-pink-500' },
  { id: '3', name: 'Обучение', icon: '📚', color: 'from-green-500 to-emerald-500' },
  { id: '4', name: 'Новости', icon: '📰', color: 'from-orange-500 to-red-500' },
];

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: '1',
    title: 'Google',
    url: 'https://google.com',
    description: 'Поисковая система Google',
    categoryId: '1',
    favicon: '',
    createdAt: Date.now() - 100000,
  },
  {
    id: '2',
    title: 'GitHub',
    url: 'https://github.com',
    description: 'Платформа для разработки и хостинга кода',
    categoryId: '1',
    favicon: '',
    createdAt: Date.now() - 90000,
  },
  {
    id: '3',
    title: 'YouTube',
    url: 'https://youtube.com',
    description: 'Видеохостинг',
    categoryId: '2',
    favicon: '',
    createdAt: Date.now() - 80000,
  },
  {
    id: '4',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    description: 'Документация по веб-технологиям',
    categoryId: '3',
    favicon: '',
    createdAt: Date.now() - 70000,
  },
  {
    id: '5',
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    description: 'Вопросы и ответы для программистов',
    categoryId: '3',
    favicon: '',
    createdAt: Date.now() - 60000,
  },
  {
    id: '6',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    description: 'Новости из мира технологий',
    categoryId: '4',
    favicon: '',
    createdAt: Date.now() - 50000,
  },
];

const DEFAULT_TABLES: Table[] = [
  {
    id: '1',
    title: 'Расписание занятий',
    description: 'Еженедельное расписание',
    headers: ['День', 'Время', 'Предмет', 'Аудитория'],
    rows: [
      ['Понедельник', '09:00', 'Математика', '301'],
      ['Понедельник', '11:00', 'Физика', '205'],
      ['Вторник', '10:00', 'Программирование', '410'],
      ['Среда', '09:00', 'Английский язык', '102'],
    ],
    createdAt: Date.now() - 200000,
    updatedAt: Date.now() - 200000,
  },
  {
    id: '2',
    title: 'Список покупок',
    description: 'Продукты на неделю',
    headers: ['Продукт', 'Количество', 'Цена', 'Магазин'],
    rows: [
      ['Молоко', '2 л', '80 ₽', 'Пятёрочка'],
      ['Хлеб', '1 шт', '45 ₽', 'Пятёрочка'],
      ['Яблоки', '1 кг', '120 ₽', 'Магнит'],
    ],
    createdAt: Date.now() - 150000,
    updatedAt: Date.now() - 150000,
  },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function App() {
  const [categories, setCategories] = useLocalStorage<Category[]>('bookmark-categories', DEFAULT_CATEGORIES);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('bookmark-data', DEFAULT_BOOKMARKS);
  const [tables, setTables] = useLocalStorage<Table[]>('bookmark-tables', DEFAULT_TABLES);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'bookmarks' | 'tables'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [isDark, setIsDark] = useLocalStorage('bookmark-dark-mode', false);

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
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Filtered and sorted bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    if (activeCategory) {
      filtered = filtered.filter((b) => b.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt;
      return a.title.localeCompare(b.title);
    });
  }, [bookmarks, activeCategory, searchQuery, sortBy]);

  // Filtered and sorted tables
  const filteredTables = useMemo(() => {
    let filtered = tables;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') return b.updatedAt - a.updatedAt;
      return a.title.localeCompare(b.title);
    });
  }, [tables, searchQuery, sortBy]);

  // Bookmark actions
  const handleSaveBookmark = (data: Omit<Bookmark, 'id' | 'createdAt' | 'favicon'>) => {
    if (bookmarkModal.bookmark) {
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === bookmarkModal.bookmark!.id ? { ...b, ...data } : b
        )
      );
    } else {
      const newBookmark: Bookmark = {
        ...data,
        id: generateId(),
        createdAt: Date.now(),
        favicon: '',
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Category actions
  const handleSaveCategory = (data: Omit<Category, 'id'>) => {
    if (categoryModal.category) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryModal.category!.id ? { ...c, ...data } : c
        )
      );
    } else {
      const newCategory: Category = {
        ...data,
        id: generateId(),
      };
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Move bookmarks from deleted category to first available
    const firstCat = categories.find((c) => c.id !== id);
    if (firstCat) {
      setBookmarks((prev) =>
        prev.map((b) => (b.categoryId === id ? { ...b, categoryId: firstCat.id } : b))
      );
    }
    if (activeCategory === id) setActiveCategory(null);
  };

  // Table actions
  const handleSaveTable = (data: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (tableModal.table) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableModal.table!.id
            ? { ...t, ...data, updatedAt: Date.now() }
            : t
        )
      );
    } else {
      const newTable: Table = {
        ...data,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setTables((prev) => [newTable, ...prev]);
    }
  };

  const handleDeleteTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const activeCategoryData = activeCategory ? getCategoryById(activeCategory) : null;

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-950 ${isDark ? 'dark' : ''}`}>
      <Sidebar
        categories={categories}
        bookmarks={bookmarks}
        tablesCount={tables.length}
        activeCategory={activeCategory}
        activeView={activeView}
        onSelectCategory={setActiveCategory}
        onChangeView={setActiveView}
        onAddCategory={() => setCategoryModal({ open: true, category: null })}
        onEditCategory={(cat) => setCategoryModal({ open: true, category: cat })}
        onDeleteCategory={handleDeleteCategory}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {activeView === 'bookmarks' ? (
                  <>
                    {activeCategoryData ? (
                      <>
                        <span>{activeCategoryData.icon}</span>
                        {activeCategoryData.name}
                      </>
                    ) : (
                      <>📋 Все закладки</>
                    )}
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
                      ({filteredBookmarks.length})
                    </span>
                  </>
                ) : (
                  <>
                    📊 Таблицы
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
                      ({filteredTables.length})
                    </span>
                  </>
                )}
              </h2>
            </div>

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeView === 'bookmarks' ? 'Поиск закладок...' : 'Поиск таблиц...'}
                className="w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeView === 'bookmarks' ? 'Добавить' : 'Создать таблицу'}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'bookmarks' ? (
            filteredBookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBookmarks.map((bookmark) => (
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
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                  <span className="text-4xl">
                    {searchQuery ? '🔍' : '📭'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {searchQuery ? 'Ничего не найдено' : 'Нет закладок'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Добавьте свою первую закладку, нажав кнопку "Добавить"'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setBookmarkModal({ open: true, bookmark: null })}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-indigo-500/25"
                  >
                    Добавить закладку
                  </button>
                )}
              </div>
            )
          ) : (
            filteredTables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTables.map((table) => (
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
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
                  <span className="text-4xl">
                    {searchQuery ? '🔍' : '📭'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {searchQuery ? 'Ничего не найдено' : 'Нет таблиц'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Создайте свою первую таблицу, нажав кнопку "Создать таблицу"'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setTableModal({ open: true, table: null })}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-indigo-500/25"
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
        categories={categories}
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
