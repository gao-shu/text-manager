import { useEffect, useState } from "react";

interface CategoryDialogProps {
  open: boolean;
  initialName?: string;
  title: string;
  onClose: () => void;
  onSubmit: (name: string) => string | null;
}

export function CategoryDialog({
  open,
  initialName = "",
  title,
  onClose,
  onSubmit,
}: CategoryDialogProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setError(null);
    }
  }, [open, initialName]);

  if (!open) return null;

  const handleSubmit = () => {
    const err = onSubmit(name);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <input
          autoFocus
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onClose();
          }}
          placeholder="分类名称"
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
            onClick={handleSubmit}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
