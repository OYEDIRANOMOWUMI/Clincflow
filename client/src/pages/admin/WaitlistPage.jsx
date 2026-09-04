import { BellRing, CalendarClock, ShieldCheck } from 'lucide-react';
import WaitlistManager from '../../components/WaitlistManager';

export default function WaitlistPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Operations</p>
            <h2 className="mt-2 text-3xl font-bold">Waitlist management</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">
            <ShieldCheck className="h-4 w-4" />
            Scheduling
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Waiting</p>
            <CalendarClock className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">12</p>
          <p className="mt-2 text-sm text-slate-500">Patients pending earlier slots.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Notified</p>
            <BellRing className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">7</p>
          <p className="mt-2 text-sm text-slate-500">Earlier slots offered this week.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Auto flow</p>
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">3</p>
          <p className="mt-2 text-sm text-slate-500">High-priority cases ready for instant contact.</p>
        </div>
      </section>

      <WaitlistManager />
    </div>
  );
}
