interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-gray-800 px-4 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
