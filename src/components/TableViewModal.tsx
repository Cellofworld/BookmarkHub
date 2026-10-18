import { Table } from '../types';

interface TableViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onEdit: (table: Table) => void;
}

export default function TableViewModal({ isOpen, onClose, table, onEdit }: TableViewModalProps) {
  if (!isOpen || !table) return null;

  const hasData = table.rows.some(row => row.some(cell => cell.trim() !== ''));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📊</span>
                {table.title}
              </h2>
              {table.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {table.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onEdit(table);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-indigo-500/25"
              >
                Редактировать
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {hasData ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    {table.headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                        >
                          {cell || <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
                <span className="text-4xl">📭</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Таблица пуста
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Добавьте данные, нажав кнопку "Редактировать"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
