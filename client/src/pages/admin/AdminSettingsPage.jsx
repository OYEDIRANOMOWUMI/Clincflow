import React, { useState, useEffect } from 'react'
import { Building2, Phone, Mail, MapPin, Plus, Edit2, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import { getSession } from '../../auth'

const demoHospitalProfile = {
  name: 'Carevyn General Hospital',
  address: '18 Wellness Avenue, Lagos',
  email: 'admin@clinicflow.com',
  phone: '+234 800 000 0000',
  contactLine: 'Emergency: +234 800 000 0001'
}

const demoDepartments = [
  { _id: 'demo-dept-1', name: 'Emergency', description: 'Urgent and trauma care' },
  { _id: 'demo-dept-2', name: 'Cardiology', description: 'Heart and vascular care' },
  { _id: 'demo-dept-3', name: 'Pediatrics', description: 'Children and adolescent care' }
]

export default function AdminSettingsPage() {
  const session = getSession()
  const [hospitalProfile, setHospitalProfile] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    contactLine: ''
  })
  const [departments, setDepartments] = useState([])
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' })
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creatingDept, setCreatingDept] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchHospitalData()
  }, [])

  const fetchHospitalData = async () => {
    try {
      setLoading(true)
      setError('')

      if (session?.token === 'demo-token') {
        setHospitalProfile(demoHospitalProfile)
        setDepartments(demoDepartments)
        return
      }

      const profileResponse = await axios.get(`${API_URL}/hospital/profile`, { headers: getAuthHeaders() })
      if (profileResponse.data?.hospital) {
        const profile = profileResponse.data.hospital
        setHospitalProfile({
          name: profile.name || '',
          address: profile.address || '',
          email: profile.email || '',
          phone: profile.phone || '',
          contactLine: profile.contactLine || ''
        })
      }

      try {
        const hospitalId = profileResponse.data.hospital._id || session?.user?.hospitalId
        const deptsResponse = await axios.get(`${API_URL}/hospitals/${hospitalId}/departments`, {
          headers: getAuthHeaders()
        })
        setDepartments(deptsResponse.data?.departments || [])
      } catch (deptErr) {
        console.warn('Departments endpoint not available:', deptErr.message)
        setDepartments([])
      }
    } catch (err) {
      console.error('Error fetching hospital data:', err)
      if (session?.token === 'demo-token') {
        setHospitalProfile(demoHospitalProfile)
        setDepartments(demoDepartments)
        return
      }
      setError(err.response?.data?.message || 'Unable to load hospital settings')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setHospitalProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await axios.patch(
        `${API_URL}/hospital/profile`,
        hospitalProfile,
        { headers: getAuthHeaders() }
      )

      if (response.data?.hospital) {
        setHospitalProfile({
          name: response.data.hospital.name || '',
          address: response.data.hospital.address || '',
          email: response.data.hospital.email || '',
          phone: response.data.hospital.phone || '',
          contactLine: response.data.hospital.contactLine || ''
        })
        setSuccess('Hospital profile updated successfully')
        setTimeout(() => setSuccess(''), 5000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update hospital profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateDepartment = async (e) => {
    e.preventDefault()
    if (!newDepartment.name.trim()) {
      setError('Department name is required')
      return
    }

    try {
      setCreatingDept(true)
      setError('')
      setSuccess('')

      const response = await axios.post(
        `${API_URL}/hospital/departments`,
        newDepartment,
        { headers: getAuthHeaders() }
      )

      if (response.data?.department) {
        setDepartments([...departments, response.data.department])
        setNewDepartment({ name: '', description: '' })
        setSuccess('Department created successfully')
        setTimeout(() => setSuccess(''), 5000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department')
    } finally {
      setCreatingDept(false)
    }
  }

  const handleUpdateDepartment = async (e) => {
    e.preventDefault()
    if (!editingDepartment?.name.trim()) {
      setError('Department name is required')
      return
    }

    try {
      setCreatingDept(true)
      setError('')
      setSuccess('')

      const response = await axios.patch(
        `${API_URL}/hospital/departments/${editingDepartment._id}`,
        { name: editingDepartment.name, description: editingDepartment.description },
        { headers: getAuthHeaders() }
      )

      if (response.data?.department) {
        setDepartments(departments.map(d => d._id === editingDepartment._id ? response.data.department : d))
        setEditingDepartment(null)
        setSuccess('Department updated successfully')
        setTimeout(() => setSuccess(''), 5000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department')
    } finally {
      setCreatingDept(false)
    }
  }

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return

    try {
      setError('')
      setSuccess('')
      await axios.delete(`${API_URL}/hospital/departments/${deptId}`, {
        headers: getAuthHeaders()
      })
      setDepartments(departments.filter(d => d._id !== deptId))
      setSuccess('Department deleted successfully')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <Building2 className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Hospital Settings</h1>
                <p className="text-emerald-100 mt-2">Manage your hospital profile and departments</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hospital Profile Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Hospital Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Building2 className="inline w-4 h-4 mr-2" />
                  Hospital Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={hospitalProfile.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter hospital name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={hospitalProfile.address}
                  onChange={handleProfileChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Enter hospital address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={hospitalProfile.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={hospitalProfile.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Line
                </label>
                <input
                  type="text"
                  name="contactLine"
                  value={hospitalProfile.contactLine}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter contact line"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Departments Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Departments</h2>

            {editingDepartment ? (
              <form onSubmit={handleUpdateDepartment} className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="font-semibold text-slate-900 mb-3">Edit Department</h3>
                <input
                  type="text"
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Department name"
                />
                <textarea
                  value={editingDepartment.description || ''}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Department description"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creatingDept}
                    className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {creatingDept ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDepartment(null)}
                    className="flex-1 bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateDepartment} className="mb-6 p-4 border border-emerald-200 rounded-lg bg-emerald-50">
                <h3 className="font-semibold text-slate-900 mb-3">Create Department</h3>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Department name"
                />
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Department description (optional)"
                />
                <button
                  type="submit"
                  disabled={creatingDept}
                  className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {creatingDept ? 'Creating...' : 'Create Department'}
                </button>
              </form>
            )}

            <div className="space-y-2">
              {departments.length === 0 ? (
                <p className="text-slate-500 py-4 text-center">No departments created yet</p>
              ) : (
                departments.map((dept) => (
                  <div key={dept._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{dept.name}</p>
                      {dept.description && <p className="text-sm text-slate-600">{dept.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingDepartment(dept)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
