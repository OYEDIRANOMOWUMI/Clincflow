import React, { useState, useEffect } from 'react'
import { Calendar, User, FileText, Loader2, CheckCircle2, Plus, RefreshCw, X, CalendarClock, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import { getSession } from '../../auth'
import MedicationReminderPanel from '../../components/MedicationReminderPanel'
import MedicationReminderForm from '../../components/MedicationReminderForm'

const demoAppointments = [
  {
    _id: 'demo-appointment-1',
    doctorId: { name: 'Dr. Jane Smith' },
    date: '2026-09-10T09:00:00.000Z',
    reason: 'Follow-up consultation',
    status: 'confirmed'
  },
  {
    _id: 'demo-appointment-2',
    doctorId: { name: 'Dr. Daniel Lee' },
    date: '2026-09-12T14:30:00.000Z',
    reason: 'Lab review',
    status: 'pending'
  }
]

export default function PatientDashboard() {
  const session = getSession()
  const [appointments, setAppointments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [health, setHealth] = useState({
    bloodType: 'O+',
    allergies: 'Penicillin',
    chronicConditions: 'Hypertension',
    lastVisit: '2026-08-25'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/appointments`, { headers: getAuthHeaders() })
      setAppointments(response.data?.appointments || [])
    } catch (err) {
      console.error('Error fetching patient data:', err)
      if (getSession()?.token === 'demo-token' && err.response?.status === 401) {
        setAppointments(demoAppointments)
        return
      }
      setError(err.response?.data?.message || 'Unable to load your health information.')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-emerald-100 text-emerald-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const upcomingAppointments = appointments.filter((apt) => {
    const status = String(apt.status || '').toLowerCase()
    return status !== 'completed' && status !== 'cancelled'
  })

  const filteredAppointments = upcomingAppointments.filter(apt => {
    const query = searchQuery.toLowerCase()
    return (
      (apt.doctorId?.name || '').toLowerCase().includes(query) ||
      (apt.reason || apt.issue || '').toLowerCase().includes(query) ||
      (apt.status || '').toLowerCase().includes(query)
    )
  })

  const handleCancelAppointment = async () => {
    if (!selectedAppointment?._id) return
    try {
      setActionLoading(true)
      if (getSession()?.token === 'demo-token') {
        setAppointments((current) => current.filter((apt) => apt._id !== selectedAppointment._id))
        setShowCancelModal(false)
        setCancelReason('')
        setSelectedAppointment(null)
        return
      }
      await axios.delete(`${API_URL}/appointments/${selectedAppointment._id}`, {
        data: { reason: cancelReason || 'Patient cancelled the appointment' },
        headers: getAuthHeaders()
      })
      setShowCancelModal(false)
      setCancelReason('')
      setSelectedAppointment(null)
      await fetchPatientData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel this appointment.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment?._id || !rescheduleDate) return
    try {
      setActionLoading(true)
      if (getSession()?.token === 'demo-token') {
        setAppointments((current) => current.map((apt) =>
          apt._id === selectedAppointment._id ? { ...apt, date: new Date(rescheduleDate).toISOString(), status: 'pending' } : apt
        ))
        setShowRescheduleModal(false)
        setSelectedAppointment(null)
        setRescheduleDate('')
        return
      }
      await axios.put(`${API_URL}/appointments/${selectedAppointment._id}/reschedule`, {
        newDateTime: rescheduleDate
      }, { headers: getAuthHeaders() })
      setShowRescheduleModal(false)
      setSelectedAppointment(null)
      setRescheduleDate('')
      await fetchPatientData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reschedule this appointment.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome, {session?.user?.name || 'Patient'}</h1>
                <p className="text-emerald-100 mt-2">Manage your health and appointments</p>
              </div>
              <button type="button" onClick={fetchPatientData} disabled={loading} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Blood Type', value: health.bloodType, icon: 'A' },
            { label: 'Allergies', value: health.allergies, icon: '⚠' },
            { label: 'Chronic Conditions', value: health.chronicConditions, icon: '📋' },
            { label: 'Last Visit', value: health.lastVisit, icon: '📅' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase text-slate-600">{item.label}</p>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Need to see a doctor?</h2>
              <p className="text-blue-100 mt-1">Book an appointment with our available healthcare professionals</p>
            </div>
            <Link to="/book-appointment" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Book Appointment
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">My Appointments</h2>
          </div>

          {loading ? (
            <div className="space-y-3 p-6" aria-label="Loading appointments">{[1, 2, 3, 4].map((row) => <div key={row} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center"><p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p><button type="button" onClick={fetchPatientData} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Retry</button></div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center text-slate-600"><p>No upcoming appointments scheduled yet.</p></div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by doctor name, reason, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Doctor</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Reason</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-slate-600">No appointments match your search.</td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{apt.doctorId?.name || 'Dr. Assigned'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(apt.date || apt.createdAt)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{apt.reason || apt.issue}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)} capitalize`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => { setSelectedAppointment(apt); setRescheduleDate(apt.date ? new Date(apt.date).toISOString().slice(0, 16) : ''); setShowRescheduleModal(true); }} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Reschedule</button>
                              <button type="button" onClick={() => { setSelectedAppointment(apt); setShowCancelModal(true); }} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">Cancel</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {showCancelModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Cancel appointment</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">Confirm cancellation</h3>
                </div>
                <button type="button" onClick={() => setShowCancelModal(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 text-sm text-slate-600">This appointment with {selectedAppointment.doctorId?.name || 'your doctor'} on {formatDateTime(selectedAppointment.date || selectedAppointment.createdAt)} will be cancelled.</p>
              <textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} rows="3" placeholder="Optional reason for cancellation" className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-500" />
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCancelModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                <button type="button" disabled={actionLoading} onClick={handleCancelAppointment} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{actionLoading ? 'Cancelling...' : 'Cancel appointment'}</button>
              </div>
            </div>
          </div>
        )}

        {showRescheduleModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Reschedule appointment</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">New appointment time</h3>
                </div>
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  <CalendarClock className="mr-2 inline h-4 w-4" />
                  Select a new time
                </label>
                <input type="datetime-local" value={rescheduleDate} onChange={(event) => setRescheduleDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                <button type="button" disabled={actionLoading || !rescheduleDate} onClick={handleRescheduleAppointment} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{actionLoading ? 'Updating...' : 'Reschedule'}</button>
              </div>
            </div>
          </div>
        )}

        <MedicationReminderForm />
        <MedicationReminderPanel />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Medical Records', desc: 'View your complete medical history', to: '/dashboard/billing' },
            { title: 'Prescriptions', desc: 'Manage active medications', to: '/dashboard/patient' },
            { title: 'Lab Results', desc: 'Check recent test results', to: '/dashboard/patient' }
          ].map((item) => (
            <Link key={item.title} to={item.to} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition cursor-pointer">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
