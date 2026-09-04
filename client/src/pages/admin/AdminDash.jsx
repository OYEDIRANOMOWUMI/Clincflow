import { API_URL } from '../../api.js'
import React ,{useState, useEffect}from 'react'
import { Facebook, Linkedin, Users, UserPlus, LayoutDashboard, UserCheck, UserPlusIcon, LogOut, UserCog, PlusCircle, ShieldCheck, KeyRound } from 'lucide-react';
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../../auth';
import { getAuthHeaders } from '../../api.js';

const initialPatientForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  dob: '',
  sex: 'female',
  address: '',
  emergencyContact: ''
};

const AdminDash = () => {
  const [doctor, setDoctors] = useState([]);
  const [patient, setPatients] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [patientSubmitting, setPatientSubmitting] = useState(false);
  const [patientSuccess, setPatientSuccess] = useState('');
  const [staffMessage, setStaffMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState('');
  const navigate = useNavigate();
  const session = getSession();

  const handlePatientFormChange = (event) => {
    const { name, value } = event.target;
    setPatientForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddPatient = async (event) => {
    event.preventDefault();
    setPatientSubmitting(true);
    setPatientSuccess('');

    try {
      const payload = {
        ...patientForm,
        phone: patientForm.phone.trim(),
        address: patientForm.address.trim(),
        emergencyContact: patientForm.emergencyContact.trim(),
        name: patientForm.name.trim()
      };

      const response = await axios.post(`${API_URL}/user/hospital-patient`, payload, { headers: getAuthHeaders() });
      const createdPatient = response.data?.patient;
      setPatients((current) => [
        {
          _id: createdPatient?._id || createdPatient?.id || `patient-${Date.now()}`,
          patientId: createdPatient?.patientId || 'CF-PAT-NEW',
          userId: { name: createdPatient?.name || patientForm.name, email: createdPatient?.email || patientForm.email },
          createdAt: new Date().toISOString()
        },
        ...current
      ]);
      setPatientSuccess(`${createdPatient?.name || patientForm.name} was added successfully.`);
      setPatientForm(initialPatientForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to add patient');
    } finally {
      setPatientSubmitting(false);
    }
  };

  const handleSendStaffMessage = async (event) => {
    event.preventDefault();
    if (!selectedRecipient || !staffMessage.trim()) return;

    setSendingMessage(true);
    setMessageSent('');

    try {
      await axios.post(`${API_URL}/notifications/message`, {
        recipientId: selectedRecipient,
        message: staffMessage.trim()
      }, { headers: getAuthHeaders() });

      setMessageSent('Message sent to staff successfully.');
      setStaffMessage('');
      setSelectedRecipient('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    axios.get(`${API_URL}/admin/staff`, { headers: getAuthHeaders() })
      .then((response) => {
        setDoctors(response.data?.users || []);
      })
      .catch(() => {
        setError('Failed to fetch staff');
      });

    axios.get(`${API_URL}/admin/patients`, { headers: getAuthHeaders() })
      .then((response) => {
        setPatients(response.data?.patients || []);
      })
      .catch(() => {
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

    axios.get(`${API_URL}/notifications`, { headers: getAuthHeaders() })
      .then((response) => setNotifications(response.data?.notifications || []))
      .catch(() => setNotifications([]));
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
              to="/dashboard/admin/settings"
              className="flex items-center space-x-2 px-4 py-2 border-2 border-emerald-800 text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <UserCog size={18} />
              <span>Settings</span>
            </Link>
            <Link
              to="/doctorsignup"
              className="flex items-center space-x-2 px-4 py-2 border-2 border-emerald-800 text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <UserCheck size={18} />
              <span>Sign Up Staff</span>
            </Link>
            <Link
              to="/doctor"
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-900 text-white font-semibold rounded-lg hover:bg-emerald-950 transition-colors"
            >
              <KeyRound size={18} />
              <span>Login as Staff</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                clearSession();
                navigate('/login');
              }}
              className="flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-950"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto mt-6 w-full max-w-7xl px-8">
        <div className="rounded-2xl border-2 border-emerald-700 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-5 text-white shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">Restricted access</p>
              <h2 className="mt-2 text-2xl font-bold">Carevyn Administrative Portal</h2>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse" />
              Admin only
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-100">
            Staff and patient sign-in links are available only from this dashboard after hospital setup. Public visitors do not see them on the homepage.
          </p>
        </div>
      </section>

      {notifications.length > 0 && (
        <section className="mx-auto mt-6 w-full max-w-7xl px-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <h2 className="font-bold">Recent notifications</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {notifications.slice(0, 5).map((notification) => <li key={notification._id}>{notification.message}</li>)}
            </ul>
          </div>
        </section>
      )}

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
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Operations</p>
                <h3 className="mt-2 text-2xl font-bold text-emerald-950">Add patient</h3>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-900"><PlusCircle size={22} /></div>
            </div>

            <form onSubmit={handleAddPatient} className="grid gap-4 md:grid-cols-2">
              <input name="name" value={patientForm.name} onChange={handlePatientFormChange} required placeholder="Full name" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700" />
              <input name="email" type="email" value={patientForm.email} onChange={handlePatientFormChange} required placeholder="Email" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700" />
              <input name="password" type="password" value={patientForm.password} onChange={handlePatientFormChange} required placeholder="Password" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700" />
              <input name="phone" value={patientForm.phone} onChange={handlePatientFormChange} placeholder="Phone" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700" />
              <input name="dob" type="date" value={patientForm.dob} onChange={handlePatientFormChange} className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700" />
              <select name="sex" value={patientForm.sex} onChange={handlePatientFormChange} className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700">
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <input name="address" value={patientForm.address} onChange={handlePatientFormChange} placeholder="Address" className="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700" />
              <input name="emergencyContact" value={patientForm.emergencyContact} onChange={handlePatientFormChange} placeholder="Emergency contact" className="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm outline-none focus:border-emerald-700" />

              <div className="md:col-span-2 flex items-center gap-4">
                <button type="submit" disabled={patientSubmitting} className="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-950 disabled:opacity-60">
                  {patientSubmitting ? 'Adding...' : 'Save patient'}
                </button>
                <Link to="/doctor" className="inline-flex items-center gap-2 rounded-xl border border-emerald-800 px-5 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50">
                  <UserCog size={18} /> Login as staff
                </Link>
              </div>
            </form>

            {patientSuccess && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{patientSuccess}</p>}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-900 p-6 text-white shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3"><ShieldCheck size={22} /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Access</p>
                <h3 className="mt-1 text-2xl font-bold">Staff portal</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-emerald-100">After you add and verify staff accounts, use the secure staff portal to log in and manage consultations, admissions, and queue tasks.</p>
            <div className="mt-6 space-y-3">
              <Link to="/doctor" className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50">
                <span>Staff Login Portal</span>
                <KeyRound size={18} />
              </Link>
              <Link to="/patient-login" className="flex items-center justify-between rounded-xl border border-white/20 bg-emerald-800/60 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">
                <span>Patient Login Portal</span>
                <UserPlus size={18} />
              </Link>
              <Link to="/checkUser" className="flex items-center justify-between rounded-xl border border-white/20 bg-emerald-800/60 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">
                <span>Review staff accounts</span>
                <UserCheck size={18} />
              </Link>
            </div>

            <form onSubmit={handleSendStaffMessage} className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">Message staff</h4>
              <select value={selectedRecipient} onChange={(event) => setSelectedRecipient(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-3 text-sm text-white outline-none placeholder:text-emerald-100/80">
                <option value="" className="text-slate-900">Select staff member</option>
                {doctor.map((member) => (
                  <option key={member._id} value={member._id} className="text-slate-900">{member.name} ({member.role})</option>
                ))}
              </select>
              <textarea value={staffMessage} onChange={(event) => setStaffMessage(event.target.value)} rows="3" placeholder="Send an update or instruction to the selected staff member" className="mt-3 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-3 text-sm text-white outline-none placeholder:text-emerald-100/80" />
              <button type="submit" disabled={sendingMessage} className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50 disabled:opacity-60">
                {sendingMessage ? 'Sending...' : 'Send message'}
              </button>
              {messageSent && <p className="mt-2 text-xs text-emerald-100">{messageSent}</p>}
            </form>
          </div>
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