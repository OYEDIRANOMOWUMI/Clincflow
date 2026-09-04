import { useEffect, useState } from 'react'
import { BellRing, Check, Loader2, RefreshCw, X } from 'lucide-react'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'

export default function MedicationReminderManagement() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReminders = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/medication-reminders`, { headers: getAuthHeaders() })
      setReminders(response.data?.reminders || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load medication reminders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReminders() }, [])

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/medication-reminders/${id}/status`, { status }, { headers: getAuthHeaders() })
      setReminders((current) => current.map((reminder) => reminder._id === id ? { ...reminder, status } : reminder))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update reminder')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Clinical review</p>
          <h1 className="text-3xl font-bold text-slate-900">Medication reminders</h1>
          <p className="mt-1 text-slate-600">Approve patient-submitted reminder schedules before they become active.</p>
        </div>
        <button type="button" onClick={fetchReminders} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? <div className="flex h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-emerald-700" /></div> : reminders.length === 0 ? <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500"><BellRing className="h-8 w-8" /><p>No medication reminders found.</p></div> : <div className="divide-y divide-slate-200">{reminders.map((reminder) => <div key={reminder._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-bold text-slate-900">{reminder.medicationName}</p><p className="text-sm text-slate-600">{reminder.patientId?.userId?.name || 'Patient'} · {reminder.frequency}{reminder.reminderTimes?.length ? ` · ${reminder.reminderTimes.join(', ')}` : ''}</p><p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{reminder.status}</p></div>{reminder.status === 'pending' && <div className="flex gap-2"><button type="button" onClick={() => updateStatus(reminder._id, 'approved')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"><Check className="h-4 w-4" /> Approve</button><button type="button" onClick={() => updateStatus(reminder._id, 'rejected')} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><X className="h-4 w-4" /> Reject</button></div>}</div>)}</div>}
      </section>
    </div>
  )
}
