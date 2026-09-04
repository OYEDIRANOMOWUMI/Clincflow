import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck2, Clock3, MapPin, Plus, Stethoscope, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_URL, getAuthHeaders } from '../api';

const workingDayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const doctorShiftSchema = z
  .object({
    doctorName: z.string().trim().min(2, 'Doctor name is required'),
    specialty: z.string().trim().min(2, 'Specialty is required'),
    workingDays: z.array(z.enum(workingDayOptions)).min(1, 'Select at least one working day'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM format'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM format'),
    location: z.string().trim().min(2, 'Clinic location is required'),
    status: z.enum(['Active', 'On-call', 'Break', 'Away']),
    notes: z.string().max(200).optional().or(z.literal('')),
  })
  .refine(({ startTime, endTime }) => startTime < endTime, {
    message: 'End time must be later than the start time',
    path: ['endTime'],
  });

export default function DoctorShiftManager() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(doctorShiftSchema),
    defaultValues: {
      doctorName: '',
      specialty: '',
      workingDays: ['Monday'],
      startTime: '08:00',
      endTime: '16:00',
      location: '',
      status: 'Active',
      notes: '',
    },
  });

  const activeCount = useMemo(
    () => shifts.filter((shift) => shift.status === 'Active').length,
    [shifts]
  );

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/admin/shifts`, { headers: getAuthHeaders() });
      setShifts(response.data?.shifts || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load doctor shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleDayToggle = (day) => {
    const currentDays = form.getValues('workingDays') || [];
    const hasDay = currentDays.includes(day);
    const nextDays = hasDay
      ? currentDays.filter((item) => item !== day)
      : [...currentDays, day];

    form.setValue('workingDays', nextDays, { shouldValidate: true });
  };

  const onSubmit = async (values) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/admin/shifts`, values, { headers: getAuthHeaders() });
      setShifts((current) => [response.data.shift, ...current]);
      form.reset({ doctorName: '', specialty: '', workingDays: ['Monday'], startTime: '08:00', endTime: '16:00', location: '', status: 'Active', notes: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save doctor shift');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Roster</p>
            <h3 className="text-xl font-bold text-slate-900">Assign doctor shift</h3>
          </div>
        </div>

        {error && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={fetchShifts} className="font-semibold underline">Retry</button></div>}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Doctor name</label>
            <input {...form.register('doctorName')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Dr. Aisha Bello" />
            {form.formState.errors.doctorName && <p className="mt-2 text-xs text-red-600">{form.formState.errors.doctorName.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Specialty</label>
            <input {...form.register('specialty')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Cardiology" />
            {form.formState.errors.specialty && <p className="mt-2 text-xs text-red-600">{form.formState.errors.specialty.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Working days</label>
            <div className="flex flex-wrap gap-2">
              {workingDayOptions.map((day) => {
                const selected = (form.watch('workingDays') || []).includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      selected
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {form.formState.errors.workingDays && (
              <p className="mt-2 text-xs text-red-600">{form.formState.errors.workingDays.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Start time</label>
              <input type="time" {...form.register('startTime')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              {form.formState.errors.startTime && <p className="mt-2 text-xs text-red-600">{form.formState.errors.startTime.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">End time</label>
              <input type="time" {...form.register('endTime')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
              {form.formState.errors.endTime && <p className="mt-2 text-xs text-red-600">{form.formState.errors.endTime.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input {...form.register('location')} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3" placeholder="Clinic 2" />
            </div>
            {form.formState.errors.location && <p className="mt-2 text-xs text-red-600">{form.formState.errors.location.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select {...form.register('status')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option>Active</option>
              <option>On-call</option>
              <option>Break</option>
              <option>Away</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
            <textarea {...form.register('notes')} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Add any shift notes" />
          </div>
        </div>

        <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">
          <Plus className="h-4 w-4" />
          Save shift
        </button>
      </form>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Overview</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Current roster</h3>
            </div>
            <div className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
              {activeCount} active
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button type="button" onClick={fetchShifts} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>

        <div className="space-y-3">
          {loading ? [1, 2, 3].map((row) => <div key={row} className="h-36 animate-pulse rounded-2xl bg-slate-100" />) : shifts.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No doctor shifts have been assigned.</div> : shifts.map((shift) => (
            <div key={shift.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{shift.doctorName}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>{shift.specialty}</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                  {shift.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                  <Clock3 className="h-3 w-3" />
                  {shift.startTime} - {shift.endTime}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                  <MapPin className="h-3 w-3" />
                  {shift.location}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {shift.workingDays.map((day) => (
                  <span key={`${shift.id}-${day}`} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
                    {day.slice(0, 3)}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-sm text-slate-600">{shift.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
