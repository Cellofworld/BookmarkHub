import { useState } from 'react';
import { Task, Subtask } from '../types';
import { generateId } from '../utils/dataStorage';

interface TaskManagerProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export default function TaskManager({ tasks, onUpdateTasks }: TaskManagerProps) {
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const stats = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onUpdateTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTask) return;
    const updated = tasks.map((t) =>
      t.id === editingTask.id ? { ...t, ...taskData, updatedAt: Date.now() } : t
    );
    onUpdateTasks(updated);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status, updatedAt: Date.now() } : t
    );
    onUpdateTasks(updated);
  };

  return (
    <div className="task-manager">
      <div className="task-manager__stats">
        <div className="task-stat task-stat--todo">
          <div className="task-stat__count">{stats.todo}</div>
          <div className="task-stat__label">К выполнению</div>
        </div>
        <div className="task-stat task-stat--progress">
          <div className="task-stat__count">{stats.inProgress}</div>
          <div className="task-stat__label">В работе</div>
        </div>
        <div className="task-stat task-stat--done">
          <div className="task-stat__count">{stats.done}</div>
          <div className="task-stat__label">Завершено</div>
        </div>
      </div>

      <div className="task-manager__filters">
        <div className="task-filter-group">
          <span className="task-filter-group__label">Статус:</span>
          <button className={`task-filter-btn ${filter === 'all' ? 'task-filter-btn--active' : ''}`} onClick={() => setFilter('all')}>Все</button>
          <button className={`task-filter-btn ${filter === 'todo' ? 'task-filter-btn--active' : ''}`} onClick={() => setFilter('todo')}>К выполнению</button>
          <button className={`task-filter-btn ${filter === 'in-progress' ? 'task-filter-btn--active' : ''}`} onClick={() => setFilter('in-progress')}>В работе</button>
          <button className={`task-filter-btn ${filter === 'done' ? 'task-filter-btn--active' : ''}`} onClick={() => setFilter('done')}>Завершено</button>
        </div>
        <div className="task-filter-group">
          <span className="task-filter-group__label">Приоритет:</span>
          <button className={`task-filter-btn ${priorityFilter === 'all' ? 'task-filter-btn--active' : ''}`} onClick={() => setPriorityFilter('all')}>Все</button>
          <button className={`task-filter-btn task-filter-btn--urgent ${priorityFilter === 'urgent' ? 'task-filter-btn--active' : ''}`} onClick={() => setPriorityFilter('urgent')}>Срочный</button>
          <button className={`task-filter-btn task-filter-btn--high ${priorityFilter === 'high' ? 'task-filter-btn--active' : ''}`} onClick={() => setPriorityFilter('high')}>Высокий</button>
          <button className={`task-filter-btn task-filter-btn--medium ${priorityFilter === 'medium' ? 'task-filter-btn--active' : ''}`} onClick={() => setPriorityFilter('medium')}>Средний</button>
          <button className={`task-filter-btn task-filter-btn--low ${priorityFilter === 'low' ? 'task-filter-btn--active' : ''}`} onClick={() => setPriorityFilter('low')}>Низкий</button>
        </div>
        <button className="task-manager__add-btn" onClick={() => setShowAddModal(true)}>
          + Новая задача
        </button>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📝</div>
            <h3 className="empty-state__title">Нет задач</h3>
            <p className="empty-state__description">Создайте первую задачу, нажав кнопку "Новая задача"</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => handleDeleteTask(task.id)}
              onStatusChange={(status) => handleStatusChange(task.id, status)}
            />
          ))
        )}
      </div>

      {showAddModal && (
        <TaskModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTask}
        />
      )}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Task['status']) => void;
}) {
  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    urgent: 'Срочный',
  };

  const statusLabels = {
    todo: 'К выполнению',
    'in-progress': 'В работе',
    done: 'Завершено',
  };

  const completedSubtasks = task.subtasks.filter((s) => s.done).length;
  const totalSubtasks = task.subtasks.length;

  const formatDate = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== 'done';

  return (
    <div className={`task-card task-card--${task.priority} ${task.status === 'done' ? 'task-card--done' : ''}`}>
      <div className="task-card__header">
        <div className="task-card__priority-badge">
          {priorityLabels[task.priority]}
        </div>
        <div className="task-card__actions">
          <button className="task-card__action" onClick={onEdit} title="Редактировать">✏️</button>
          <button className="task-card__action" onClick={onDelete} title="Удалить">🗑️</button>
        </div>
      </div>

      <h3 className={`task-card__title ${task.status === 'done' ? 'task-card__title--done' : ''}`}>
        {task.title}
      </h3>

      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}

      {totalSubtasks > 0 && (
        <div className="task-card__progress">
          <div className="task-card__progress-bar">
            <div
              className="task-card__progress-fill"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
          <span className="task-card__progress-text">
            {completedSubtasks}/{totalSubtasks} подзадач
          </span>
        </div>
      )}

      <div className="task-card__meta">
        <select
          className="task-card__status-select"
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as Task['status'])}
        >
          <option value="todo">{statusLabels.todo}</option>
          <option value="in-progress">{statusLabels['in-progress']}</option>
          <option value="done">{statusLabels.done}</option>
        </select>

        {task.dueDate && (
          <span className={`task-card__due ${isOverdue ? 'task-card__due--overdue' : ''}`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}

        {task.tags.length > 0 && (
          <div className="task-card__tags">
            {task.tags.map((tag) => (
              <span key={tag} className="task-card__tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task?: Task;
  onClose: () => void;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<Task['status']>(task?.status || 'todo');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [tags, setTags] = useState(task?.tags.join(', ') || '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      subtasks,
    });
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: generateId(), title: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{task ? '✏️ Редактировать задачу' : '✨ Новая задача'}</h2>
          <form onSubmit={handleSubmit} className="modal__form">
            <div className="form-field">
              <label className="form-field__label">Название *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Что нужно сделать?"
                className="form-field__input"
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-field__label">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Детали задачи..."
                rows={3}
                className="form-field__textarea"
              />
            </div>
            <div className="modal__form-row">
              <div className="form-field">
                <label className="form-field__label">Статус</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])} className="form-field__select">
                  <option value="todo">К выполнению</option>
                  <option value="in-progress">В работе</option>
                  <option value="done">Завершено</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-field__label">Приоритет</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="form-field__select">
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </select>
              </div>
            </div>
            <div className="modal__form-row">
              <div className="form-field">
                <label className="form-field__label">Дедлайн</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-field__input"
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Теги (через запятую)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="работа, срочно"
                  className="form-field__input"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="modal__body">
          <div className="subtasks-section">
            <h3 className="subtasks-section__title">Подзадачи</h3>
            <div className="subtasks-list">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="subtask-item">
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={() => toggleSubtask(subtask.id)}
                    className="subtask-item__checkbox"
                  />
                  <span className={`subtask-item__title ${subtask.done ? 'subtask-item__title--done' : ''}`}>
                    {subtask.title}
                  </span>
                  <button className="subtask-item__remove" onClick={() => removeSubtask(subtask.id)}>×</button>
                </div>
              ))}
            </div>
            <div className="subtask-add">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                placeholder="Добавить подзадачу..."
                className="form-field__input"
              />
              <button className="subtask-add__btn" onClick={addSubtask}>+</button>
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button className="modal__btn modal__btn--secondary" onClick={onClose}>Отмена</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit}>
            {task ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
