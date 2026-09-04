import { useEffect, useState } from 'react'
import { CheckCircle2, Clock3, Loader2, PauseCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../api'
import { getSession } from '../auth'

export default function MedicationReminderPanel({ nurseView = false }) {
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
      if (getSession()?.token === 'demo-token' && requestError.response?.status === 401) {
        setReminders([])
        return
      }
      setError(requestError.response?.data?.message || 'Unable to load medication reminders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReminders() }, [])

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/medication-reminders/${id}/status`, { status }, { headers: getAuthHeaders() })
      setReminders((current) => current.map((reminder) => reminder._id === id ? { ...reminder, ...response.data.reminder } : reminder))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update medication reminder')
    }
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Medication safety</p><h2 className="mt-1 text-xl font-bold text-slate-900">{nurseView ? 'Patient medication reminders' : 'My medication reminders'}</h2></div>
        <button type="button" onClick={fetchReminders} disabled={loading} aria-label="Refresh medication reminders" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      {error && <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><span>{error}</span><button type="button" onClick={fetchReminders} className="font-semibold underline">Retry</button></div>}
      {loading ? <div className="space-y-3">{[1, 2, 3].map((row) => <div key={row} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}</div> : reminders.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No medication reminders are available.</div> : <div className="space-y-3">{reminders.map((reminder) => <div key={reminder._id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{reminder.medicationName}</p>{nurseView && <p className="text-sm text-slate-500">{reminder.patientId?.userId?.name || 'Patient'}</p>}<p className="mt-1 text-sm text-slate-600">{reminder.frequency}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${['active', 'approved'].includes(reminder.status) ? 'bg-emerald-100 text-emerald-800' : ['pending', 'paused'].includes(reminder.status) ? 'bg-amber-100 text-amber-800' : reminder.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>{reminder.status}</span></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Until {new Date(reminder.endDate).toLocaleDateString()}</span>{reminder.reminderTimes?.length > 0 && <span>At {reminder.reminderTimes.join(', ')}</span>}</div>{['active', 'approved'].includes(reminder.status) && <div className="mt-3 flex gap-2"><button type="button" onClick={() => updateStatus(reminder._id, 'paused')} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50"><PauseCircle className="h-3.5 w-3.5" /> Pause</button><button type="button" onClick={() => updateStatus(reminder._id, 'completed')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</button></div>}</div>)}</div>}
    </section>
  )
}
