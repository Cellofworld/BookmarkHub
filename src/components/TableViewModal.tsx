import { Table } from '../types';

interface TableViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onEdit: (table: Table) => void;
}

// Formula evaluator (simplified for view)
function evaluateFormula(formula: string, rows: string[][]): string {
  if (!formula.startsWith('=')) return formula;
  
  const expr = formula.substring(1).toUpperCase();
  
  const getRangeValues = (range: string): number[] => {
    const parts = range.split(':');
    if (parts.length !== 2) {
      const match = range.match(/^([A-Z]+)(\d+)$/);
      if (!match) return [];
      const colIndex = colLetterToIndex(match[1]);
      const rowNum = parseInt(match[2]) - 1;
      const val = parseFloat(rows[rowNum]?.[colIndex] || '');
      return isNaN(val) ? [] : [val];
    }
    
    const startMatch = parts[0].match(/^([A-Z]+)(\d+)$/);
    const endMatch = parts[1].match(/^([A-Z]+)(\d+)$/);
    if (!startMatch || !endMatch) return [];
    
    const startCol = colLetterToIndex(startMatch[1]);
    const startRow = parseInt(startMatch[2]) - 1;
    const endCol = colLetterToIndex(endMatch[1]);
    const endRow = parseInt(endMatch[2]) - 1;
    
    const values: number[] = [];
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r >= 0 && r < rows.length && c >= 0 && c < (rows[0]?.length || 0)) {
          const val = parseFloat(rows[r][c]);
          if (!isNaN(val)) values.push(val);
        }
      }
    }
    return values;
  };
  
  try {
    const sumMatch = expr.match(/SUM\(([^)]+)\)/);
    if (sumMatch) {
      const values = getRangeValues(sumMatch[1]);
      return values.reduce((a, b) => a + b, 0).toString();
    }
    
    const avgMatch = expr.match(/(?:AVG|AVERAGE)\(([^)]+)\)/);
    if (avgMatch) {
      const values = getRangeValues(avgMatch[1]);
      if (values.length === 0) return '0';
      return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    }
    
    const minMatch = expr.match(/MIN\(([^)]+)\)/);
    if (minMatch) {
      const values = getRangeValues(minMatch[1]);
      return values.length > 0 ? Math.min(...values).toString() : '0';
    }
    
    const maxMatch = expr.match(/MAX\(([^)]+)\)/);
    if (maxMatch) {
      const values = getRangeValues(maxMatch[1]);
      return values.length > 0 ? Math.max(...values).toString() : '0';
    }
    
    const countMatch = expr.match(/COUNT\(([^)]+)\)/);
    if (countMatch) {
      const values = getRangeValues(countMatch[1]);
      return values.length.toString();
    }
    
    return formula;
  } catch {
    return '#ERROR';
  }
}

function colLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1;
}

export default function TableViewModal({ isOpen, onClose, table, onEdit }: TableViewModalProps) {
  if (!isOpen || !table) return null;

  const hasData = table.rows.some((row) => row.some((cell) => cell.trim() !== '')) || 
                  (table.cellStyles && Object.values(table.cellStyles).some(s => s.formula));

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

  const getCellDisplayValue = (rowIndex: number, colIndex: number): string => {
    const key = `${rowIndex}-${colIndex}`;
    const style = table.cellStyles?.[key];
    if (style?.formula) {
      return evaluateFormula(style.formula, table.rows);
    }
    return table.rows[rowIndex]?.[colIndex] || '';
  };

  const getColumnType = (colIndex: number): string => {
    return table.columns?.[colIndex]?.type || 'text';
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

        <div className="modal__body" style={{ padding: 0 }}>
          {hasData ? (
            <div className="excel-table-wrapper" style={{ maxHeight: '70vh' }}>
              <table className="excel-table">
                <thead>
                  <tr>
                    <th className="excel-row-header">#</th>
                    {table.headers.map((header, i) => (
                      <th key={i} className="excel-col-header">
                        <div className="excel-col-header__content">
                          <span className="excel-col-letter">
                            {String.fromCharCode(65 + i)}
                            {table.columns?.[i]?.type && table.columns[i].type !== 'text' && (
                              <span style={{ marginLeft: 4, fontSize: 8 }}>
                                {table.columns[i].type === 'number' ? '🔢' : 
                                 table.columns[i].type === 'date' ? '📅' : 
                                 table.columns[i].type === 'checkbox' ? '☑' : ''}
                              </span>
                            )}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 4px' }}>{header}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="excel-row-header">{rowIndex + 1}</td>
                      {row.map((cell, colIndex) => {
                        const displayValue = getCellDisplayValue(rowIndex, colIndex);
                        const colType = getColumnType(colIndex);
                        
                        return (
                          <td key={colIndex} style={getCellStyle(rowIndex, colIndex)}>
                            <span className="excel-cell-value">
                              {colType === 'checkbox' ? (
                                <input type="checkbox" checked={cell === 'true'} readOnly style={{ pointerEvents: 'none' }} />
                              ) : (
                                displayValue || '—'
                              )}
                            </span>
                          </td>
                        );
                      })}
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

        {/* Status Bar */}
        <div className="excel-status-bar">
          <span>Строк: {table.rows.length} | Столбцов: {table.headers.length}</span>
          {table.cellStyles && Object.values(table.cellStyles).some(s => s.formula) && (
            <span>📐 Содержит формулы</span>
          )}
        </div>
      </div>
    </div>
  );
}
