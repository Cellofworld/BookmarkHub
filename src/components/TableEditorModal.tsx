import { useState, useEffect, useRef, useCallback } from 'react';
import { Table, CellStyle, TableColumn } from '../types';
import { generateId } from '../utils/dataStorage';

interface TableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => void;
  table?: Table | null;
}

// Formula evaluator
function evaluateFormula(formula: string, rows: string[][], currentRow: number, currentCol: number): string {
  if (!formula.startsWith('=')) return formula;
  
  const expr = formula.substring(1).toUpperCase();
  
  // Helper to get cell value
  const getCellValue = (ref: string): number => {
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) return 0;
    const colLetter = match[1];
    const rowNum = parseInt(match[2]) - 1;
    const colIndex = colLetterToIndex(colLetter);
    if (rowNum < 0 || rowNum >= rows.length || colIndex < 0 || colIndex >= (rows[0]?.length || 0)) return 0;
    const val = parseFloat(rows[rowNum][colIndex]);
    return isNaN(val) ? 0 : val;
  };
  
  // Parse range like A1:A5
  const getRangeValues = (range: string): number[] => {
    const parts = range.split(':');
    if (parts.length !== 2) return [getCellValue(range)];
    
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
    // SUM function
    const sumMatch = expr.match(/SUM\(([^)]+)\)/);
    if (sumMatch) {
      const values = getRangeValues(sumMatch[1]);
      return values.reduce((a, b) => a + b, 0).toString();
    }
    
    // AVG/AVERAGE function
    const avgMatch = expr.match(/(?:AVG|AVERAGE)\(([^)]+)\)/);
    if (avgMatch) {
      const values = getRangeValues(avgMatch[1]);
      if (values.length === 0) return '0';
      return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    }
    
    // MIN function
    const minMatch = expr.match(/MIN\(([^)]+)\)/);
    if (minMatch) {
      const values = getRangeValues(minMatch[1]);
      return values.length > 0 ? Math.min(...values).toString() : '0';
    }
    
    // MAX function
    const maxMatch = expr.match(/MAX\(([^)]+)\)/);
    if (maxMatch) {
      const values = getRangeValues(maxMatch[1]);
      return values.length > 0 ? Math.max(...values).toString() : '0';
    }
    
    // COUNT function
    const countMatch = expr.match(/COUNT\(([^)]+)\)/);
    if (countMatch) {
      const values = getRangeValues(countMatch[1]);
      return values.length.toString();
    }
    
    // Simple arithmetic
    const result = eval(expr.replace(/([A-Z]+\d+)/g, (match) => getCellValue(match).toString()));
    return isNaN(result) ? '#ERROR' : result.toString();
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

function indexToColLetter(index: number): string {
  let result = '';
  let n = index + 1;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

export default function TableEditorModal({ isOpen, onClose, onSave, table }: TableEditorModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [headers, setHeaders] = useState<string[]>(['Столбец 1', 'Столбец 2', 'Столбец 3']);
  const [rows, setRows] = useState<string[][]>([['', '', ''], ['', '', '']]);
  const [cellStyles, setCellStyles] = useState<Record<string, CellStyle>>({});
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [formulaBar, setFormulaBar] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cell: string } | null>(null);
  const [fillHandle, setFillHandle] = useState<{ startCell: string; endCell: string } | null>(null);
  const [clipboard, setClipboard] = useState<string[][]>([]);
  const [columnTypes, setColumnTypes] = useState<('text' | 'number' | 'date' | 'checkbox')[]>([]);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (table) {
        setTitle(table.title);
        setDescription(table.description);
        setHeaders(table.headers);
        setRows(table.rows.map(row => [...row]));
        setCellStyles(table.cellStyles || {});
        const types = table.columns?.map(c => c.type === 'formula' ? 'text' : c.type) || table.headers.map(() => 'text' as const);
        setColumnTypes(types);
      } else {
        setTitle('');
        setDescription('');
        setHeaders(['Столбец 1', 'Столбец 2', 'Столбец 3']);
        setRows([['', '', ''], ['', '', '']]);
        setCellStyles({});
        setColumnTypes(['text', 'text', 'text']);
      }
      setSelectedCells(new Set());
      setActiveCell(null);
      setEditingCell(null);
      setContextMenu(null);
    }
  }, [isOpen, table]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Ctrl+C - Copy
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copySelectedCells();
      }
      
      // Ctrl+V - Paste
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteFromClipboard();
      }
      
      // Ctrl+X - Cut
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        copySelectedCells();
        deleteSelectedCells();
      }
      
      // Delete
      if (e.key === 'Delete' && !editingCell) {
        e.preventDefault();
        deleteSelectedCells();
      }
      
      // Escape
      if (e.key === 'Escape') {
        setEditingCell(null);
        setContextMenu(null);
      }
      
      // Enter - confirm edit
      if (e.key === 'Enter' && editingCell) {
        e.preventDefault();
        confirmEdit();
        moveSelection('down');
      }
      
      // Tab - next cell
      if (e.key === 'Tab' && !editingCell) {
        e.preventDefault();
        moveSelection(e.shiftKey ? 'left' : 'right');
      }
      
      // Arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !editingCell) {
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        moveSelection(dir);
      }
      
      // F2 - edit cell
      if (e.key === 'F2' && activeCell && !editingCell) {
        e.preventDefault();
        startEditing(activeCell);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, editingCell, activeCell, selectedCells, rows]);

  const getCellValue = (rowIndex: number, colIndex: number): string => {
    const key = `${rowIndex}-${colIndex}`;
    const style = cellStyles[key];
    if (style?.formula) {
      return evaluateFormula(style.formula, rows, rowIndex, colIndex);
    }
    return rows[rowIndex]?.[colIndex] || '';
  };

  const startEditing = (cellKey: string) => {
    setEditingCell(cellKey);
    const [r, c] = cellKey.split('-').map(Number);
    const value = rows[r]?.[c] || '';
    setEditValue(value);
    setFormulaBar(cellStyles[cellKey]?.formula || value);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const confirmEdit = () => {
    if (!editingCell) return;
    const [r, c] = editingCell.split('-').map(Number);
    const newRows = rows.map(row => [...row]);
    newRows[r][c] = editValue;
    setRows(newRows);
    
    // Check if it's a formula
    if (editValue.startsWith('=')) {
      const newStyles = { ...cellStyles };
      newStyles[editingCell] = { ...newStyles[editingCell], formula: editValue };
      setCellStyles(newStyles);
    }
    
    setEditingCell(null);
  };

  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!activeCell) {
      setActiveCell('0-0');
      setSelectedCells(new Set(['0-0']));
      return;
    }
    
    const [r, c] = activeCell.split('-').map(Number);
    let newR = r, newC = c;
    
    switch (direction) {
      case 'up': newR = Math.max(0, r - 1); break;
      case 'down': newR = Math.min(rows.length - 1, r + 1); break;
      case 'left': newC = Math.max(0, c - 1); break;
      case 'right': newC = Math.min(headers.length - 1, c + 1); break;
    }
    
    const newCell = `${newR}-${newC}`;
    setActiveCell(newCell);
    setSelectedCells(new Set([newCell]));
  };

  const copySelectedCells = () => {
    const selected = Array.from(selectedCells);
    if (selected.length === 0) return;
    
    const coords = selected.map(s => s.split('-').map(Number));
    const minR = Math.min(...coords.map(c => c[0]));
    const maxR = Math.max(...coords.map(c => c[0]));
    const minC = Math.min(...coords.map(c => c[1]));
    const maxC = Math.max(...coords.map(c => c[1]));
    
    const data: string[][] = [];
    for (let r = minR; r <= maxR; r++) {
      const row: string[] = [];
      for (let c = minC; c <= maxC; c++) {
        row.push(rows[r]?.[c] || '');
      }
      data.push(row);
    }
    setClipboard(data);
    
    // Copy to system clipboard
    const text = data.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
  };

  const pasteFromClipboard = async () => {
    if (!activeCell) return;
    
    let text = '';
    try {
      text = await navigator.clipboard.readText();
    } catch {
      if (clipboard.length === 0) return;
      text = clipboard.map(row => row.join('\t')).join('\n');
    }
    
    const [startR, startC] = activeCell.split('-').map(Number);
    const pasteData = text.split('\n').map(line => line.split('\t'));
    
    const newRows = rows.map(row => [...row]);
    pasteData.forEach((pasteRow, r) => {
      pasteRow.forEach((value, c) => {
        const targetR = startR + r;
        const targetC = startC + c;
        if (targetR < rows.length && targetC < headers.length) {
          newRows[targetR][targetC] = value;
        }
      });
    });
    setRows(newRows);
  };

  const deleteSelectedCells = () => {
    const newRows = rows.map(row => [...row]);
    selectedCells.forEach(key => {
      const [r, c] = key.split('-').map(Number);
      newRows[r][c] = '';
    });
    setRows(newRows);
    
    const newStyles = { ...cellStyles };
    selectedCells.forEach(key => {
      if (newStyles[key]) {
        delete newStyles[key].formula;
      }
    });
    setCellStyles(newStyles);
  };

  const handleCellClick = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    const key = `${rowIndex}-${colIndex}`;
    
    if (e.shiftKey && activeCell) {
      // Range selection
      const [startR, startC] = activeCell.split('-').map(Number);
      const newSelected = new Set<string>();
      const minR = Math.min(startR, rowIndex);
      const maxR = Math.max(startR, rowIndex);
      const minC = Math.min(startC, colIndex);
      const maxC = Math.max(startC, colIndex);
      
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          newSelected.add(`${r}-${c}`);
        }
      }
      setSelectedCells(newSelected);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const newSelected = new Set(selectedCells);
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      setSelectedCells(newSelected);
    } else {
      setActiveCell(key);
      setSelectedCells(new Set([key]));
      setFormulaBar(cellStyles[key]?.formula || rows[rowIndex]?.[colIndex] || '');
    }
  };

  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    startEditing(`${rowIndex}-${colIndex}`);
  };

  const handleContextMenu = (e: React.MouseEvent, cellKey: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, cell: cellKey });
  };

  const applyStyle = (style: Partial<CellStyle>) => {
    const newStyles = { ...cellStyles };
    selectedCells.forEach(key => {
      newStyles[key] = { ...newStyles[key], ...style };
    });
    setCellStyles(newStyles);
  };

  const toggleBold = () => {
    if (!activeCell) return;
    const current = cellStyles[activeCell]?.bold || false;
    applyStyle({ bold: !current });
  };

  const toggleItalic = () => {
    if (!activeCell) return;
    const current = cellStyles[activeCell]?.italic || false;
    applyStyle({ italic: !current });
  };

  const addColumn = () => {
    setHeaders([...headers, `Столбец ${headers.length + 1}`]);
    setRows(rows.map(row => [...row, '']));
    setColumnTypes([...columnTypes, 'text']);
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill('')]);
  };

  const deleteColumn = (colIndex: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, i) => i !== colIndex));
    setRows(rows.map(row => row.filter((_, i) => i !== colIndex)));
    setColumnTypes(columnTypes.filter((_, i) => i !== colIndex));
    
    const newStyles: Record<string, CellStyle> = {};
    Object.entries(cellStyles).forEach(([key, style]) => {
      const [r, c] = key.split('-').map(Number);
      if (c < colIndex) newStyles[key] = style;
      else if (c > colIndex) newStyles[`${r}-${c - 1}`] = style;
    });
    setCellStyles(newStyles);
  };

  const deleteRow = (rowIndex: number) => {
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

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      headers,
      rows,
      cellStyles,
      columns: headers.map((h, i) => ({
        id: generateId(),
        header: h,
        type: columnTypes[i] || 'text',
      })),
    });
    onClose();
  };

  if (!isOpen) return null;

  const activeCellStyle = activeCell ? cellStyles[activeCell] : null;

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

        {/* Formula Bar */}
        <div className="excel-formula-bar">
          <div className="excel-cell-ref">
            {activeCell ? `${indexToColLetter(parseInt(activeCell.split('-')[1]))}${parseInt(activeCell.split('-')[0]) + 1}` : ''}
          </div>
          <span className="excel-formula-label">fx</span>
          <input
            type="text"
            value={formulaBar}
            onChange={(e) => {
              setFormulaBar(e.target.value);
              if (editingCell) setEditValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (editingCell) confirmEdit();
                else if (activeCell) {
                  const [r, c] = activeCell.split('-').map(Number);
                  const newRows = rows.map(row => [...row]);
                  newRows[r][c] = formulaBar;
                  setRows(newRows);
                  if (formulaBar.startsWith('=')) {
                    const newStyles = { ...cellStyles };
                    newStyles[activeCell] = { ...newStyles[activeCell], formula: formulaBar };
                    setCellStyles(newStyles);
                  }
                }
              }
            }}
            className="excel-formula-input"
            placeholder="Введите значение или формулу (=SUM(A1:A5))"
          />
        </div>

        {/* Toolbar */}
        <div className="excel-toolbar">
          <div className="excel-toolbar__group">
            <button
              className={`excel-toolbar__btn ${activeCellStyle?.bold ? 'excel-toolbar__btn--active' : ''}`}
              onClick={toggleBold}
              title="Жирный (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              className={`excel-toolbar__btn ${activeCellStyle?.italic ? 'excel-toolbar__btn--active' : ''}`}
              onClick={toggleItalic}
              title="Курсив (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              className={`excel-toolbar__btn ${activeCellStyle?.align === 'left' ? 'excel-toolbar__btn--active' : ''}`}
              onClick={() => applyStyle({ align: 'left' })}
              title="По левому краю"
            >
              ≡
            </button>
            <button
              className={`excel-toolbar__btn ${activeCellStyle?.align === 'center' ? 'excel-toolbar__btn--active' : ''}`}
              onClick={() => applyStyle({ align: 'center' })}
              title="По центру"
            >
              ≡
            </button>
            <button
              className={`excel-toolbar__btn ${activeCellStyle?.align === 'right' ? 'excel-toolbar__btn--active' : ''}`}
              onClick={() => applyStyle({ align: 'right' })}
              title="По правому краю"
            >
              ≡
            </button>
          </div>

          <div className="excel-toolbar__separator" />

          <div className="excel-toolbar__group">
            <label className="excel-toolbar__color" title="Цвет текста">
              <input
                type="color"
                value={activeCellStyle?.color || '#000000'}
                onChange={(e) => applyStyle({ color: e.target.value })}
              />
              <span>A</span>
            </label>
            <label className="excel-toolbar__color" title="Цвет фона">
              <input
                type="color"
                value={activeCellStyle?.background || '#ffffff'}
                onChange={(e) => applyStyle({ background: e.target.value })}
              />
              <span>🎨</span>
            </label>
          </div>

          <div className="excel-toolbar__separator" />

          <div className="excel-toolbar__group">
            <button className="excel-toolbar__btn" onClick={copySelectedCells} title="Копировать (Ctrl+C)">
              📋
            </button>
            <button className="excel-toolbar__btn" onClick={pasteFromClipboard} title="Вставить (Ctrl+V)">
              📄
            </button>
            <button className="excel-toolbar__btn" onClick={deleteSelectedCells} title="Удалить (Delete)">
              🗑️
            </button>
          </div>

          <div className="excel-toolbar__separator" />

          <div className="excel-toolbar__group">
            <button className="excel-toolbar__btn" onClick={addColumn} title="Добавить столбец">
              +К
            </button>
            <button className="excel-toolbar__btn" onClick={addRow} title="Добавить строку">
              +С
            </button>
          </div>

          <div className="excel-toolbar__info">
            {selectedCells.size > 1 && `${selectedCells.size} ячеек`}
          </div>
        </div>

        {/* Table */}
        <div className="modal__body" style={{ padding: 0 }}>
          <div className="excel-table-wrapper" ref={tableRef}>
            <table className="excel-table">
              <thead>
                <tr>
                  <th className="excel-row-header">#</th>
                  {headers.map((header, colIndex) => (
                    <th key={colIndex} className="excel-col-header" onContextMenu={(e) => handleContextMenu(e, `h-${colIndex}`)}>
                      <div className="excel-col-header__content">
                        <span className="excel-col-letter">{indexToColLetter(colIndex)}</span>
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => {
                            const newHeaders = [...headers];
                            newHeaders[colIndex] = e.target.value;
                            setHeaders(newHeaders);
                          }}
                          className="excel-col-header__input"
                          placeholder="Заголовок"
                        />
                        <select
                          value={columnTypes[colIndex] || 'text'}
                          onChange={(e) => {
                            const newTypes = [...columnTypes];
                            newTypes[colIndex] = e.target.value as any;
                            setColumnTypes(newTypes);
                          }}
                          className="excel-col-type"
                          title="Тип колонки"
                        >
                          <option value="text">Т</option>
                          <option value="number">123</option>
                          <option value="date">📅</option>
                          <option value="checkbox">☑</option>
                        </select>
                      </div>
                      {headers.length > 1 && (
                        <button
                          className="excel-col-delete"
                          onClick={() => deleteColumn(colIndex)}
                          title="Удалить столбец"
                        >
                          ×
                        </button>
                      )}
                    </th>
                  ))}
                  <th className="excel-action-header">
                    <button onClick={addColumn} className="excel-add-btn" title="Добавить столбец">+</button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="excel-row-header" onContextMenu={(e) => handleContextMenu(e, `r-${rowIndex}`)}>
                      {rowIndex + 1}
                      {rows.length > 1 && (
                        <button
                          className="excel-row-delete"
                          onClick={() => deleteRow(rowIndex)}
                          title="Удалить строку"
                        >
                          ×
                        </button>
                      )}
                    </td>
                    {row.map((cell, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const isSelected = selectedCells.has(key);
                      const isActive = activeCell === key;
                      const isEditing = editingCell === key;
                      const displayValue = getCellValue(rowIndex, colIndex);
                      const hasFormula = cellStyles[key]?.formula;
                      
                      return (
                        <td
                          key={colIndex}
                          className={`excel-cell ${isSelected ? 'excel-cell--selected' : ''} ${isActive ? 'excel-cell--active' : ''} ${hasFormula ? 'excel-cell--formula' : ''}`}
                          style={getCellStyle(rowIndex, colIndex)}
                          onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                          onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                          onContextMenu={(e) => handleContextMenu(e, key)}
                        >
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => {
                                setEditValue(e.target.value);
                                setFormulaBar(e.target.value);
                              }}
                              onBlur={confirmEdit}
                              className="excel-cell-input"
                            />
                          ) : (
                            <span className="excel-cell-value">
                              {columnTypes[colIndex] === 'checkbox' ? (
                                <input type="checkbox" checked={cell === 'true'} readOnly />
                              ) : (
                                displayValue || <span className="excel-cell-empty"></span>
                              )}
                            </span>
                          )}
                          {isActive && !isEditing && (
                            <div className="excel-fill-handle" />
                          )}
                        </td>
                      );
                    })}
                    <td className="excel-action-cell">
                      <button onClick={addRow} className="excel-add-btn" title="Добавить строку">+</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Bar */}
        <div className="excel-status-bar">
          <span>Строк: {rows.length} | Столбцов: {headers.length}</span>
          <span>Выделено: {selectedCells.size} ячеек</span>
          {selectedCells.size > 0 && (() => {
            const values = Array.from(selectedCells).map(key => {
              const [r, c] = key.split('-').map(Number);
              return parseFloat(rows[r]?.[c] || '');
            }).filter(v => !isNaN(v));
            if (values.length > 0) {
              const sum = values.reduce((a, b) => a + b, 0);
              const avg = sum / values.length;
              return <span>Сумма: {sum.toFixed(2)} | Среднее: {avg.toFixed(2)} | Мин: {Math.min(...values)} | Макс: {Math.max(...values)}</span>;
            }
            return null;
          })()}
        </div>

        <div className="modal__footer">
          <button onClick={onClose} className="modal__btn modal__btn--secondary">Отмена</button>
          <button onClick={handleSubmit} className="modal__btn modal__btn--primary">
            {table ? 'Сохранить' : 'Создать'}
          </button>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="excel-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={() => setContextMenu(null)}
          >
            <button onClick={copySelectedCells}>📋 Копировать</button>
            <button onClick={pasteFromClipboard}>📄 Вставить</button>
            <button onClick={deleteSelectedCells}>🗑️ Удалить содержимое</button>
            <div className="excel-context-menu__separator" />
            <button onClick={toggleBold}>Жирный</button>
            <button onClick={toggleItalic}>Курсив</button>
            <div className="excel-context-menu__separator" />
            {contextMenu.cell.startsWith('r-') && (
              <button onClick={() => deleteRow(parseInt(contextMenu.cell.split('-')[1]))}>Удалить строку</button>
            )}
            {contextMenu.cell.startsWith('h-') && (
              <button onClick={() => deleteColumn(parseInt(contextMenu.cell.split('-')[1]))}>Удалить столбец</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
