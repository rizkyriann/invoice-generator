import { useUiStore } from '../../store/uiStore';
import Toast from './Toast.tsx';

export default function ToastContainer() {
  const toastQueue = useUiStore((state) => state.toastQueue);
  const removeToast = useUiStore((state) => state.removeToast);

  if (toastQueue.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toastQueue.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
