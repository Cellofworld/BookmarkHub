import { useState, useEffect } from 'react';
import { Table } from '../types';

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
  const [rows, setRows] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
  ]);

  useEffect(() => {
    if (isOpen) {
      if (table) {
        setTitle(table.title);
        setDescription(table.description);
        setHeaders(table.headers);
        setRows(table.rows);
      } else {
        setTitle('');
        setDescription('');
        setHeaders(['Столбец 1', 'Столбец 2', 'Столбец 3']);
        setRows([
          ['', '', ''],
          ['', '', ''],
        ]);
      }
    }
  }, [isOpen, table]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      headers,
      rows,
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
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    setHeaders(newHeaders);
    setRows(rows.map((row) => row.filter((_, i) => i !== colIndex)));
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== rowIndex));
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--full" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {table ? '✏️ Редактировать таблицу' : '📊 Новая таблица'}
          </h2>
          <form onSubmit={handleSubmit} className="modal__form">
            <div className="modal__form-row">
              <div className="form-field">
                <label className="form-field__label">Название *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Расписание"
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
                  placeholder="Необязательное описание..."
                  className="form-field__input"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="modal__body">
          <div className="table-editor">
            <table className="table-editor__table">
              <thead>
                <tr>
                  {headers.map((header, colIndex) => (
                    <th key={colIndex}>
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(colIndex, e.target.value)}
                        className="table-editor__header-input"
                        placeholder="Заголовок"
                      />
                      {headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(colIndex)}
                          className="table-editor__remove-btn"
                          title="Удалить столбец"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </th>
                  ))}
                  <th className="table-editor__action-cell">
                    <button
                      type="button"
                      onClick={addColumn}
                      className="table-editor__add-col-btn"
                      title="Добавить столбец"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className="table-editor__cell-input"
                          placeholder="Ячейка"
                        />
                      </td>
                    ))}
                    <td className="table-editor__action-cell">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(rowIndex)}
                          className="table-editor__remove-row-btn"
                          title="Удалить строку"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addRow}
            className="table-editor__add-row-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить строку
          </button>
        </div>

        <div className="modal__footer">
          <button type="button" onClick={onClose} className="modal__btn modal__btn--secondary">
            Отмена
          </button>
          <button type="button" onClick={handleSubmit} className="modal__btn modal__btn--primary">
            {table ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
