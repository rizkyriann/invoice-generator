import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.tsx';

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-text">
        Professional Invoices, <span className="text-primary">Zero Friction</span>
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-text-secondary">
        Create polished, print-ready invoices directly in your browser. No signup, no server, no data leaves your device.
        Just fill, preview, and download.
      </p>
      <Link to="/app">
        <Button size="lg">Create Your First Invoice</Button>
      </Link>
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-6 text-left">
          <h3 className="mb-2 font-semibold text-text">Privacy First</h3>
          <p className="text-sm text-text-secondary">
            Everything stays on your device. No accounts, no uploads, no tracking of your data.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 text-left">
          <h3 className="mb-2 font-semibold text-text">10 Beautiful Templates</h3>
          <p className="text-sm text-text-secondary">
            From minimal to corporate — find the perfect look for your brand instantly.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 text-left">
          <h3 className="mb-2 font-semibold text-text">PDF Export</h3>
          <p className="text-sm text-text-secondary">
            Download high-resolution, multi-page A4 PDFs with a single click.
          </p>
        </div>
      </div>
    </div>
  );
}
