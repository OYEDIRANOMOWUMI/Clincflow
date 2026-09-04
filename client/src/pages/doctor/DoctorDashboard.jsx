import React, { useState, useEffect } from 'react'
import { Stethoscope, RefreshCw, Loader2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import PatientVolumeCards from '../../components/PatientVolumeCards'
import { getSession } from '../../auth'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    patientsToday: 12,
    consultations: 8,
    pendingReferrals: 3,
    averageWaitTime: '15 min'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const session = getSession()

  useEffect(() => {
    fetchDoctorData()
  }, [])

  const fetchDoctorData = async () => {
    try {
      setLoading(true)
      setError('')
      const doctorId = session?.user?.id || session?.user?._id
      if (!doctorId) throw new Error('Your doctor account ID is missing. Please sign in again.')
      const response = await axios.get(`${API_URL}/appointments/doctor/${doctorId}`, { headers: getAuthHeaders() })
      const records = response.data?.appointments || []
      setAppointments(records)
      setStats((current) => ({
        ...current,
        pendingReferrals: records.filter((appointment) => appointment.status === 'pending').length,
        averageWaitTime: '—'
      }))
    } catch (err) {
      console.error('Error fetching doctor data:', err)
      if (getSession()?.token === 'demo-token' && err.response?.status === 401) {
        setAppointments([])
        setStats((current) => ({ ...current, patientsToday: 0, consultations: 0, pendingReferrals: 0, averageWaitTime: '—' }))
        return
      }
      setError(err.response?.data?.message || err.message || 'Unable to load your appointments.')
    } finally {
      setLoading(false)
    }
  }

  const todayAppointments = appointments.filter((appointment) => {
    const date = new Date(appointment.date)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  })

  const filteredAppointments = appointments.filter(apt => {
    const query = searchQuery.toLowerCase()
    return (
      (apt.patient || '').toLowerCase().includes(query) ||
      (apt.reason || '').toLowerCase().includes(query) ||
      (apt.status || '').toLowerCase().includes(query) ||
      (apt.patientName || '').toLowerCase().includes(query)
    )
  })

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'in-consultation': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-slate-100 text-slate-800 border-slate-300'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const handleDashboardAction = (type) => {
    if (type === 'record') {
      navigate('/dashboard/patients')
      return
    }

    if (type === 'follow-up') {
      setAppointments((current) => current.length ? current.map((item, index) => index === 0 ? { ...item, status: 'confirmed' } : item) : current)
      window.alert('Follow-up visit was scheduled for the next available slot.')
      return
    }

    if (type === 'prescription') {
      setAppointments((current) => current.length ? current.map((item, index) => index === 0 ? { ...item, status: 'in-consultation' } : item) : current)
      window.alert('Prescription draft has been prepared and sent for review.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
              <p className="text-slate-600">Manage your patients and consultations</p>
            </div>
            <button type="button" onClick={fetchDoctorData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        <PatientVolumeCards />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Patients Today', value: todayAppointments.length, color: 'from-blue-500 to-blue-600', icon: '👥' },
            { label: 'Consultations', value: todayAppointments.filter((appointment) => ['completed', 'in-consultation', 'In Consultation', 'Completed'].includes(appointment.status)).length, color: 'from-cyan-500 to-cyan-600', icon: '🏥' },
            { label: 'Pending Referrals', value: stats.pendingReferrals, color: 'from-teal-500 to-teal-600', icon: '📤' },
            { label: 'Avg Wait Time', value: stats.averageWaitTime, color: 'from-sky-500 to-sky-600', icon: '⏱' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white rounded-xl p-6 shadow-lg`}>
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <div className="flex items-end justify-between mt-3">
                <p className="text-3xl font-bold">{stat.value}</p>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
          </div>

          {loading ? (
            <div className="space-y-3 p-6" aria-label="Loading appointments">
              {[1, 2, 3, 4].map((row) => <div key={row} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              <button type="button" onClick={fetchDoctorData} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Retry</button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center text-slate-600">
              <p>No appointments assigned to you today.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by patient name, reason, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Patient</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Time</th>
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
                        <tr key={apt.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{apt.patient}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{apt.time}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{apt.reason}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)} capitalize`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button type="button" onClick={() => navigate('/dashboard/patients')} className="text-blue-600 hover:text-blue-700 font-semibold">View Record</button>
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

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'View Patient Record', desc: 'Access complete medical history', type: 'record' },
            { title: 'Schedule Follow-up', desc: 'Book next consultation', type: 'follow-up' },
            { title: 'Write Prescription', desc: 'Issue medication order', type: 'prescription' }
          ].map((action, idx) => (
            <button key={idx} type="button" onClick={() => handleDashboardAction(action.type)} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition text-left hover:border-blue-300">
              <p className="font-semibold text-slate-900">{action.title}</p>
              <p className="text-sm text-slate-600 mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
