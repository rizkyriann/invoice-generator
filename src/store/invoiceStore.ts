import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice, Business, Client, InvoiceItem, InvoiceTotalsInputs } from '../types/invoice.types';

const SCHEMA_VERSION = 1;

interface InvoiceStore {
  invoice: Invoice;
  past: Invoice[];
  future: Invoice[];
  updateBusiness: (business: Partial<Business>) => void;
  updateClient: (client: Partial<Client>) => void;
  addItem: (item: InvoiceItem) => void;
  removeItem: (itemId: string) => void;
  duplicateItem: (itemId: string) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  updateItem: (itemId: string, updates: Partial<InvoiceItem>) => void;
  setTemplate: (templateId: string) => void;
  updateTotalsInput: (totals: Partial<InvoiceTotalsInputs>) => void;
  updateInvoiceDetails: (details: Partial<Pick<Invoice, 'invoiceNumber' | 'issueDate' | 'dueDate' | 'currency' | 'language' | 'paymentTerms' | 'notes' | 'termsAndConditions'>>) => void;
  updateExtras: (extras: Partial<Invoice['extras']>) => void;
  clearDraft: () => void;
  duplicateInvoice: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const createEmptyInvoice = (): Invoice => ({
  id: crypto.randomUUID(),
  schemaVersion: SCHEMA_VERSION,
  invoiceNumber: `INV-${new Date().getFullYear()}-0001`,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: {
    code: 'IDR',
    symbol: 'Rp',
    locale: 'id-ID',
  },
  language: 'id',
  paymentTerms: 'Net 30',
  notes: '',
  termsAndConditions: '',
  business: {
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
  },
  client: {
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
  },
  items: [
    {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ],
  totals: {},
  templateId: 'minimal',
  extras: {},
});

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoice: createEmptyInvoice(),
      past: [],
      future: [],

      updateBusiness: (business) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            business: { ...state.invoice.business, ...business },
          },
        })),

      updateClient: (client) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            client: { ...state.invoice.client, ...client },
          },
        })),

      addItem: (item) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: [...state.invoice.items, item],
          },
        })),

      removeItem: (itemId) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: state.invoice.items.length > 1
              ? state.invoice.items.filter((item) => item.id !== itemId)
              : state.invoice.items,
          },
        })),

      duplicateItem: (itemId) =>
        set((state) => {
          const itemIndex = state.invoice.items.findIndex((item) => item.id === itemId);
          if (itemIndex === -1) return state;

          const itemToDuplicate = state.invoice.items[itemIndex];
          const newItem = { ...itemToDuplicate, id: crypto.randomUUID() };
          const newItems = [...state.invoice.items];
          newItems.splice(itemIndex + 1, 0, newItem);

          return {
            invoice: {
              ...state.invoice,
              items: newItems,
            },
          };
        }),

      reorderItems: (fromIndex, toIndex) =>
        set((state) => {
          const items = [...state.invoice.items];
          const [movedItem] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, movedItem);

          return {
            invoice: {
              ...state.invoice,
              items,
            },
          };
        }),

      updateItem: (itemId, updates) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: state.invoice.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          },
        })),

      setTemplate: (templateId) =>
        set((state) => ({
          invoice: { ...state.invoice, templateId },
        })),

      updateTotalsInput: (totals) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            totals: { ...state.invoice.totals, ...totals },
          },
        })),

      updateInvoiceDetails: (details) =>
        set((state) => ({
          invoice: { ...state.invoice, ...details },
        })),

      updateExtras: (extras) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            extras: { ...state.invoice.extras, ...extras },
          },
        })),

      clearDraft: () => set({ invoice: createEmptyInvoice() }),

      duplicateInvoice: () =>
        set((state) => {
          const currentNumber = state.invoice.invoiceNumber;
          const match = currentNumber.match(/(\d+)$/);
          const nextNumber = match
            ? currentNumber.replace(/\d+$/, String(parseInt(match[0]) + 1).padStart(match[0].length, '0'))
            : `${currentNumber}-COPY`;

          return {
            invoice: {
              ...state.invoice,
              id: crypto.randomUUID(),
              invoiceNumber: nextNumber,
              issueDate: new Date().toISOString().split('T')[0],
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              items: state.invoice.items.map((item) => ({
                ...item,
                id: crypto.randomUUID(),
              })),
            },
          };
        }),

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state;
          const previous = state.past[state.past.length - 1];
          const newPast = state.past.slice(0, -1);
          return {
            past: newPast,
            invoice: previous,
            future: [state.invoice, ...state.future].slice(0, 30),
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          return {
            past: [...state.past, state.invoice].slice(-30),
            invoice: next,
            future: newFuture,
          };
        }),

      canUndo: () => {
        const state = useInvoiceStore.getState();
        return state.past.length > 0;
      },

      canRedo: () => {
        const state = useInvoiceStore.getState();
        return state.future.length > 0;
      },
    }),
    {
      name: 'invoice-draft',
      version: SCHEMA_VERSION,
      partialize: (state) => ({ invoice: state.invoice }),
      migrate: (persistedState: any, version: number) => {
        if (version !== SCHEMA_VERSION) {
          return { invoice: createEmptyInvoice() };
        }
        return persistedState as InvoiceStore;
      },
    }
  )
);
