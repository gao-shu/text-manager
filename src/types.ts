export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Snippet {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  categories: Category[];
  snippets: Snippet[];
}

export interface SnippetDraft {
  title: string;
  content: string;
}

export interface CategoryDraft {
  name: string;
}
