import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadData, nowIso, saveData, writeClipboard } from "../api/data";
import type { AppData, Category, Snippet, SnippetDraft } from "../types";

interface AppContextValue {
  loading: boolean;
  categories: Category[];
  snippets: Snippet[];
  selectedCategoryId: string | null;
  highlightedSnippetId: string | null;
  searchQuery: string;
  toast: string | null;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  selectCategory: (id: string) => void;
  highlightSnippet: (id: string | null) => void;
  showToast: (message: string) => void;
  addCategory: (name: string) => string | null;
  renameCategory: (id: string, name: string) => string | null;
  deleteCategory: (id: string) => string | null;
  addSnippet: (draft: SnippetDraft) => string | null;
  updateSnippet: (id: string, draft: SnippetDraft) => string | null;
  deleteSnippet: (id: string) => void;
  copySnippet: (id: string) => Promise<void>;
  filteredSnippets: Snippet[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData>({ categories: [], snippets: [] });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [highlightedSnippetId, setHighlightedSnippetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const persist = useCallback(async (next: AppData) => {
    setData(next);
    await saveData(next);
  }, []);

  useEffect(() => {
    loadData()
      .then((loaded) => {
        setData(loaded);
        const first = loaded.categories.sort((a, b) => a.sortOrder - b.sortOrder)[0];
        setSelectedCategoryId(first?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }, []);

  const selectCategory = useCallback((id: string) => {
    setSelectedCategoryId(id);
    setHighlightedSnippetId(null);
    setSearchQuery("");
  }, []);

  const filteredSnippets = useMemo(() => {
    if (!selectedCategoryId) return [];
    const query = searchQuery.trim().toLowerCase();
    return data.snippets
      .filter((s) => s.categoryId === selectedCategoryId)
      .filter((s) => !query || s.title.toLowerCase().includes(query))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data.snippets, searchQuery, selectedCategoryId]);

  const addCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return "分类名称不能为空";
      if (data.categories.some((c) => c.name === trimmed)) return "分类名称已存在";

      const category: Category = {
        id: crypto.randomUUID(),
        name: trimmed,
        sortOrder: data.categories.length,
      };
      void persist({ ...data, categories: [...data.categories, category] });
      return null;
    },
    [data, persist],
  );

  const renameCategory = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return "分类名称不能为空";
      if (data.categories.some((c) => c.id !== id && c.name === trimmed)) {
        return "分类名称已存在";
      }
      void persist({
        ...data,
        categories: data.categories.map((c) =>
          c.id === id ? { ...c, name: trimmed } : c,
        ),
      });
      return null;
    },
    [data, persist],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      if (data.categories.length <= 1) return "至少保留一个分类";
      void persist({
        categories: data.categories.filter((c) => c.id !== id),
        snippets: data.snippets.filter((s) => s.categoryId !== id),
      });
      if (selectedCategoryId === id) {
        const next = data.categories.find((c) => c.id !== id);
        setSelectedCategoryId(next?.id ?? null);
      }
      return null;
    },
    [data, persist, selectedCategoryId],
  );

  const addSnippet = useCallback(
    (draft: SnippetDraft) => {
      const title = draft.title.trim();
      if (!title) return "标题不能为空";
      if (!selectedCategoryId) return "请先选择分类";

      const now = nowIso();
      const snippet: Snippet = {
        id: crypto.randomUUID(),
        categoryId: selectedCategoryId,
        title,
        content: draft.content,
        createdAt: now,
        updatedAt: now,
      };
      void persist({ ...data, snippets: [...data.snippets, snippet] });
      return null;
    },
    [data, persist, selectedCategoryId],
  );

  const updateSnippet = useCallback(
    (id: string, draft: SnippetDraft) => {
      const title = draft.title.trim();
      if (!title) return "标题不能为空";
      void persist({
        ...data,
        snippets: data.snippets.map((s) =>
          s.id === id
            ? { ...s, title, content: draft.content, updatedAt: nowIso() }
            : s,
        ),
      });
      return null;
    },
    [data, persist],
  );

  const deleteSnippet = useCallback(
    (id: string) => {
      void persist({ ...data, snippets: data.snippets.filter((s) => s.id !== id) });
      if (highlightedSnippetId === id) setHighlightedSnippetId(null);
    },
    [data, persist, highlightedSnippetId],
  );

  const copySnippet = useCallback(
    async (id: string) => {
      const snippet = data.snippets.find((s) => s.id === id);
      if (!snippet) return;
      await writeClipboard(snippet.content);
      showToast("已复制");
    },
    [data.snippets, showToast],
  );

  const value: AppContextValue = {
    loading,
    categories: [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    snippets: data.snippets,
    selectedCategoryId,
    highlightedSnippetId,
    searchQuery,
    toast,
    dialogOpen,
    setDialogOpen,
    setSearchQuery,
    selectCategory,
    highlightSnippet: setHighlightedSnippetId,
    showToast,
    addCategory,
    renameCategory,
    deleteCategory,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    copySnippet,
    filteredSnippets,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
