import { Table } from '../types';

interface TableViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onEdit: (table: Table) => void;
}

export default function TableViewModal({ isOpen, onClose, table, onEdit }: TableViewModalProps) {
  if (!isOpen || !table) return null;

  const hasData = table.rows.some((row) => row.some((cell) => cell.trim() !== ''));

  const getCellStyle = (rowIndex: number, colIndex: number): React.CSSProperties => {
    const key = `${rowIndex}-${colIndex}`;
    const style = table.cellStyles?.[key];
    if (!style) return {};
    return {
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      color: style.color || 'inherit',
      backgroundColor: style.background || 'transparent',
      textAlign: style.align || 'left',
    };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--full" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="table-view__header">
            <div className="table-view__info">
              <h2 className="table-view__title">
                <span>📊</span>
                {table.title}
              </h2>
              {table.description && <p className="table-view__description">{table.description}</p>}
            </div>
            <div className="table-view__actions">
              <button className="table-view__edit-btn" onClick={() => { onEdit(table); onClose(); }}>
                Редактировать
              </button>
              <button className="table-view__close-btn" onClick={onClose}>×</button>
            </div>
          </div>
        </div>

        <div className="modal__body">
          {hasData ? (
            <div className="table-display">
              <table className="table-display__table">
                <thead>
                  <tr>
                    {table.headers.map((header, i) => (
                      <th key={i}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} style={getCellStyle(rowIndex, colIndex)}>
                          {cell || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <h3 className="empty-state__title">Таблица пуста</h3>
              <p className="empty-state__description">Добавьте данные, нажав кнопку "Редактировать"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
