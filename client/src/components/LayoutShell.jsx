import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getDashboardPathForRole, getSession } from '../auth';
import NotificationCenter from './NotificationCenter';

export default function LayoutShell({ title, children }) {
  const navigate = useNavigate();
  const session = getSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const staffRoles = ['admin', 'doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist'];

  const handleLogout = () => {
    clearSession();
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Carevyn</p>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="rounded-xl border border-slate-200 p-2 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <NotificationCenter />

            <Link
              to={getDashboardPathForRole(session?.role || 'admin')}
              className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 md:inline-flex"
            >
              Dashboard
            </Link>
            {staffRoles.includes(session?.role) && (
              <Link to="/dashboard/patients" className="hidden rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 md:inline-flex">
                Patient records
              </Link>
            )}
            {(session?.role === 'admin' || session?.role === 'patient') && (
              <Link to="/dashboard/billing" className="hidden rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 md:inline-flex">
                Billing
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
        {menuOpen && <nav className="border-t border-slate-200 bg-slate-50 px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm font-semibold">
            <Link onClick={() => setMenuOpen(false)} to={getDashboardPathForRole(session?.role || 'admin')} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-white">Dashboard</Link>
            {staffRoles.includes(session?.role) && <Link onClick={() => setMenuOpen(false)} to="/dashboard/patients" className="rounded-lg px-3 py-2 text-emerald-800 hover:bg-white">Patient records</Link>}
            {(session?.role === 'admin' || session?.role === 'patient') && <Link onClick={() => setMenuOpen(false)} to="/dashboard/billing" className="rounded-lg px-3 py-2 text-blue-800 hover:bg-white">Billing</Link>}
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-emerald-800 hover:bg-white"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </nav>}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
