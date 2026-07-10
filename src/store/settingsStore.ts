import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Currency, ThemeMode } from '../types/invoice.types';

const DEFAULT_CURRENCY: Currency = {
  code: 'IDR',
  symbol: 'Rp',
  locale: 'id-ID',
};

interface SettingsStore extends Settings {
  setDefaultCurrency: (currency: Currency) => void;
  setDefaultLanguage: (language: 'en' | 'id') => void;
  setDefaultTaxRate: (rate: number | undefined) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultCurrency: DEFAULT_CURRENCY,
      defaultLanguage: 'id',
      defaultTaxRate: 11,
      theme: 'light',

      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
      setDefaultLanguage: (language) => set({ defaultLanguage: language }),
      setDefaultTaxRate: (rate) => set({ defaultTaxRate: rate }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'invoice-settings',
    }
  )
);
