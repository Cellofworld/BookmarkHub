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
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (colIndex: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    setHeaders(newHeaders);
    setRows(rows.map(row => row.filter((_, i) => i !== colIndex)));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {table ? '✏️ Редактировать таблицу' : '📊 Новая таблица'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Расписание"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Описание
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Необязательное описание..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {headers.map((header, colIndex) => (
                    <th key={colIndex} className="relative p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(colIndex, e.target.value)}
                        className="w-full px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:bg-white dark:focus:bg-gray-600 rounded"
                        placeholder="Заголовок"
                      />
                      {headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(colIndex)}
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all opacity-0 hover:opacity-100"
                          title="Удалить столбец"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </th>
                  ))}
                  <th className="w-10 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={addColumn}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all"
                      title="Добавить столбец"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <td key={colIndex} className="p-2 border border-gray-200 dark:border-gray-600">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className="w-full px-2 py-1 text-sm text-gray-900 dark:text-white bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-700 rounded"
                          placeholder="Ячейка"
                        />
                      </td>
                    ))}
                    <td className="w-10 p-2 border border-gray-200 dark:border-gray-600">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(rowIndex)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                          title="Удалить строку"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить строку
          </button>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-500/25"
          >
            {table ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
