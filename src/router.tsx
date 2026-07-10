import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import Home from './pages/Home.tsx';
import InvoiceGeneratorPage from './pages/InvoiceGeneratorPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/app', element: <InvoiceGeneratorPage /> },
      { path: '/app/settings', element: <SettingsPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
