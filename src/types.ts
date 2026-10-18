export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  categoryId: string;
  favicon: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  background?: string;
  align?: 'left' | 'center' | 'right';
}

export interface Table {
  id: string;
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
  cellStyles?: Record<string, CellStyle>;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: number;
  tags: string[];
  subtasks: Subtask[];
  createdAt: number;
  updatedAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface AppData {
  categories: Category[];
  bookmarks: Bookmark[];
  tables: Table[];
  tasks: Task[];
}
