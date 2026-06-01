import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CategoryDialog } from "./CategoryDialog";
import { ConfirmDialog } from "./ConfirmDialog";

export function CategoryPanel() {
  const {
    categories,
    selectedCategoryId,
    selectCategory,
    addCategory,
    renameCategory,
    deleteCategory,
    snippets,
    showToast,
  } = useApp();

  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; count: number } | null>(null);

  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <span className="text-sm font-semibold text-gray-700">分类</span>
        <button
          type="button"
          className="rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
          onClick={() => setCreateOpen(true)}
        >
          + 新建
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto py-1">
        {categories.map((category) => {
          const active = category.id === selectedCategoryId;
          return (
            <li key={category.id}>
              <button
                type="button"
                className={`group flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => selectCategory(category.id)}
                onDoubleClick={() => setRenameTarget({ id: category.id, name: category.name })}
              >
                <span className="truncate">{category.name}</span>
                <span className="hidden gap-1 group-hover:flex">
                  <span
                    role="button"
                    tabIndex={0}
                    className="rounded px-1 text-xs text-gray-400 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTarget({ id: category.id, name: category.name });
                    }}
                  >
                    改
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="rounded px-1 text-xs text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (categories.length <= 1) {
                        showToast("至少保留一个分类");
                        return;
                      }
                      const count = snippets.filter((s) => s.categoryId === category.id).length;
                      setDeleteTarget({ id: category.id, name: category.name, count });
                    }}
                  >
                    删
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <CategoryDialog
        open={createOpen}
        title="新建分类"
        onClose={() => setCreateOpen(false)}
        onSubmit={(name) => {
          const err = addCategory(name);
          if (!err) setCreateOpen(false);
          return err;
        }}
      />

      <CategoryDialog
        open={!!renameTarget}
        initialName={renameTarget?.name ?? ""}
        title="重命名分类"
        onClose={() => setRenameTarget(null)}
        onSubmit={(name) => {
          if (!renameTarget) return "无效操作";
          const err = renameCategory(renameTarget.id, name);
          if (!err) setRenameTarget(null);
          return err;
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除分类"
        message={
          deleteTarget && deleteTarget.count > 0
            ? `分类「${deleteTarget.name}」下有 ${deleteTarget.count} 个片段，确定删除？`
            : `确定删除分类「${deleteTarget?.name ?? ""}」？`
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCategory(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </aside>
  );
}
