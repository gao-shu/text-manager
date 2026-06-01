import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import type { Snippet, SnippetDraft } from "../types";
import { titleFromContent } from "../utils/snippet";
import { IconClose } from "./Icons";

export interface SnippetDialogHandle {
  getDraft: () => SnippetDraft | null;
  saveDraft: () => string | null;
}

interface SnippetDialogProps {
  open: boolean;
  snippet: Snippet | null;
  onClose: () => void;
  onSave: (draft: SnippetDraft, snippetId?: string) => string | null;
}

export const SnippetDialog = forwardRef<SnippetDialogHandle, SnippetDialogProps>(
  function SnippetDialog({ open, snippet, onClose, onSave }, ref) {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (open) {
        setContent(snippet?.content ?? "");
        setError(null);
      }
    }, [open, snippet]);

    const getDraft = (): SnippetDraft => ({
      title: titleFromContent(content),
      content,
    });

    const saveDraft = (): string | null => {
      const err = onSave(getDraft(), snippet?.id);
      if (err) {
        setError(err);
        return err;
      }
      return null;
    };

    useImperativeHandle(ref, () => ({ getDraft, saveDraft }), [content, snippet, onSave]);

    if (!open) return null;

    const handleConfirm = () => {
      const err = saveDraft();
      if (!err) onClose();
    };

    const handleDismiss = () => {
      setError(null);
      onClose();
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={handleDismiss}
      >
        <div
          className="flex h-[70vh] w-full max-w-2xl flex-col rounded-lg bg-white p-5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              {snippet ? "编辑片段" : "新建片段"}
            </h3>
            <button
              type="button"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="关闭"
              onClick={handleDismiss}
            >
              <IconClose />
            </button>
          </div>

          <textarea
            autoFocus
            className="mt-3 min-h-0 flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            placeholder="输入内容..."
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-md bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600"
              onClick={handleConfirm}
            >
              确认
            </button>
          </div>
        </div>
      </div>
    );
  },
);
