import { Link, NavLink } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import ThemeSwitcher from './ThemeSwitcher.tsx';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-primary' : 'text-text-secondary hover:text-text'
  }`;

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 h-16 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-text">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-text-inverse">
            <DocumentTextIcon className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Invoice Generator</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <NavLink to="/app/settings" className={linkClass}>
              <span className="px-2 py-1.5">Settings</span>
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              <span className="px-2 py-1.5">About</span>
            </NavLink>
          </div>
          <ThemeSwitcher />
          <Link
            to="/app"
            className="ml-1 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Create Invoice
          </Link>
        </div>
      </div>
    </nav>
  );
}
