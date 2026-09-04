import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft, Loader2, Plus, RefreshCw, Send, Stethoscope } from 'lucide-react';
import axios from 'axios';
import { API_URL, getAuthHeaders } from '../api';

const referralSchema = z.object({
  patientName: z.string().trim().min(2, 'Patient name is required'),
  fromDoctor: z.string().trim().min(2, 'Sending doctor is required'),
  toDoctor: z.string().trim().min(2, 'Receiving doctor is required'),
  specialty: z.string().trim().min(2, 'Specialty is required'),
  reason: z.string().trim().min(10, 'Provide a brief reason for the referral'),
  date: z.string().min(1, 'Referral date is required'),
});

export default function InternalReferralManager() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      patientName: '',
      fromDoctor: 'Dr. Grace Okafor',
      toDoctor: 'Dr. Daniel Nwosu',
      specialty: 'Neurology',
      reason: '',
      date: '2026-09-03',
    },
  });

  const pendingCount = useMemo(
    () => referrals.filter((item) => item.status === 'Pending').length,
    [referrals]
  );

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/referrals`, { headers: getAuthHeaders() });
      setReferrals(response.data?.referrals || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReferrals(); }, []);

  const onSubmit = async (values) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/referrals`, values, { headers: getAuthHeaders() });
      setReferrals((current) => [response.data.referral, ...current]);
      form.reset({ patientName: '', fromDoctor: 'Dr. Grace Okafor', toDoctor: 'Dr. Daniel Nwosu', specialty: 'Neurology', reason: '', date: '2026-09-03' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create referral');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Referral</p>
            <h3 className="text-xl font-bold text-slate-900">Create patient referral</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Patient name</label>
            <input {...form.register('patientName')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Jane Doe" />
            {form.formState.errors.patientName && <p className="mt-2 text-xs text-red-600">{form.formState.errors.patientName.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">From doctor</label>
              <input {...form.register('fromDoctor')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              {form.formState.errors.fromDoctor && <p className="mt-2 text-xs text-red-600">{form.formState.errors.fromDoctor.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">To doctor</label>
              <input {...form.register('toDoctor')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              {form.formState.errors.toDoctor && <p className="mt-2 text-xs text-red-600">{form.formState.errors.toDoctor.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Specialty</label>
              <input {...form.register('specialty')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Neurology" />
              {form.formState.errors.specialty && <p className="mt-2 text-xs text-red-600">{form.formState.errors.specialty.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
              <input type="date" {...form.register('date')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              {form.formState.errors.date && <p className="mt-2 text-xs text-red-600">{form.formState.errors.date.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Reason for referral</label>
            <textarea {...form.register('reason')} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Explain the clinical reason for the transfer" />
            {form.formState.errors.reason && <p className="mt-2 text-xs text-red-600">{form.formState.errors.reason.message}</p>}
          </div>
        </div>

        <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">
          <Send className="h-4 w-4" />
          Send referral
        </button>
      </form>

      <div className="space-y-4">
        {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={fetchReferrals} className="font-semibold underline">Retry</button></div>}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Coverage</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Referral queue</h3>
            </div>
            <div className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
              {pendingCount} pending
            </div>
          </div>
        </div>

        <div className="flex justify-end"><button type="button" onClick={fetchReferrals} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button></div>

        <div className="space-y-3">
          {loading ? [1, 2, 3].map((row) => <div key={row} className="h-40 animate-pulse rounded-2xl bg-slate-100" />) : referrals.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No internal referrals have been created.</div> : referrals.map((referral) => (
            <div key={referral._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{referral.patientName}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>{referral.specialty}</span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    referral.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : referral.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {referral.status}
                </span>
              </div>

              <div className="mt-3 text-sm text-slate-600">
                <p className="mb-1"><span className="font-medium text-slate-800">From:</span> {referral.fromDoctor}</p>
                <p className="mb-1"><span className="font-medium text-slate-800">To:</span> {referral.toDoctor}</p>
                <p className="mb-1"><span className="font-medium text-slate-800">Date:</span> {referral.date}</p>
              </div>

              <p className="mt-3 text-sm text-slate-600">{referral.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
