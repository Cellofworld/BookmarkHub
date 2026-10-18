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

export interface Table {
  id: string;
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
  createdAt: number;
  updatedAt: number;
}
