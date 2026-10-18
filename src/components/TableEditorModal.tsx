import { useState, useEffect } from 'react';
import { Table, CellStyle } from '../types';

interface TableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => void;
  table?: Table | null;
}

export default function TableEditorModal({ isOpen, onClose, onSave, table }: TableEditorModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [headers, setHeaders] = useState<string[]>(['Столбец 1', 'Столбец 2', 'Столбец 3']);
  const [rows, setRows] = useState<string[][]>([['', '', ''], ['', '', '']]);
  const [cellStyles, setCellStyles] = useState<Record<string, CellStyle>>({});
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFormatting, setShowFormatting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (table) {
        setTitle(table.title);
        setDescription(table.description);
        setHeaders(table.headers);
        setRows(table.rows);
        setCellStyles(table.cellStyles || {});
      } else {
        setTitle('');
        setDescription('');
        setHeaders(['Столбец 1', 'Столбец 2', 'Столбец 3']);
        setRows([['', '', ''], ['', '', '']]);
        setCellStyles({});
      }
      setSelectedCells(new Set());
      setSortColumn(null);
    }
  }, [isOpen, table]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      headers,
      rows,
      cellStyles,
    });
    onClose();
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Столбец ${headers.length + 1}`];
    setHeaders(newHeaders);
    setRows(rows.map((row) => [...row, '']));
  };

  const removeColumn = (colIndex: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, i) => i !== colIndex));
    setRows(rows.map((row) => row.filter((_, i) => i !== colIndex)));
    // Remove styles for this column
    const newStyles: Record<string, CellStyle> = {};
    Object.entries(cellStyles).forEach(([key, style]) => {
      const [r, c] = key.split('-').map(Number);
      if (c < colIndex) newStyles[key] = style;
      else if (c > colIndex) newStyles[`${r}-${c - 1}`] = style;
    });
    setCellStyles(newStyles);
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== rowIndex));
    const newStyles: Record<string, CellStyle> = {};
    Object.entries(cellStyles).forEach(([key, style]) => {
      const [r, c] = key.split('-').map(Number);
      if (r < rowIndex) newStyles[key] = style;
      else if (r > rowIndex) newStyles[`${r - 1}-${c}`] = style;
    });
    setCellStyles(newStyles);
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((row) => [...row]);
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const toggleCellSelection = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    const key = `${rowIndex}-${colIndex}`;
    const newSelected = new Set(selectedCells);
    
    if (e.shiftKey && selectedCells.size > 0) {
      // Range selection
      const lastKey = Array.from(selectedCells).pop()!;
      const [lastR, lastC] = lastKey.split('-').map(Number);
      const minR = Math.min(lastR, rowIndex);
      const maxR = Math.max(lastR, rowIndex);
      const minC = Math.min(lastC, colIndex);
      const maxC = Math.max(lastC, colIndex);
      
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          newSelected.add(`${r}-${c}`);
        }
      }
    } else if (e.ctrlKey || e.metaKey) {
      if (newSelected.has(key)) newSelected.delete(key);
      else newSelected.add(key);
    } else {
      newSelected.clear();
      newSelected.add(key);
    }
    
    setSelectedCells(newSelected);
  };

  const applyStyleToSelected = (style: Partial<CellStyle>) => {
    const newStyles = { ...cellStyles };
    selectedCells.forEach((key) => {
      newStyles[key] = { ...newStyles[key], ...style };
    });
    setCellStyles(newStyles);
  };

  const clearStyleFromSelected = () => {
    const newStyles = { ...cellStyles };
    selectedCells.forEach((key) => {
      delete newStyles[key];
    });
    setCellStyles(newStyles);
  };

  const getCellStyle = (rowIndex: number, colIndex: number): React.CSSProperties => {
    const key = `${rowIndex}-${colIndex}`;
    const style = cellStyles[key];
    if (!style) return {};
    
    return {
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      color: style.color || 'inherit',
      backgroundColor: style.background || 'transparent',
      textAlign: style.align || 'left',
    };
  };

  const sortRows = (colIndex: number) => {
    if (sortColumn === colIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colIndex);
      setSortDirection('asc');
    }
    
    const sorted = [...rows].sort((a, b) => {
      const valA = a[colIndex] || '';
      const valB = b[colIndex] || '';
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      
      let comparison = 0;
      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB;
      } else {
        comparison = valA.localeCompare(valB, 'ru');
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setRows(sorted);
  };

  const duplicateRow = (rowIndex: number) => {
    const newRow = [...rows[rowIndex]];
    const newRows = [...rows];
    newRows.splice(rowIndex + 1, 0, newRow);
    setRows(newRows);
  };

  const moveRow = (rowIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? rowIndex - 1 : rowIndex + 1;
    if (newIndex < 0 || newIndex >= rows.length) return;
    
    const newRows = [...rows];
    [newRows[rowIndex], newRows[newIndex]] = [newRows[newIndex], newRows[rowIndex]];
    setRows(newRows);
  };

  if (!isOpen) return null;

  const hasSelection = selectedCells.size > 0;
  const firstSelectedKey = Array.from(selectedCells)[0];
  const firstSelectedStyle = firstSelectedKey ? cellStyles[firstSelectedKey] || {} : {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--full" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {table ? '✏️ Редактировать таблицу' : '📊 Новая таблица'}
          </h2>
          <div className="modal__form">
            <div className="modal__form-row">
              <div className="form-field">
                <label className="form-field__label">Название *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название таблицы"
                  className="form-field__input"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Описание</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание (необязательно)"
                  className="form-field__input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="table-toolbar">
          <button
            className={`table-toolbar__btn ${firstSelectedStyle.bold ? 'table-toolbar__btn--active' : ''}`}
            onClick={() => applyStyleToSelected({ bold: !firstSelectedStyle.bold })}
            disabled={!hasSelection}
            title="Жирный"
          >
            <strong>B</strong>
          </button>
          <button
            className={`table-toolbar__btn ${firstSelectedStyle.italic ? 'table-toolbar__btn--active' : ''}`}
            onClick={() => applyStyleToSelected({ italic: !firstSelectedStyle.italic })}
            disabled={!hasSelection}
            title="Курсив"
          >
            <em>I</em>
          </button>
          <div className="table-toolbar__separator" />
          <button
            className={`table-toolbar__btn ${firstSelectedStyle.align === 'left' ? 'table-toolbar__btn--active' : ''}`}
            onClick={() => applyStyleToSelected({ align: 'left' })}
            disabled={!hasSelection}
            title="По левому краю"
          >
            ≡
          </button>
          <button
            className={`table-toolbar__btn ${firstSelectedStyle.align === 'center' ? 'table-toolbar__btn--active' : ''}`}
            onClick={() => applyStyleToSelected({ align: 'center' })}
            disabled={!hasSelection}
            title="По центру"
          >
            ≡
          </button>
          <button
            className={`table-toolbar__btn ${firstSelectedStyle.align === 'right' ? 'table-toolbar__btn--active' : ''}`}
            onClick={() => applyStyleToSelected({ align: 'right' })}
            disabled={!hasSelection}
            title="По правому краю"
          >
            ≡
          </button>
          <div className="table-toolbar__separator" />
          <label className="table-toolbar__color-picker" title="Цвет текста">
            <input
              type="color"
              value={firstSelectedStyle.color || '#000000'}
              onChange={(e) => applyStyleToSelected({ color: e.target.value })}
              disabled={!hasSelection}
            />
            <span>A</span>
          </label>
          <label className="table-toolbar__color-picker" title="Цвет фона">
            <input
              type="color"
              value={firstSelectedStyle.background || '#ffffff'}
              onChange={(e) => applyStyleToSelected({ background: e.target.value })}
              disabled={!hasSelection}
            />
            <span>🎨</span>
          </label>
          <div className="table-toolbar__separator" />
          <button
            className="table-toolbar__btn"
            onClick={clearStyleFromSelected}
            disabled={!hasSelection}
            title="Очистить форматирование"
          >
            ✕
          </button>
          <div className="table-toolbar__info">
            {hasSelection && `${selectedCells.size} ячеек выбрано`}
          </div>
        </div>

        <div className="modal__body">
          <div className="table-editor">
            <table className="table-editor__table">
              <thead>
                <tr>
                  <th className="table-editor__row-num-header">#</th>
                  {headers.map((header, colIndex) => (
                    <th key={colIndex} className="table-editor__header-cell">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(colIndex, e.target.value)}
                        className="table-editor__header-input"
                        placeholder="Заголовок"
                      />
                      <div className="table-editor__header-actions">
                        <button
                          onClick={() => sortRows(colIndex)}
                          className="table-editor__sort-btn"
                          title="Сортировать"
                        >
                          {sortColumn === colIndex ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                        </button>
                        {headers.length > 1 && (
                          <button
                            onClick={() => removeColumn(colIndex)}
                            className="table-editor__remove-btn"
                            title="Удалить столбец"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="table-editor__action-cell">
                    <button onClick={addColumn} className="table-editor__add-col-btn" title="Добавить столбец">
                      +
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="table-editor__row-num">{rowIndex + 1}</td>
                    {row.map((cell, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const isSelected = selectedCells.has(key);
                      return (
                        <td
                          key={colIndex}
                          className={`table-editor__cell ${isSelected ? 'table-editor__cell--selected' : ''}`}
                          style={getCellStyle(rowIndex, colIndex)}
                          onClick={(e) => toggleCellSelection(rowIndex, colIndex, e)}
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="table-editor__cell-input"
                            placeholder="..."
                          />
                        </td>
                      );
                    })}
                    <td className="table-editor__action-cell">
                      <div className="table-editor__row-actions">
                        <button onClick={() => moveRow(rowIndex, 'up')} disabled={rowIndex === 0} title="Вверх">↑</button>
                        <button onClick={() => moveRow(rowIndex, 'down')} disabled={rowIndex === rows.length - 1} title="Вниз">↓</button>
                        <button onClick={() => duplicateRow(rowIndex)} title="Дублировать">⧉</button>
                        {rows.length > 1 && (
                          <button onClick={() => removeRow(rowIndex)} className="table-editor__remove-row-btn" title="Удалить строку">×</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-editor__footer-actions">
            <button onClick={addRow} className="table-editor__add-row-btn">
              + Добавить строку
            </button>
            <span className="table-editor__stats">
              {rows.length} строк × {headers.length} столбцов
            </span>
          </div>
        </div>

        <div className="modal__footer">
          <button onClick={onClose} className="modal__btn modal__btn--secondary">Отмена</button>
          <button onClick={handleSubmit} className="modal__btn modal__btn--primary">
            {table ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
