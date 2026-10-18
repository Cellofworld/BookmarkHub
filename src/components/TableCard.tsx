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

      {table.description && <div className="table-card__description">{table.description}</div>}

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
                    <td key={colIndex}>{cell || '—'}</td>
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
          <button className="table-card__action table-card__action--view" onClick={() => onView(table)} title="Просмотр">
            👁️
          </button>
          <button className="table-card__action table-card__action--edit" onClick={() => onEdit(table)} title="Редактировать">
            ✏️
          </button>
          <button className="table-card__action table-card__action--delete" onClick={() => onDelete(table.id)} title="Удалить">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
