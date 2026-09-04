import { BellRing, CalendarRange, ShieldCheck } from 'lucide-react';
import DoctorShiftManager from '../../components/DoctorShiftManager';

export default function DoctorShiftPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Operations</p>
            <h2 className="mt-2 text-3xl font-bold">Doctor shift management</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">
            <ShieldCheck className="h-4 w-4" />
            Admin access
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Roster coverage</p>
            <CalendarRange className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">94%</p>
          <p className="mt-2 text-sm text-slate-500">All key clinics are staffed.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Pending alerts</p>
            <BellRing className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">4</p>
          <p className="mt-2 text-sm text-slate-500">Coverage and waitlist updates.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Specialty hubs</p>
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">8</p>
          <p className="mt-2 text-sm text-slate-500">Departments with active rosters.</p>
        </div>
      </section>

      <DoctorShiftManager />
    </div>
  );
}
