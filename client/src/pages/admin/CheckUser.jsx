import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, CheckCircle2, Shield, User, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { API_URL, getAuthHeaders } from '../../api.js'

const roleLabels = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  pharmacy: 'Pharmacist',
  laboratory: 'Laboratory Staff',
  receptionist: 'Receptionist'
}

const CheckUser = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  const loadStaff = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/staff`, { headers: getAuthHeaders() })
      setStaff(response.data?.users || [])
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load staff accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const toggleStatus = async (member) => {
    setUpdatingId(member._id)
    try {
      const response = await axios.patch(`${API_URL}/admin/staff/${member._id}/status`, { isActive: !member.isActive }, { headers: getAuthHeaders() })
      setStaff((current) => current.map((item) => item._id === member._id ? response.data.user : item))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update staff status')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8f6] font-sans text-slate-800">
      <header className="border-b border-emerald-950/10 bg-white px-6 py-5 shadow-sm md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-900 text-white"><Shield size={22} /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Carevyn Admin</p><h1 className="text-2xl font-bold text-emerald-950">Staff Accounts</h1></div>
          </div>
          <Link to="/dashboard/admin" className="flex items-center gap-2 rounded-xl border border-emerald-900 px-4 py-2 text-sm font-bold text-emerald-900 hover:bg-emerald-50"><ArrowLeft size={16} /> Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Only staff created for this hospital are shown.</p><h2 className="mt-1 text-xl font-bold text-emerald-950">{staff.length} staff account{staff.length === 1 ? '' : 's'}</h2></div><Link to="/doctorsignup" className="rounded-xl bg-emerald-900 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">Sign Up Staff</Link></div>
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left">
            <thead className="bg-emerald-50 text-xs uppercase tracking-wider text-emerald-950"><tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && staff.length === 0 && <tr><td colSpan="5" className="px-5 py-16 text-center text-slate-500">No staff accounts have been created for this hospital.</td></tr>}
              {staff.map((member) => <tr key={member._id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-900"><User size={16} /></span><span className="font-semibold">{member.name}</span></div></td><td className="px-5 py-4 text-sm">{roleLabels[member.role] || member.role}</td><td className="px-5 py-4 text-sm text-slate-600">{member.email}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${member.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{member.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}{member.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-5 py-4"><button type="button" disabled={updatingId === member._id} onClick={() => toggleStatus(member)} className={`rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50 ${member.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}>{updatingId === member._id ? 'Updating...' : member.isActive ? 'Deactivate' : 'Activate'}</button></td></tr>)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default CheckUser
