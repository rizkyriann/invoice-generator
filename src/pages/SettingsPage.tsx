import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { Select, Toggle } from '../components/ui';
import { CURRENCIES } from '../constants/currencies';

export default function SettingsPage() {
  const settings = useSettingsStore();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-secondary">
          Configure your default preferences. These settings will be applied to new invoices.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Defaults</h2>
          <div className="space-y-4">
            <Select
              label="Default Currency"
              value={settings.defaultCurrency.code}
              onChange={(e) => {
                const currency = CURRENCIES.find((c) => c.code === e.target.value);
                if (currency) settings.setDefaultCurrency(currency);
              }}
              options={CURRENCIES.map((c) => ({
                value: c.code,
                label: `${c.code} (${c.symbol})`,
              }))}
            />

            <Select
              label="Default Language"
              value={settings.defaultLanguage}
              onChange={(e) => settings.setDefaultLanguage(e.target.value as 'en' | 'id')}
              options={[
                { value: 'en', label: 'English' },
                { value: 'id', label: 'Bahasa Indonesia' },
              ]}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.defaultTaxRate || 0}
                onChange={(e) => settings.setDefaultTaxRate(parseFloat(e.target.value) || undefined)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Dark Mode</p>
              <p className="text-sm text-text-secondary">Use dark theme for the app interface</p>
            </div>
            <Toggle
              checked={settings.theme === 'dark'}
              onChange={(checked) => settings.setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Data & Privacy</h2>
          <p className="text-sm text-text-secondary">
            All your invoice data is stored locally in your browser. Nothing is sent to any server.
            You can clear your data at any time from the{' '}
            <Link to="/app" className="text-primary hover:underline">
              invoice editor
            </Link>{' '}
            using the "Clear Draft" button.
          </p>
        </div>
      </div>
    </div>
  );
}
