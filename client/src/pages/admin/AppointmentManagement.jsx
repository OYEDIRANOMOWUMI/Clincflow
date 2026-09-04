import React, { useState, useEffect } from 'react'
import { Calendar, Users, Clock, CheckCircle2, AlertCircle, Loader2, Plus, Eye, Edit2, Trash2 } from 'lucide-react'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import { getSession } from '../../auth'

export default function AdminAppointmentManagement() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  })

  // Fetch appointments
  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await axios.get(`${API_URL}/appointments`, {
        params,
        headers: getAuthHeaders()
      })
      setAppointments(response.data?.appointments || [])
      calculateStats(response.data?.appointments || [])
    } catch (err) {
      if (getSession()?.token === 'demo-token' && err.response?.status === 401) {
        setAppointments([])
        calculateStats([])
        setError('')
        return
      }
      setError('Failed to fetch appointments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (appts) => {
    setStats({
      total: appts.length,
      pending: appts.filter(a => a.status === 'pending').length,
      confirmed: appts.filter(a => a.status === 'confirmed').length,
      completed: appts.filter(a => a.status === 'completed').length
    })
  }

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      setActionLoading(true)
      await axios.put(
        `${API_URL}/appointments/${id}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      )
      setAppointments(prev =>
        prev.map(apt => apt._id === id ? { ...apt, status: newStatus } : apt)
      )
      setIsModalOpen(false)
      setSelectedAppointment(null)
    } catch (err) {
      setError('Failed to update appointment')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setActionLoading(true)
        await axios.delete(`${API_URL}/appointments/${id}`, {
          headers: getAuthHeaders()
        })
        setAppointments(prev => prev.filter(apt => apt._id !== id))
        setIsModalOpen(false)
      } catch (err) {
        setError('Failed to cancel appointment')
      } finally {
        setActionLoading(false)
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      'no-show': 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-300'
  }

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">Appointment Management</h1>
          </div>
          <p className="text-slate-600">View and manage all patient appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'from-blue-500 to-blue-600' },
            { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Confirmed', value: stats.confirmed, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Completed', value: stats.completed, color: 'from-purple-500 to-purple-600' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} text-white rounded-lg p-4 shadow-md`}
            >
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-600 text-lg">No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Patient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Doctor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Reason</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {apt.patientId?.name || apt.patientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {apt.doctorId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDateTime(apt.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">
                        {apt.reason || apt.issue}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)} capitalize`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt)
                            setIsModalOpen(true)
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Appointment Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Patient</p>
                <p className="text-lg font-semibold text-slate-900">{selectedAppointment.patientId?.name || selectedAppointment.patientName}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Doctor</p>
                <p className="text-lg font-semibold text-slate-900">{selectedAppointment.doctorId?.name || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date & Time</p>
                <p className="text-lg font-semibold text-slate-900">{formatDateTime(selectedAppointment.date)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Reason</p>
                <p className="text-slate-700">{selectedAppointment.reason || selectedAppointment.issue}</p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Notes</p>
                  <p className="text-slate-700">{selectedAppointment.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedAppointment.status)} capitalize`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'confirmed')}
                    disabled={actionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Confirm Appointment
                  </button>
                )}

                {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'pending') && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'completed')}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Mark as Completed
                  </button>
                )}

                <button
                  onClick={() => deleteAppointment(selectedAppointment._id)}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Cancel Appointment
                </button>

                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedAppointment(null)
                  }}
                  className="w-full bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
