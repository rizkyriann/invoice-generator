import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher.tsx';

export default function Navbar() {
  return (
    <nav className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <Link to="/" className="text-lg font-bold text-text">
        Invoice Generator
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/app"
          className="text-sm text-text-secondary transition-colors hover:text-text"
        >
          Create Invoice
        </Link>
        <Link
          to="/app/settings"
          className="text-sm text-text-secondary transition-colors hover:text-text"
        >
          Settings
        </Link>
        <Link
          to="/about"
          className="text-sm text-text-secondary transition-colors hover:text-text"
        >
          About
        </Link>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
