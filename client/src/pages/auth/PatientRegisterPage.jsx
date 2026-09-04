import { useEffect, useState } from 'react'
import { ArrowRight, Building2, Loader2, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../api'
import { saveSession } from '../../auth'

const initialForm = { name: '', email: '', password: '', phone: '', dob: '', hospitalId: '' }

export default function PatientRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [hospitals, setHospitals] = useState([])
  const [loadingHospitals, setLoadingHospitals] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`${API_URL}/hospitals`)
      .then((response) => setHospitals(response.data?.hospitals || []))
      .catch(() => setError('Unable to load hospitals. Please try again.'))
      .finally(() => setLoadingHospitals(false))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await axios.post(`${API_URL}/patient/register`, form)
      const session = saveSession('patient', response.data.user, response.data.token)
      navigate('/dashboard/patient', { replace: true })
      return session
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your patient account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(15,23,42,0.35)]">
        <div className="grid md:grid-cols-[0.8fr_1.2fr]">
          <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-emerald-800 p-8 text-white md:p-10">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3"><Building2 className="h-7 w-7" /></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-100">Carevyn</p><h1 className="text-2xl font-bold">Patient portal</h1></div>
            </div>
            <h2 className="mt-16 text-4xl font-black leading-tight">Your care journey, in one place.</h2>
            <p className="mt-5 text-sm leading-relaxed text-blue-50">Create your secure patient account to request appointments, review prescriptions, and set medication reminders.</p>
          </section>

          <section className="p-8 md:p-12">
            <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">New patient</p><h2 className="mt-2 text-3xl font-black text-slate-900">Create your account</h2><p className="mt-2 text-sm text-slate-600">Your account will be linked to the hospital you select.</p></div>
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Full name<input name="name" value={form.name} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
              <label className="text-sm font-medium text-slate-700">Email<input name="email" type="email" value={form.email} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
              <label className="text-sm font-medium text-slate-700">Phone<input name="phone" value={form.phone} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
              <label className="text-sm font-medium text-slate-700">Date of birth<input name="dob" type="date" value={form.dob} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
              <label className="text-sm font-medium text-slate-700">Password<input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Choose hospital<select name="hospitalId" value={form.hospitalId} onChange={handleChange} required disabled={loadingHospitals} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><option value="">{loadingHospitals ? 'Loading hospitals...' : 'Select your hospital'}</option>{hospitals.map((hospital) => <option key={hospital._id} value={hospital._id}>{hospital.name}{hospital.address ? ` - ${hospital.address}` : ''}</option>)}</select></label>
              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{error}</p>}
              <button type="submit" disabled={submitting || loadingHospitals} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 md:col-span-2">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}{submitting ? 'Creating account...' : 'Create patient account'}</button>
            </form>
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600"><span>Already registered?</span><Link to="/login" className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800">Sign in <ArrowRight className="h-4 w-4" /></Link></div>
          </section>
        </div>
      </div>
    </main>
  )
}
