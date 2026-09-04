import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing, CalendarClock, CheckCircle2, Loader2, Plus, RefreshCw, UserPlus } from 'lucide-react';
import axios from 'axios';
import { API_URL, getAuthHeaders } from '../api';

const waitlistSchema = z.object({
  patientName: z.string().trim().min(2, 'Patient name is required'),
  specialty: z.string().trim().min(2, 'Specialty is required'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  notes: z.string().max(200).optional().or(z.literal('')),
});

export default function WaitlistManager() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      patientName: '',
      specialty: 'Cardiology',
      preferredDate: '2026-09-05',
      preferredTime: '10:00',
      priority: 'Medium',
      notes: '',
    },
  });

  const waitingCount = useMemo(
    () => waitlist.filter((item) => item.status === 'Waiting').length,
    [waitlist]
  );

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/admin/waitlist`, { headers: getAuthHeaders() });
      setWaitlist(response.data?.waitlist || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load waitlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWaitlist(); }, []);

  const notifyPatient = async (id) => {
    try {
      setError('');
      const response = await axios.patch(`${API_URL}/admin/waitlist/${id}`, { status: 'Offered', notified: true }, { headers: getAuthHeaders() });
      setWaitlist((current) => current.map((item) => item._id === id ? response.data.entry : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to notify patient');
    }
  };

  const onSubmit = async (values) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/admin/waitlist`, values, { headers: getAuthHeaders() });
      setWaitlist((current) => [response.data.entry, ...current]);
      form.reset({ patientName: '', specialty: 'Cardiology', preferredDate: '2026-09-05', preferredTime: '10:00', priority: 'Medium', notes: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to add patient to waitlist');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Waitlist</p>
            <h3 className="text-xl font-bold text-slate-900">Add patient to queue</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Patient name</label>
            <input {...form.register('patientName')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Daniel Okafor" />
            {form.formState.errors.patientName && <p className="mt-2 text-xs text-red-600">{form.formState.errors.patientName.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Specialty</label>
            <input {...form.register('specialty')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Cardiology" />
            {form.formState.errors.specialty && <p className="mt-2 text-xs text-red-600">{form.formState.errors.specialty.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Preferred date</label>
              <input type="date" {...form.register('preferredDate')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              {form.formState.errors.preferredDate && <p className="mt-2 text-xs text-red-600">{form.formState.errors.preferredDate.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Preferred time</label>
              <input type="time" {...form.register('preferredTime')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              {form.formState.errors.preferredTime && <p className="mt-2 text-xs text-red-600">{form.formState.errors.preferredTime.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
            <select {...form.register('priority')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
            <textarea {...form.register('notes')} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Reason for follow-up" />
          </div>
        </div>

        <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" />
          Add to waitlist
        </button>
      </form>

      <div className="space-y-4">
        {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={fetchWaitlist} className="font-semibold underline">Retry</button></div>}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Queue</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Current waitlist</h3>
            </div>
            <div className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
              {waitingCount} waiting
            </div>
          </div>
        </div>

        <div className="flex justify-end"><button type="button" onClick={fetchWaitlist} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button></div>

        <div className="space-y-3">
          {loading ? [1, 2, 3].map((row) => <div key={row} className="h-36 animate-pulse rounded-2xl bg-slate-100" />) : waitlist.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No patients are currently waiting.</div> : waitlist.map((item) => (
            <div key={item._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.patientName}</p>
                  <p className="text-sm text-slate-500">{item.specialty}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.status === 'Offered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.priority === 'High'
                        ? 'bg-red-100 text-red-700'
                        : item.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                  <CalendarClock className="h-3 w-3" />
                  {item.preferredDate} at {item.preferredTime}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                  {item.priority} priority
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">{item.notes}</p>

              {item.status === 'Waiting' && (
                <button
                  type="button"
                  onClick={() => notifyPatient(item._id)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  <BellRing className="h-3.5 w-3.5" />
                  Notify patient
                </button>
              )}

              {item.notified && item.status === 'Offered' && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Notification sent
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
