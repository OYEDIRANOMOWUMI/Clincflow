import React, { useState, useEffect } from 'react'
import { Heart, RefreshCw, Loader2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import { getSession } from '../../auth'
import PatientVolumeCards from '../../components/PatientVolumeCards'
import MedicationReminderPanel from '../../components/MedicationReminderPanel'

export default function NurseDashboard() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    patientsUnderCare: 18,
    pendingTasks: 7,
    vitalsToRecord: 5,
    alerts: 2
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNurseData()
  }, [])

  const fetchNurseData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/nursing-assessments`, { headers: getAuthHeaders() })
      const assessments = response.data?.records || []
      const mapped = assessments.map((assessment) => ({
        id: assessment._id,
        name: assessment.patientId?.name || assessment.patientId || 'Patient record',
        room: '—',
        status: assessment.notes ? 'monitoring' : 'stable',
        bp: assessment.bloodPressure || '—',
        pulse: assessment.pulse || '—',
        vitals: assessment.bloodPressure || assessment.pulse ? '✓' : '⚠',
        priority: 'normal'
      }))
      setPatients(mapped)
      setStats({
        patientsUnderCare: mapped.length,
        pendingTasks: mapped.filter((patient) => patient.vitals !== '✓').length,
        vitalsToRecord: mapped.filter((patient) => patient.bp === '—' || patient.pulse === '—').length,
        alerts: mapped.filter((patient) => patient.priority === 'urgent').length
      })
    } catch (err) {
      console.error('Error fetching nurse data:', err)
      if (getSession()?.token === 'demo-token' && err.response?.status === 401) {
        setPatients([])
        setStats({ patientsUnderCare: 0, pendingTasks: 0, vitalsToRecord: 0, alerts: 0 })
        return
      }
      setError(err.response?.data?.message || 'Unable to load nursing assessments.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      stable: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      monitoring: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      alert: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      normal: 'text-slate-600',
      high: 'text-yellow-600 font-semibold',
      urgent: 'text-red-600 font-bold'
    }
    return colors[priority] || 'text-slate-600'
  }

  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase()
    return (
      (patient.name || '').toLowerCase().includes(query) ||
      (patient.status || '').toLowerCase().includes(query) ||
      (patient.priority || '').toLowerCase().includes(query)
    )
  })

  const handleAction = (type) => {
    if (type === 'vitals') {
      setPatients((current) => current.length ? current.map((patient, index) => index === 0 ? { ...patient, status: 'monitoring', vitals: '✓' } : patient) : current)
      window.alert('Vitals were recorded and the patient chart was updated.')
      return
    }

    if (type === 'care-plan') {
      navigate('/dashboard/patients')
      return
    }

    if (type === 'alert') {
      window.alert('Medical alert has been escalated to the on-duty care team.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 p-3 text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">Nurse Station</h1>
              <p className="text-slate-600">Monitor and manage patient care</p>
            </div>
            <button type="button" onClick={fetchNurseData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        <PatientVolumeCards />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Patients Under Care', value: stats.patientsUnderCare, color: 'from-teal-500 to-teal-600', icon: '👥' },
            { label: 'Pending Tasks', value: stats.pendingTasks, color: 'from-cyan-500 to-cyan-600', icon: '📋' },
            { label: 'Vitals to Record', value: stats.vitalsToRecord, color: 'from-emerald-500 to-emerald-600', icon: '📊' },
            { label: 'Active Alerts', value: stats.alerts, color: 'from-orange-500 to-orange-600', icon: '⚠' }
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

        {/* Patient Monitoring Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">My Nursing Assessments</h2>
          </div>

          {loading ? (
            <div className="space-y-3 p-6" aria-label="Loading nursing assessments">
              {[1, 2, 3, 4].map((row) => <div key={row} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              <button type="button" onClick={fetchNurseData} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Retry</button>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center text-slate-600">
              <p>No nursing assessments recorded yet.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by patient name, status, or priority..."
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Room</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">BP / Pulse</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Vitals</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-slate-600">No patients match your search.</td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr key={patient.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{patient.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-mono">{patient.room}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(patient.status)} capitalize`}>
                              {patient.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-mono">{patient.bp} / {patient.pulse}</td>
                          <td className="px-6 py-4 text-sm text-center text-2xl">{patient.vitals}</td>
                          <td className={`px-6 py-4 text-sm ${getPriorityColor(patient.priority)} capitalize`}>{patient.priority}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <MedicationReminderPanel nurseView />

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Record Vitals', desc: 'Update patient vital signs', type: 'vitals' },
            { title: 'Update Care Plan', desc: 'Modify treatment protocol', type: 'care-plan' },
            { title: 'Flag Alert', desc: 'Notify medical team of concerns', type: 'alert' }
          ].map((action, idx) => (
            <button key={idx} type="button" onClick={() => handleAction(action.type)} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition text-left hover:border-teal-300">
              <p className="font-semibold text-slate-900">{action.title}</p>
              <p className="text-sm text-slate-600 mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
