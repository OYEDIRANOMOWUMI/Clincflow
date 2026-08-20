import { API_URL } from '../../api.js'
import React ,{useState, useEffect}from 'react'
import { Facebook, Linkedin, Users, UserPlus, LayoutDashboard, UserCheck, UserPlusIcon, LogOut } from 'lucide-react';
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../../auth';

const AdminDash = () => {
  const [doctor, setDoctors] = useState([]);
  const [patient, setPatients] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    axios.get(`${API_URL}/admin/getUsers`)
      .then((response) => {
        setDoctors(response.data);
      })
      .catch((err) => {
        setError('Failed to fetch patients');
      });

    axios.get(`${API_URL}/admin/getPatient`)
      .then((response) => {
        setPatients(response.data);
      })
      .catch((err) => {
        setError('Failed to fetch patients');
      });

    const token = session?.token;
    axios.get(`${API_URL}/availability/admin`, {
      headers: {
        Authorization: `Bearer ${token || ''}`
      }
    })
      .then((response) => {
        setAvailability(response.data?.availability || []);
      })
      .catch((err) => {
        if (err?.response?.status !== 401) {
          console.error('admin availability fetch failed', err);
        }
      })
      .finally(() => setLoading(false));
  }, [session?.token]);

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-emerald-900">
            <LayoutDashboard size={28} />
            <span className="text-xl font-bold tracking-tight">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-emerald-700">{session?.user?.email || 'Admin'}</span>
            <Link
              to="/checkUser"
              className="flex items-center space-x-2 px-4 py-2 border-2 border-emerald-800 text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <UserCheck size={18} />
              <span>Check Users</span>
            </Link>
            <Link
              to="/doctorsignup"
              className="flex items-center space-x-2 px-4 py-2 border-2 border-emerald-800 text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <UserCheck size={18} />
              <span>Sign Up Doctors</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                clearSession();
                navigate('/admin');
              }}
              className="flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-950"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 px-8 pt-8">
        <div className="bg-emerald-800 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-emerald-100 uppercase tracking-wider text-sm font-semibold">Total Doctors</p>
            <h2 className="text-4xl font-bold">{doctor.length}</h2>
          </div>
          <Users size={48} className="opacity-20" />
        </div>

        <div className="bg-white border-2 border-emerald-800 p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-emerald-800 uppercase tracking-wider text-sm font-semibold">Total Patients</p>
            <h2 className="text-4xl font-bold text-emerald-900">{patient.length}</h2>
          </div>
          <UserPlus size={48} className="text-emerald-800 opacity-20" />
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-emerald-900 p-4">
            <h3 className="text-white font-semibold">Physician Directory</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900">
                <th className="p-4 font-bold border-b">Doctor Name</th>
                <th className="p-4 font-bold border-b">Specialization</th>
                <th className="p-4 font-bold border-b">Email</th>
                <th className="p-4 font-bold border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {doctor.map((doctorItem, index) => (
                <tr key={`${doctorItem?._id || doctorItem?.email || doctorItem?.name || 'doctor'}-${index}`} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b text-gray-700 font-medium">{doctorItem.name}</td>
                  <td className="p-4 border-b text-gray-600">{doctorItem.email}</td>
                  <td className="p-4 border-b text-gray-600">{doctorItem.phoneNumber || '—'}</td>
                  <td className="p-4 border-b">
                    <span className='px-3 py-1 rounded-full text-xs font-bold  bg-emerald-100 text-emerald-700 '>
                        Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-emerald-900 p-4">
            <h3 className="text-white font-semibold">Doctor Availability Overview</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900">
                <th className="p-4 font-bold border-b">Doctor Name</th>
                <th className="p-4 font-bold border-b">Date</th>
                <th className="p-4 font-bold border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {availability.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-gray-500">No availability records yet.</td>
                </tr>
              ) : (
                availability.map((item, index) => (
                  <tr key={`${item.doctorId}-${item.date}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-b text-gray-700 font-medium">{item.doctorName}</td>
                    <td className="p-4 border-b text-gray-600">{item.date}</td>
                    <td className="p-4 border-b">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="flex justify-center space-x-8 mb-4">
          <a href="#" className="text-emerald-900 hover:text-emerald-600 transition-colors">
            <Facebook size={24} />
          </a>
          <a href="#" className="text-emerald-900 hover:text-emerald-600 transition-colors">
            <Linkedin size={24} />
          </a>
          <a href="#" className="text-emerald-900 hover:text-emerald-600 transition-colors">
          </a>
        </div>
        <p className="text-center text-gray-500 text-sm">
          &copy; 2026 Healthcare Admin Portal. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default AdminDash