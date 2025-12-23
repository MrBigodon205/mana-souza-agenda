
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
// Importaremos as páginas reais em breve. Usando placeholders por enquanto.

import BookingPage from './pages/Booking';

import Login from './pages/Login';
import Dashboard from './pages/Admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ClientList from './pages/Admin/ClientList';
import ClientProfile from './pages/Admin/ClientProfile';
import Expenses from './pages/Admin/Expenses';
import Debug from './pages/Debug';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/booking" replace />} />

          <Route path="booking" element={<BookingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="debug" element={<Debug />} />

          {/* Rotas Protegidas do Admin */}
          <Route path="admin" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/:id" element={<ClientProfile />} />
            <Route path="financial" element={<Expenses />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}
