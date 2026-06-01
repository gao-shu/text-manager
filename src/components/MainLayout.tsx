import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { quitApp } from "../api/app";
import { useApp } from "../context/AppContext";
import type { Snippet, SnippetDraft } from "../types";
import { previewContent } from "../utils/snippet";
import { CategoryPanel } from "./CategoryPanel";
import { ConfirmDialog } from "./ConfirmDialog";
import { SnippetDialog, type SnippetDialogHandle } from "./SnippetDialog";
import { SnippetList } from "./SnippetList";
import { Toast } from "./Toast";

export function MainLayout() {
  const {
    loading,
    toast,
    dialogOpen,
    setDialogOpen,
    highlightedSnippetId,
    copySnippet,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    snippets,
  } = useApp();

  const dialogRef = useRef<SnippetDialogHandle>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Snippet | null>(null);

  const openCreate = useCallback(() => {
    setEditingSnippet(null);
    setDialogOpen(true);
  }, [setDialogOpen]);

  const openEdit = useCallback(
    (snippet: Snippet) => {
      setEditingSnippet(snippet);
      setDialogOpen(true);
    },
    [setDialogOpen],
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingSnippet(null);
  }, [setDialogOpen]);

  const handleSave = useCallback(
    (draft: SnippetDraft, snippetId?: string) => {
      if (snippetId) return updateSnippet(snippetId, draft);
      return addSnippet(draft);
    },
    [addSnippet, updateSnippet],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (dialogOpen || deleteTarget) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

      if (e.key === "Delete") {
        if (!highlightedSnippetId) return;
        const snippet = snippets.find((s) => s.id === highlightedSnippetId);
        if (!snippet) return;
        e.preventDefault();
        setDeleteTarget(snippet);
        return;
      }

      if (!e.ctrlKey || e.key.toLowerCase() !== "c") return;
      if (!highlightedSnippetId) return;
      e.preventDefault();
      void copySnippet(highlightedSnippetId);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copySnippet, dialogOpen, deleteTarget, highlightedSnippetId, snippets]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void getCurrentWindow()
      .onCloseRequested(async (event) => {
        event.preventDefault();
        if (dialogOpen) {
          closeDialog();
          return;
        }
        await quitApp();
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, [dialogOpen, closeDialog]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        加载中...
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <CategoryPanel />
      <SnippetList
        onCreate={openCreate}
        onEdit={openEdit}
        onDeleteRequest={setDeleteTarget}
      />

      <SnippetDialog
        ref={dialogRef}
        open={dialogOpen}
        snippet={editingSnippet}
        onClose={closeDialog}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除片段"
        message={`确定删除该片段？\n${previewContent(deleteTarget?.content ?? "")}`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteSnippet(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      <Toast message={toast} />
    </div>
  );
}
