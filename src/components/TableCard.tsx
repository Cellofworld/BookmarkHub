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

  const hasData = table.rows.some((row) => row.some((cell) => cell.trim() !== '')) ||
                  (table.cellStyles && Object.values(table.cellStyles).some(s => s.formula));

  const hasFormulas = table.cellStyles && Object.values(table.cellStyles).some(s => s.formula);
  const hasColumnTypes = table.columns && table.columns.some(c => c.type !== 'text');

  return (
    <div className="table-card">
      <div className="table-card__header">
        <div className="table-card__icon">📊</div>
        <div className="table-card__info">
          <div className="table-card__title">{table.title}</div>
          <div className="table-card__meta">
            {table.headers.length} столбцов · {table.rows.length} строк
            {hasFormulas && <span style={{ marginLeft: 8 }}>📐 Формулы</span>}
            {hasColumnTypes && <span style={{ marginLeft: 8 }}>🔢 Типы</span>}
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
                  <th key={i}>
                    {header}
                    {table.columns?.[i]?.type && table.columns[i].type !== 'text' && (
                      <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.6 }}>
                        {table.columns[i].type === 'number' ? '🔢' : 
                         table.columns[i].type === 'date' ? '📅' : 
                         table.columns[i].type === 'checkbox' ? '☑' : ''}
                      </span>
                    )}
                  </th>
                ))}
                {table.headers.length > 3 && <th>...</th>}
              </tr>
            </thead>
            <tbody>
              {table.rows.slice(0, 2).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.slice(0, 3).map((cell, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    const hasFormula = table.cellStyles?.[key]?.formula;
                    return (
                      <td key={colIndex} style={hasFormula ? { fontStyle: 'italic', color: 'var(--accent-primary)' } : {}}>
                        {cell || '—'}
                        {hasFormula && <span style={{ fontSize: 9, marginLeft: 2 }}>📐</span>}
                      </td>
                    );
                  })}
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
