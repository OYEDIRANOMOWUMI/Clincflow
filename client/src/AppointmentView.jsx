import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, Loader2, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { API_URL, getAuthHeaders } from './api.js'
import { buildWaUrl } from './utils/phone'

const AppointmentView = ({ onComplete }) => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firstName: '', phoneNumber: '', department: 'Others', issue: '', date: '', time: '' })
  const [error, setError] = useState('')
  const [confirmationUrl, setConfirmationUrl] = useState('')

  useEffect(() => window.scrollTo(0, 0), [])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${API_URL}/patient/appointment`, form, { headers: getAuthHeaders() })
      const saved = response.data?.appointment
      const whatsappUrl = buildWaUrl(form.phoneNumber, `Carevyn appointment request for ${saved?.department || form.department} was received.`)
      if (whatsappUrl) setConfirmationUrl(whatsappUrl)
      onComplete?.()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit appointment request. Please log in and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-stone-100 py-16 px-6 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="bg-[#064E3B] md:w-1/3 p-10 text-stone-50 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">Appointment</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4"><Phone size={18} /><span className="text-sm font-medium">+234 9072606277</span></div>
              <div className="flex items-center gap-4"><MapPin size={18} /><span className="text-sm font-medium">Carevyn Hospital</span></div>
            </div>
          </div>
          <div className="mt-12 text-xs flex items-center text-emerald-400"><ShieldCheck size={16} className="mr-2" /> Carevyn Secure</div>
        </div>
        <div className="p-10 md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required name="firstName" value={form.firstName} onChange={updateField} placeholder="Full name" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none" />
              <input required name="phoneNumber" value={form.phoneNumber} onChange={updateField} placeholder="080..." className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none" />
            </div>
            <select required name="department" value={form.department} onChange={updateField} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none">
              {['Others', 'General Medicine', 'Paediatrics', 'Surgery', 'O&G', 'Dental', 'Eye', 'ENT', 'Orthopaedics'].map((department) => <option key={department}>{department}</option>)}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2"><Calendar size={18} /><input required type="date" name="date" value={form.date} onChange={updateField} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3" /></label>
              <input required type="time" name="time" value={form.time} onChange={updateField} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3" />
            </div>
            <textarea required name="issue" value={form.issue} onChange={updateField} rows="4" placeholder="Symptoms or reason for visit" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none resize-none" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            {confirmationUrl && <a href={confirmationUrl} target="_blank" rel="noreferrer" className="block text-sm text-emerald-700 underline">Open WhatsApp confirmation</a>}
            <button type="submit" disabled={loading} className="w-full bg-[#064E3B] text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="animate-spin" size={20} />}{loading ? 'Processing...' : 'Request appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AppointmentView
