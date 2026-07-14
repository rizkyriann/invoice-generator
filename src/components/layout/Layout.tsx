import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';
import ToastContainer from '../ui/ToastContainer.tsx';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary text-text">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
