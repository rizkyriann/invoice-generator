import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  SwatchIcon,
  ArrowDownTrayIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button.tsx';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Privacy First',
    description:
      'Everything stays on your device. No accounts, no uploads, no tracking of your data.',
  },
  {
    icon: SwatchIcon,
    title: '10 Beautiful Templates',
    description:
      'From minimal to corporate — find the perfect look for your brand instantly.',
  },
  {
    icon: ArrowDownTrayIcon,
    title: 'PDF Export',
    description:
      'Download high-resolution, multi-page A4 PDFs with a single click.',
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary shadow-sm">
        <BoltIcon className="h-3.5 w-3.5 text-primary" />
        No signup. No server. 100% private.
      </span>

      <h1 className="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-text sm:text-5xl">
        Professional Invoices, <span className="text-primary">Zero Friction</span>
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-text-secondary">
        Create polished, print-ready invoices directly in your browser. No signup, no server, no data
        leaves your device. Just fill, preview, and download.
      </p>
      <Link to="/app">
        <Button size="lg">Create Your First Invoice</Button>
      </Link>

      <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-md border border-border bg-surface p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-light text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mb-2 font-semibold text-text">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
