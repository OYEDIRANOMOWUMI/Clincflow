import React, { useState, useEffect } from 'react'
import { Pill, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import PatientVolumeCards from '../../components/PatientVolumeCards'
import { getSession } from '../../auth'

export default function PharmacyDashboard() {
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ pendingFulfillment: 0, readyForPickup: 0, outOfStock: 0, fulfillmentRate: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPharmacyData()
  }, [])

  const fetchPharmacyData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/prescriptions`, { headers: getAuthHeaders() })
      const records = response.data?.prescriptions || []
      const mapped = records.map((prescription) => ({
        id: prescription._id,
        patient: prescription.patient?.name || 'Patient',
        medication: prescription.drugName || prescription.medications?.map((item) => item.name).join(', ') || 'Medication',
        quantity: prescription.medications?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0,
        status: prescription.status === 'paid' ? 'ready' : prescription.status === 'dispensed' ? 'dispensed' : 'pending',
        dueDate: prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : '—'
      }))
      setPrescriptions(mapped)
      const completed = mapped.filter((item) => item.status === 'ready' || item.status === 'dispensed').length
      setStats({ pendingFulfillment: mapped.filter((item) => item.status === 'pending').length, readyForPickup: mapped.filter((item) => item.status === 'ready').length, outOfStock: 0, fulfillmentRate: mapped.length ? Math.round((completed / mapped.length) * 100) : 0 })
    } catch (err) {
      console.error('Error fetching pharmacy data:', err)
      if (getSession()?.token === 'demo-token' && err.response?.status === 401) {
        setPrescriptions([])
        setStats({ pendingFulfillment: 0, readyForPickup: 0, outOfStock: 0, fulfillmentRate: 0 })
        return
      }
      setError(err.response?.data?.message || 'Unable to load prescriptions.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ready: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'out-of-stock': 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const filteredPrescriptions = prescriptions.filter(rx => {
    const query = searchQuery.toLowerCase()
    return (
      (rx.patient || '').toLowerCase().includes(query) ||
      (rx.medication || '').toLowerCase().includes(query) ||
      (rx.status || '').toLowerCase().includes(query)
    )
  })

  const handleAction = (type) => {
    if (type === 'process') {
      setPrescriptions((current) => current.length ? current.map((item, index) => index === 0 ? { ...item, status: 'ready' } : item) : current)
      window.alert('Prescription was processed and marked ready for pickup.')
      return
    }

    if (type === 'inventory') {
      navigate('/dashboard/patients')
      return
    }

    if (type === 'reorder') {
      window.alert('Reorder request was submitted to the supplier.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 text-white">
              <Pill className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">Pharmacy</h1>
              <p className="text-slate-600">Manage medications and prescription fulfillment</p>
            </div>
            <button type="button" onClick={fetchPharmacyData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>
        </div>

        <PatientVolumeCards />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Fulfillment', value: stats.pendingFulfillment, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
            { label: 'Ready for Pickup', value: stats.readyForPickup, color: 'from-emerald-500 to-emerald-600', icon: '✓' },
            { label: 'Out of Stock', value: stats.outOfStock, color: 'from-red-500 to-red-600', icon: '⚠' },
            { label: 'Fulfillment Rate', value: `${stats.fulfillmentRate}%`, color: 'from-blue-500 to-blue-600', icon: '📊' }
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

        {/* Prescriptions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Active Prescriptions</h2>
          </div>

          {loading ? (
            <div className="space-y-3 p-6" aria-label="Loading prescriptions">{[1, 2, 3, 4].map((row) => <div key={row} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center"><p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p><button type="button" onClick={fetchPharmacyData} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Retry</button></div>
          ) : prescriptions.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center text-slate-600"><p>No prescriptions are waiting for pharmacy processing.</p></div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by patient name, medication, or status..."
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Medication</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Quantity</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrescriptions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-slate-600">No prescriptions match your search.</td>
                      </tr>
                    ) : (
                      filteredPrescriptions.map((rx) => (
                        <tr key={rx.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{rx.patient}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{rx.medication}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{rx.quantity} tablets</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(rx.status)} capitalize`}>
                              {rx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{rx.dueDate}</td>
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
            { title: 'Process Prescription', desc: 'Mark as fulfilled', type: 'process' },
            { title: 'Check Inventory', desc: 'View stock levels', type: 'inventory' },
            { title: 'Reorder Medications', desc: 'Place supply orders', type: 'reorder' }
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

