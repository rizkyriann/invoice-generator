import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.tsx';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="mb-2 text-6xl font-bold text-text">404</h1>
      <p className="mb-8 text-text-secondary">Page not found</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
