import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Building2, ShieldCheck, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveSession } from '../../auth';

const registerSchema = z.object({
  hospitalName: z.string().trim().min(2, 'Hospital name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Use a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().trim().min(7, 'Phone number is required'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      hospitalName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const response = await axios.post('http://localhost:3700/api/hospitals/register', {
        hospitalName: values.hospitalName,
        adminEmail: values.email,
        password: values.password,
        hospitalPhone: values.phone,
      });

      const user = response.data?.adminUser || { role: 'admin' };
      const token = response.data?.token;
      const session = saveSession('admin', user, token);
      form.reset();
      navigate(session.role === 'admin' ? '/dashboard/admin' : '/dashboard', { replace: true });
    } catch (error) {
      setServerError(error?.response?.data?.message || 'Unable to create the hospital account right now.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(15,23,42,0.35)]">
        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-800 p-8 text-white md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.32),transparent_32%)]" />
            <div className="relative">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-100">Carevyn</p>
                  <h1 className="text-2xl font-bold">Register hospital</h1>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern hospital building and healthcare team"
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Trusted platform</p>
                  <h2 className="mt-3 text-4xl font-black leading-tight">Build a stronger digital care experience.</h2>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-emerald-50">
                  Launch a secure care environment for your hospital with integrated patient management, staff access, scheduling, and operational visibility.
                </p>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-50">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Role-based hospital access with secure administration</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 md:p-12">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Create account</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Set up your hospital</h2>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Hospital name</label>
                <input {...form.register('hospitalName')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700" />
                {form.formState.errors.hospitalName && <p className="mt-2 text-xs text-red-600">{form.formState.errors.hospitalName.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" {...form.register('email')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700" />
                {form.formState.errors.email && <p className="mt-2 text-xs text-red-600">{form.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input {...form.register('phone')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700" />
                {form.formState.errors.phone && <p className="mt-2 text-xs text-red-600">{form.formState.errors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input type="password" {...form.register('password')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700" />
                {form.formState.errors.password && <p className="mt-2 text-xs text-red-600">{form.formState.errors.password.message}</p>}
              </div>

              {serverError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </p>
              )}

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800">
                <UserPlus className="h-4 w-4" />
                Create hospital account
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
              <span>Already have an account?</span>
              <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800">
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
