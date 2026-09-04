import { ArrowRightLeft, ShieldCheck, Stethoscope } from 'lucide-react';
import InternalReferralManager from '../../components/InternalReferralManager';

export default function ReferralPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Care coordination</p>
            <h2 className="mt-2 text-3xl font-bold">Internal referral system</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">
            <ShieldCheck className="h-4 w-4" />
            Clinical flow
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <ArrowRightLeft className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">9</p>
          <p className="mt-2 text-sm text-slate-500">Clinician-to-clinician handoffs awaiting review.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Accepted</p>
            <Stethoscope className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">6</p>
          <p className="mt-2 text-sm text-slate-500">Patients transferred to specialist care.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">12</p>
          <p className="mt-2 text-sm text-slate-500">Specialist follow-ups finalized this month.</p>
        </div>
      </section>

      <InternalReferralManager />
    </div>
  );
}
