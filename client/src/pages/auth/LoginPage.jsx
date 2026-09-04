import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Building2, LogIn, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getSession, saveSession } from '../../auth';
import { demoUsers, loginUser } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacy', 'laboratory', 'patient']),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = getSession();
  const [serverError, setServerError] = useState('');
  const queryRole = searchParams.get('role') || '';
  const queryEmail = searchParams.get('email') || '';
  const staffRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacy', 'laboratory'];
  const initialRole = queryRole === 'patient' || staffRoles.includes(queryRole) ? queryRole : 'admin';
  const [selectedPortal, setSelectedPortal] = useState(queryRole === 'patient' ? 'patient' : staffRoles.includes(queryRole) ? 'staff' : '');

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: queryEmail,
      password: '',
      role: initialRole,
    },
  });

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const result = await loginUser(values);
      const role = String(result?.user?.role || values.role || '').trim().toLowerCase();
      const safeSession = saveSession(role, result.user, result.token);
      form.reset();
      navigate(safeSession.role === 'admin' ? '/dashboard/admin' : `/dashboard/${safeSession.role}`, { replace: true });
      return;
    } catch (error) {
      const demoUser = demoUsers[values.role];
      const fallbackMatch =
        demoUser &&
        values.email === demoUser.email &&
        values.password === 'password123';

      if (fallbackMatch) {
        const safeSession = saveSession(values.role, demoUser, 'demo-token');
        form.reset();
        navigate(safeSession.role === 'admin' ? '/dashboard/admin' : `/dashboard/${safeSession.role}`, { replace: true });
        return;
      }

      setServerError(error?.message || 'Unable to sign in. Please try again.');
    }
  };

  if (session?.user) {
    return <Navigate to={session.role === 'admin' ? '/dashboard/admin' : `/dashboard/${session.role}`} replace />;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(15,23,42,0.35)]">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-8 text-white md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),transparent_30%)]" />
            <div className="relative">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-100">Carevyn</p>
                  <h1 className="text-2xl font-bold">Hospital management</h1>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                  alt="Healthcare staff working in a hospital"
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Access</p>
                  <h2 className="mt-3 text-4xl font-black leading-tight">Secure role-based portal</h2>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-emerald-50">
                  Manage patients, staff, appointments, billing, and care workflows from one centralized platform for modern hospital operations.
                </p>

                <div className="space-y-3 text-sm text-emerald-50">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <Stethoscope className="h-5 w-5" />
                    <span>Doctors, nurses, pharmacy, lab, reception, and admin portals</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <UserRound className="h-5 w-5" />
                    <span>Patient self-service access after hospital registration and approval</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 md:p-12">
            {!selectedPortal && (
              <div className="flex min-h-[28rem] flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Carevyn access</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">Where would you like to sign in?</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">Choose the portal that matches your account. Staff and patients use separate access paths.</p>
                <div className="mt-8 grid gap-4">
                  <button
                    type="button"
                    onClick={() => { setSelectedPortal('staff'); if (!staffRoles.includes(form.getValues('role'))) form.setValue('role', 'doctor'); setServerError(''); }}
                    className="group rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left transition hover:border-emerald-500 hover:bg-emerald-100"
                  >
                    <span className="flex items-center gap-3 text-lg font-bold text-emerald-950"><Stethoscope className="h-6 w-6 text-emerald-700" /> Staff portal</span>
                    <span className="mt-2 block text-sm text-emerald-900/70">Admin, doctors, nurses, reception, pharmacy, and laboratory teams</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Continue to staff sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedPortal('patient'); form.setValue('role', 'patient'); setServerError(''); }}
                    className="group rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left transition hover:border-blue-500 hover:bg-blue-100"
                  >
                    <span className="flex items-center gap-3 text-lg font-bold text-blue-950"><UserRound className="h-6 w-6 text-blue-700" /> Patient portal</span>
                    <span className="mt-2 block text-sm text-blue-900/70">Appointments, medical records, prescriptions, and reminders</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">Continue to patient sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </button>
                </div>
                <p className="mt-5 text-sm text-slate-600">New patient? <Link to="/register/patient" className="font-semibold text-blue-700 hover:text-blue-800">Register here</Link></p>
                <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700"><ArrowRight className="h-4 w-4 rotate-180" /> Return home</Link>
              </div>
            )}

            <div className={selectedPortal ? '' : 'hidden'}>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Sign in</h2>
              <button type="button" onClick={() => setSelectedPortal('')} className="mt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">← Choose a different portal</button>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedPortal('staff'); if (!staffRoles.includes(form.getValues('role'))) form.setValue('role', 'doctor'); }}
                  className={`rounded-xl border px-3 py-3 text-left transition ${form.watch('role') === 'patient' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-emerald-700 bg-emerald-50 text-emerald-900'}`}
                >
                  <span className="block text-sm font-bold">Staff portal</span>
                  <span className="mt-1 block text-xs">Admin, clinical, and operations teams</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedPortal('patient'); form.setValue('role', 'patient'); }}
                  className={`rounded-xl border px-3 py-3 text-left transition ${form.watch('role') === 'patient' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                >
                  <span className="block text-sm font-bold">Patient portal</span>
                  <span className="mt-1 block text-xs">Appointments, records, and prescriptions</span>
                </button>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                {selectedPortal === 'staff' ? <select {...form.register('role')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-emerald-700"><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="receptionist">Receptionist</option><option value="pharmacy">Pharmacy</option><option value="laboratory">Laboratory</option></select> : <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">Patient portal</div>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  {...form.register('email')}
                  type="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700"
                  placeholder="name@hospital.com"
                />
                {form.formState.errors.email && (
                  <p className="mt-2 text-xs text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  {...form.register('password')}
                  type="password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700"
                  placeholder="Enter password"
                />
                {form.formState.errors.password && (
                  <p className="mt-2 text-xs text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-slate-700">
              Demo credentials: use the selected role email and password <strong className="text-emerald-800">password123</strong>.
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
              <span>{selectedPortal === 'patient' ? 'New patient?' : 'Need access?'}</span>
              {selectedPortal === 'patient' ? <Link to="/register/patient" className="font-semibold text-blue-700 hover:text-blue-800">Register here</Link> : null}
              <Link to="/" className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800">
                Return home <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
