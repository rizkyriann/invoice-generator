import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-success-light border-success text-green-800',
  error: 'bg-danger-light border-danger text-red-800',
  info: 'bg-primary-light border-primary text-indigo-800',
};

const iconMap: Record<ToastType, typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
};

export default function Toast({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = iconMap[type];

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${typeStyles[type]}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="rounded p-0.5 transition-colors hover:opacity-70"
        aria-label="Dismiss"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
