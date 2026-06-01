import { useApp } from "../context/AppContext";
import type { Snippet } from "../types";
import { IconCopy, IconEdit, IconTrash } from "./Icons";

interface SnippetCardProps {
  snippet: Snippet;
  highlighted: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SnippetCard({ snippet, highlighted, onEdit, onDelete }: SnippetCardProps) {
  const { highlightSnippet, copySnippet } = useApp();

  return (
    <article
      className={`group flex items-start gap-1.5 rounded border bg-white px-2 py-1.5 transition ${
        highlighted ? "border-blue-400 bg-blue-50/40" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => highlightSnippet(snippet.id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        highlightSnippet(snippet.id);
        onEdit();
      }}
    >
      <p className="line-clamp-2 min-w-0 flex-1 whitespace-pre-wrap text-xs leading-snug text-gray-700">
        {snippet.content || "（无内容）"}
      </p>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          title="复制"
          className="rounded p-1 text-gray-600 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            void copySnippet(snippet.id);
          }}
        >
          <IconCopy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="编辑"
          className="rounded p-1 text-blue-600 hover:bg-blue-100/80"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <IconEdit className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="删除"
          className="rounded p-1 text-red-500 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <IconTrash className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

interface SnippetListProps {
  onEdit: (snippet: Snippet) => void;
  onCreate: () => void;
  onDeleteRequest: (snippet: Snippet) => void;
}

export function SnippetList({ onEdit, onCreate, onDeleteRequest }: SnippetListProps) {
  const {
    filteredSnippets,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    highlightedSnippetId,
  } = useApp();

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-gray-50">
      <div className="flex items-center gap-1.5 border-b border-gray-200 bg-white px-2 py-1.5">
        <input
          className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500"
          placeholder="搜索内容..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!selectedCategoryId}
        />
        <button
          type="button"
          className="shrink-0 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
          onClick={onCreate}
          disabled={!selectedCategoryId}
        >
          + 新建
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {!selectedCategoryId ? (
          <p className="px-1 py-2 text-xs text-gray-400">请先选择分类</p>
        ) : filteredSnippets.length === 0 ? (
          <p className="px-1 py-2 text-xs text-gray-400">
            {searchQuery ? "没有匹配的片段" : "暂无片段，点击「新建」添加"}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                highlighted={snippet.id === highlightedSnippetId}
                onEdit={() => onEdit(snippet)}
                onDelete={() => onDeleteRequest(snippet)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
