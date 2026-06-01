interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
