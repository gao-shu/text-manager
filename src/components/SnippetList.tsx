import { useApp } from "../context/AppContext";
import type { Snippet } from "../types";
import { IconEdit, IconTrash } from "./Icons";

interface SnippetCardProps {
  snippet: Snippet;
  highlighted: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SnippetCard({ snippet, highlighted, onEdit, onDelete }: SnippetCardProps) {
  const { highlightSnippet } = useApp();

  return (
    <article
      className={`flex gap-3 rounded-lg border bg-white p-4 shadow-sm transition ${
        highlighted ? "border-blue-400 ring-1 ring-blue-200" : "border-gray-200"
      }`}
      onClick={() => highlightSnippet(snippet.id)}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{snippet.title}</h3>
        <p className="line-clamp-2 mt-2 whitespace-pre-wrap text-sm text-gray-500">
          {snippet.content || "（无内容）"}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center gap-1">
        <button
          type="button"
          title="编辑"
          className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <IconEdit />
        </button>
        <button
          type="button"
          title="删除"
          className="rounded-md p-2 text-red-500 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <IconTrash />
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
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <input
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500"
          placeholder="搜索片段标题..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!selectedCategoryId}
        />
        <button
          type="button"
          className="shrink-0 rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          onClick={onCreate}
          disabled={!selectedCategoryId}
        >
          + 新建片段
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!selectedCategoryId ? (
          <p className="text-sm text-gray-400">请先选择分类</p>
        ) : filteredSnippets.length === 0 ? (
          <p className="text-sm text-gray-400">
            {searchQuery ? "没有匹配的片段" : "暂无片段，点击「新建片段」添加"}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
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
