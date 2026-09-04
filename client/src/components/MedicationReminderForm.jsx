import { useState } from 'react'
import { BellPlus, Loader2 } from 'lucide-react'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../api'

export default function MedicationReminderForm({ onCreated }) {
  const [form, setForm] = useState({ medicationName: '', frequency: 'Once daily', reminderTime: '', endDate: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post(`${API_URL}/medication-reminders`, {
        medicationName: form.medicationName.trim(),
        frequency: form.frequency,
        reminderTimes: form.reminderTime ? [form.reminderTime] : [],
        startDate: new Date().toISOString(),
        endDate: form.endDate ? new Date(`${form.endDate}T23:59:59`).toISOString() : undefined
      }, { headers: getAuthHeaders() })
      setForm({ medicationName: '', frequency: 'Once daily', reminderTime: '', endDate: '' })
      setMessage('Reminder submitted for hospital approval.')
      onCreated?.(response.data?.reminder)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create medication reminder')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-700 p-2 text-white"><BellPlus className="h-5 w-5" /></div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Set a medication reminder</h2>
          <p className="text-sm text-slate-600">Choose when you want Carevyn to remind you to take your medicine.</p>
        </div>
      </div>
      {message && <p className="mb-4 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-800">{message}</p>}
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input name="medicationName" value={form.medicationName} onChange={handleChange} required placeholder="Medication name" className="rounded-lg border border-slate-300 bg-white px-3 py-2.5" />
        <select name="frequency" value={form.frequency} onChange={handleChange} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5">
          <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>Weekly</option>
        </select>
        <label className="text-sm text-slate-700">Reminder time<input name="reminderTime" type="time" value={form.reminderTime} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5" /></label>
        <label className="text-sm text-slate-700">Reminder end date<input name="endDate" type="date" min={new Date().toISOString().slice(0, 10)} value={form.endDate} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5" /></label>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 md:col-span-2">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Submitting...' : 'Submit reminder'}
        </button>
      </form>
    </section>
  )
}
