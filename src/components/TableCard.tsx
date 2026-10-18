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

  const hasData = table.rows.some(row => row.some(cell => cell.trim() !== ''));

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white text-lg">📊</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {table.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {table.headers.length} столбцов · {table.rows.length} строк
            </p>
          </div>
        </div>
      </div>

      {table.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {table.description}
        </p>
      )}

      {/* Preview */}
      {hasData && (
        <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                {table.headers.slice(0, 3).map((header, i) => (
                  <th key={i} className="px-2 py-1.5 text-left font-medium text-gray-700 dark:text-gray-300 truncate">
                    {header}
                  </th>
                ))}
                {table.headers.length > 3 && (
                  <th className="px-2 py-1.5 text-center text-gray-400">...</th>
                )}
              </tr>
            </thead>
            <tbody>
              {table.rows.slice(0, 2).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-100 dark:border-gray-700">
                  {row.slice(0, 3).map((cell, colIndex) => (
                    <td key={colIndex} className="px-2 py-1.5 text-gray-600 dark:text-gray-400 truncate">
                      {cell || <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                  ))}
                  {row.length > 3 && (
                    <td className="px-2 py-1.5 text-center text-gray-400">...</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatDate(table.updatedAt)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onView(table)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            title="Просмотр"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(table)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            title="Редактировать"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(table.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
            title="Удалить"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
