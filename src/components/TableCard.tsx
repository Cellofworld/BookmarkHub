import { Table } from '../types';

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
  onView: (table: Table) => void;
}

export default function TableCard({ table, onEdit, onDelete, onView }: TableCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const hasData = table.rows.some((row) => row.some((cell) => cell.trim() !== ''));

  return (
    <div className="table-card">
      <div className="table-card__header">
        <div className="table-card__icon">📊</div>
        <div className="table-card__info">
          <div className="table-card__title">{table.title}</div>
          <div className="table-card__meta">
            {table.headers.length} столбцов · {table.rows.length} строк
          </div>
        </div>
      </div>

      {table.description && (
        <div className="table-card__description">{table.description}</div>
      )}

      {hasData && (
        <div className="table-card__preview">
          <table className="table-card__preview-table">
            <thead>
              <tr>
                {table.headers.slice(0, 3).map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
                {table.headers.length > 3 && <th>...</th>}
              </tr>
            </thead>
            <tbody>
              {table.rows.slice(0, 2).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.slice(0, 3).map((cell, colIndex) => (
                    <td key={colIndex}>{cell}</td>
                  ))}
                  {row.length > 3 && <td>...</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-card__footer">
        <span className="table-card__date">{formatDate(table.updatedAt)}</span>
        <div className="table-card__actions">
          <button
            className="table-card__action table-card__action--view"
            onClick={() => onView(table)}
            title="Просмотр"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            className="table-card__action table-card__action--edit"
            onClick={() => onEdit(table)}
            title="Редактировать"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="table-card__action table-card__action--delete"
            onClick={() => onDelete(table.id)}
            title="Удалить"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
