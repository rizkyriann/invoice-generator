import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

interface UiStore {
  isMobileViewActive: boolean;
  activeView: 'form' | 'preview';
  modalState: ModalState;
  toastQueue: ToastMessage[];
  isPdfLoading: boolean;

  setMobileViewActive: (active: boolean) => void;
  setActiveView: (view: 'form' | 'preview') => void;
  openModal: (title: string, content?: React.ReactNode) => void;
  closeModal: () => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  setPdfLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isMobileViewActive: false,
  activeView: 'form',
  modalState: { isOpen: false },
  toastQueue: [],
  isPdfLoading: false,

  setMobileViewActive: (active) => set({ isMobileViewActive: active }),
  setActiveView: (view) => set({ activeView: view }),

  openModal: (title, content) =>
    set({ modalState: { isOpen: true, title, content } }),

  closeModal: () =>
    set({ modalState: { isOpen: false, title: undefined, content: undefined } }),

  addToast: (message, type = 'info') =>
    set((state) => ({
      toastQueue: [
        ...state.toastQueue,
        { id: crypto.randomUUID(), message, type },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((toast) => toast.id !== id),
    })),

  setPdfLoading: (loading) => set({ isPdfLoading: loading }),
}));
