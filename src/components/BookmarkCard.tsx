import { Bookmark, Category } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  category?: Category;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

export default function BookmarkCard({ bookmark, category, onEdit, onDelete }: BookmarkCardProps) {
  const favicon = getFaviconUrl(bookmark.url);

  return (
    <div className="bookmark-card">
      <div className="bookmark-card__header">
        <div className="bookmark-card__favicon">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="bookmark-card__favicon-img"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const fallback = document.createElement('span');
                  fallback.className = 'bookmark-card__favicon-fallback';
                  fallback.textContent = '🔗';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <span className="bookmark-card__favicon-fallback">🔗</span>
          )}
        </div>
        <div className="bookmark-card__info">
          <div className="bookmark-card__title">{bookmark.title}</div>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bookmark-card__url"
          >
            {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        </div>
      </div>

      {bookmark.description && (
        <div className="bookmark-card__description">{bookmark.description}</div>
      )}

      {category && (
        <div
          className="bookmark-card__category"
          style={{ background: category.color }}
        >
          <span className="bookmark-card__category-icon">{category.icon}</span>
          {category.name}
        </div>
      )}

      <div className="bookmark-card__actions">
        <button
          className="bookmark-card__action bookmark-card__action--edit"
          onClick={() => onEdit(bookmark)}
          title="Редактировать"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          className="bookmark-card__action bookmark-card__action--delete"
          onClick={() => onDelete(bookmark.id)}
          title="Удалить"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
