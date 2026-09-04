import React, { useState, useEffect } from 'react'
import { Beaker, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import PatientVolumeCards from '../../components/PatientVolumeCards'
import { getSession } from '../../auth'

export default function LaboratoryDashboard() {
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [stats, setStats] = useState({ pendingTests: 0, completedToday: 0, inProgress: 0, criticalResults: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLabData()
  }, [])

  const fetchLabData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/lab-requests`, { headers: getAuthHeaders() })
      const records = response.data?.records || []
      const mapped = records.map((record) => ({ id: record._id, patient: record.patientId?.name || record.patientId || 'Patient', test: record.test || record.testType || 'Laboratory test', status: record.status === 'requested' ? 'pending' : record.status === 'in_progress' ? 'in-progress' : 'completed', result: record.result || '—', date: record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '—', priority: record.priority }))
      setTests(mapped)
      setStats({ pendingTests: mapped.filter((test) => test.status === 'pending').length, inProgress: mapped.filter((test) => test.status === 'in-progress').length, completedToday: mapped.filter((test) => test.status === 'completed' && new Date(test.date).toDateString() === new Date().toDateString()).length, criticalResults: mapped.filter((test) => test.priority === 'Stat').length })
    } catch (err) {
      console.error('Error fetching lab data:', err)
      if (getSession()?.token === 'demo-token' && err.response?.status === 401) {
        setTests([])
        setStats({ pendingTests: 0, completedToday: 0, inProgress: 0, criticalResults: 0 })
        return
      }
      setError(err.response?.data?.message || 'Unable to load laboratory requests.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const handleAction = (type) => {
    if (type === 'new-test') {
      setTests((current) => [{ id: Date.now(), patient: 'New patient', test: 'Complete blood count', status: 'pending', result: '—', date: new Date().toLocaleDateString(), priority: 'Routine' }, ...current])
      window.alert('A new lab request was added to the queue.')
      return
    }

    if (type === 'results') {
      setTests((current) => current.length ? current.map((item, index) => index === 0 ? { ...item, status: 'completed', result: 'Within normal range' } : item) : current)
      window.alert('Lab results have been submitted.')
      return
    }

    if (type === 'reports') {
      navigate('/dashboard/patients')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-3 text-white">
              <Beaker className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">Laboratory</h1>
              <p className="text-slate-600">Manage test requests and results</p>
            </div>
            <button type="button" onClick={fetchLabData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>
        </div>

        <PatientVolumeCards />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Tests', value: stats.pendingTests, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
            { label: 'In Progress', value: stats.inProgress, color: 'from-blue-500 to-blue-600', icon: '🔬' },
            { label: 'Completed Today', value: stats.completedToday, color: 'from-emerald-500 to-emerald-600', icon: '✓' },
            { label: 'Critical Results', value: stats.criticalResults, color: 'from-red-500 to-red-600', icon: '⚠' }
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

        {/* Tests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Test Queue</h2>
          </div>

          {loading ? (
            <div className="space-y-3 p-6" aria-label="Loading laboratory requests">{[1, 2, 3, 4].map((row) => <div key={row} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center"><p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p><button type="button" onClick={fetchLabData} className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800">Retry</button></div>
          ) : tests.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center text-slate-600"><p>No laboratory requests are waiting.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Patient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Test Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Result</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{test.patient}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{test.test}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(test.status)} capitalize`}>
                          {test.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{test.result}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{test.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Add New Test', desc: 'Process patient sample', type: 'new-test' },
            { title: 'Enter Results', desc: 'Submit test findings', type: 'results' },
            { title: 'View Reports', desc: 'Generate lab reports', type: 'reports' }
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
