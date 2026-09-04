import React, { useState, useEffect } from 'react'
import { Phone, Clock, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import { getSession } from '../../auth'
import PatientVolumeCards from '../../components/PatientVolumeCards'

export default function ReceptionistDashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    checkedInToday: 0,
    upcomingToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: getAuthHeaders()
      })
      const appts = response.data?.appointments || []
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayAppts = appts.filter(a => {
        const aptDate = new Date(a.date)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate.getTime() === today.getTime()
      })
      
      setAppointments(appts.slice(0, 10))
      setStats({
        todayAppointments: todayAppts.length,
        pendingAppointments: appts.filter(a => a.status === 'pending').length,
        checkedInToday: todayAppts.filter(a => a.status === 'checked-in').length,
        upcomingToday: todayAppts.filter(a => ['pending', 'confirmed'].includes(a.status)).length
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      if (getSession()?.token === 'demo-token' && err.response?.status === 401) {
        setAppointments([])
        setStats({ todayAppointments: 0, pendingAppointments: 0, checkedInToday: 0, upcomingToday: 0 })
        return
      }
      setError(err.response?.data?.message || 'Unable to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'checked-in': 'bg-emerald-100 text-emerald-800',
      completed: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const handleAction = (type) => {
    if (type === 'checkin') {
      setAppointments((current) => current.length ? current.map((item, index) => index === 0 ? { ...item, status: 'checked-in' } : item) : current)
      window.alert('Patient was checked in successfully.')
      return
    }

    if (type === 'schedule') {
      navigate('/dashboard/receptionist/appointments')
      return
    }

    if (type === 'call') {
      window.location.href = 'tel:+2349072606277'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
              <Phone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">Reception Desk</h1>
              <p className="text-slate-600">Manage patient arrivals and appointments</p>
            </div>
            <button type="button" onClick={fetchDashboardData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>
        </div>

        <PatientVolumeCards />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Today\'s Appointments', value: stats.todayAppointments, color: 'from-blue-500 to-blue-600', icon: '📅' },
            { label: 'Pending Check-in', value: stats.pendingAppointments, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
            { label: 'Checked In', value: stats.checkedInToday, color: 'from-emerald-500 to-emerald-600', icon: '✓' },
            { label: 'Upcoming Today', value: stats.upcomingToday, color: 'from-purple-500 to-purple-600', icon: '🔔' }
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

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
          </div>

          {loading ? (
            <div className="space-y-3 p-6" aria-label="Loading appointments">{[1, 2, 3, 4].map((row) => <div key={row} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center"><p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p><button type="button" onClick={fetchDashboardData} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Retry</button></div>
          ) : appointments.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-600">
              <p>No appointments scheduled today.</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-600">
              <p>No appointments scheduled</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {appointments.slice(0, 8).map((apt) => (
                <div key={apt._id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{apt.patientId?.name || apt.patientName}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatTime(apt.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-2">{apt.doctorId?.name || 'Dr. Assigned'}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Check In Patient', desc: 'Mark patients as arrived', type: 'checkin' },
            { title: 'View Full Schedule', desc: 'See all appointments', type: 'schedule' },
            { title: 'Call Center', desc: 'Contact patients', type: 'call' }
          ].map((action, idx) => (
            <button key={idx} type="button" onClick={() => handleAction(action.type)} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition text-left">
              <p className="font-semibold text-slate-900">{action.title}</p>
              <p className="text-sm text-slate-600 mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
