import { useMemo, useState, useEffect } from 'react';
import { Bell, ClipboardList, Plus, Send, ShieldCheck, UserRound, Users, Calendar, Clock, Users2, Share2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { patientApi, adminApi } from '../../api';
import PatientVolumeCards from '../../components/PatientVolumeCards';
import { patientRecords as fallbackRecords } from '../../data/patientRecords';

const initialPatient = {
  name: '',
  email: '',
  password: '',
  phone: '',
  age: '',
  condition: '',
  status: 'Stable',
  diagnosis: '',
  notes: '',
  doctor: 'Dr. Aisha Bello',
  nurse: 'Nurse Grace',
  lastUpdated: new Date().toISOString().slice(0, 10),
};

export default function AdminDashboardPage() {
  const [records, setRecords] = useState(fallbackRecords);
  const [patientForm, setPatientForm] = useState(initialPatient);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('doctor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'doctor', phone: '' });
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState('');
  const [createdStaff, setCreatedStaff] = useState(null);
  const [staffRecords, setStaffRecords] = useState([]);

  useEffect(() => {
    fetchPatients();
    fetchStaff();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientApi.list();
      if (response.data?.patients?.length > 0) {
        setRecords(response.data.patients);
      } else {
        setRecords(fallbackRecords);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setRecords(fallbackRecords);
      setError('Using cached patient data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await adminApi.listStaff();
      setStaffRecords(response.data?.users || []);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setStaffRecords([]);
    }
  };

  const staffOptions = useMemo(
    () => [
      { value: 'doctor', label: 'Doctor team' },
      { value: 'nurse', label: 'Nursing team' },
      { value: 'receptionist', label: 'Reception desk' },
    ],
    []
  );

  const handlePatientChange = (event) => {
    const { name, value } = event.target;
    setPatientForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddPatient = async (event) => {
    event.preventDefault();
    if (!patientForm.name.trim() || !patientForm.condition.trim()) return;

    try {
      const nextRecord = {
        name: patientForm.name.trim(),
        email: patientForm.email.trim(),
        password: patientForm.password,
        phone: patientForm.phone.trim(),
        age: Number(patientForm.age) || 0,
        condition: patientForm.condition.trim(),
        status: patientForm.status,
        diagnosis: patientForm.diagnosis.trim(),
        notes: patientForm.notes.trim(),
        doctor: patientForm.doctor,
        nurse: patientForm.nurse,
        lastUpdated: patientForm.lastUpdated,
      };

      await adminApi.createPatient(nextRecord);
      await fetchPatients();
      setPatientForm(initialPatient);
    } catch (err) {
      setError('Failed to add patient');
      console.error(err);
    }
  };

  const handleStaffChange = (event) => {
    const { name, value } = event.target;
    setStaffForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddStaff = async (event) => {
    event.preventDefault();
    setStaffSubmitting(true);
    setStaffSuccess('');
    setCreatedStaff(null);
    setError(null);
    try {
      await adminApi.createStaff({ ...staffForm, name: staffForm.name.trim(), email: staffForm.email.trim(), phone: staffForm.phone.trim() });
      await fetchStaff();
      setStaffSuccess(`${staffForm.name.trim()} can now sign in as ${staffForm.role}.`);
      setCreatedStaff({ email: staffForm.email.trim(), role: staffForm.role });
      setStaffForm({ name: '', email: '', password: '', role: 'doctor', phone: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create staff account');
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setMessage('');
    setRecipient('doctor');
  };

  return (
    <div className="space-y-6">
      {/* Admin Navigation Menu */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 mb-4">Admin Tools</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/dashboard/admin"
            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <UserRound className="w-4 h-4" />
            Patients
          </Link>
          <Link
            to="/dashboard/admin/appointments"
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Appointments
          </Link>
          <Link
            to="/dashboard/admin/shifts"
            className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Doctor Shifts
          </Link>
          <Link
            to="/dashboard/admin/waitlist"
            className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <Users2 className="w-4 h-4" />
            Waitlist
          </Link>
          <Link
            to="/dashboard/admin/referrals"
            className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Referrals
          </Link>
          <Link to="/dashboard/admin/audit-logs" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <ClipboardList className="w-4 h-4" />
            Audit Log
          </Link>
          <Link to="/dashboard/admin/settings" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <ShieldCheck className="w-4 h-4" />
            Settings
          </Link>
          <Link to="/dashboard/admin/medication-reminders" className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-colors">
            <Bell className="w-4 h-4" />
            Medication review
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Restricted access</p>
            <h2 className="mt-2 text-3xl font-bold">Carevyn admin portal</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">
            <ShieldCheck className="h-4 w-4" />
            Admin only
          </div>
        </div>
      </section>

      <PatientVolumeCards />

      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-800"><UserPlus className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">Admin only</p>
            <h3 className="text-xl font-bold text-slate-900">Create staff account</h3>
            <p className="mt-1 text-sm text-slate-600">Staff can sign in immediately with the credentials you provide.</p>
          </div>
        </div>
        <form onSubmit={handleAddStaff} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <input name="name" value={staffForm.name} onChange={handleStaffChange} required placeholder="Full name" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          <input name="email" type="email" value={staffForm.email} onChange={handleStaffChange} required placeholder="Staff email" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          <input name="password" type="password" minLength="6" value={staffForm.password} onChange={handleStaffChange} required placeholder="Temporary password" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          <select name="role" value={staffForm.role} onChange={handleStaffChange} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="receptionist">Receptionist</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="laboratory">Laboratory</option>
          </select>
          <button type="submit" disabled={staffSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            <UserPlus className="h-4 w-4" />
            {staffSubmitting ? 'Creating...' : 'Create staff'}
          </button>
        </form>
        {staffSuccess && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><p>{staffSuccess}</p>{createdStaff && <Link to={`/login?email=${encodeURIComponent(createdStaff.email)}&role=${encodeURIComponent(createdStaff.role)}`} className="rounded-lg bg-emerald-700 px-3 py-2 font-semibold text-white hover:bg-emerald-800">Sign in as staff</Link>}</div>}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total patients</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900">{records.length}</span>
            <Users className="h-8 w-8 text-emerald-700" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active staff</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900">{staffRecords.length}</span>
            <UserRound className="h-8 w-8 text-emerald-700" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Open notices</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900">5</span>
            <Bell className="h-8 w-8 text-emerald-700" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleAddPatient} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Patient</p>
              <h3 className="text-xl font-bold text-slate-900">Add patient record</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              <span className="mb-2 block font-medium">Patient name</span>
              <input name="name" value={patientForm.name} onChange={handlePatientChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Enter name" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-2 block font-medium">Patient email</span>
              <input name="email" type="email" value={patientForm.email} onChange={handlePatientChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="patient@hospital.com" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-2 block font-medium">Temporary password</span>
              <input name="password" type="password" minLength="6" value={patientForm.password} onChange={handlePatientChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="At least 6 characters" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-2 block font-medium">Age</span>
              <input type="number" name="age" value={patientForm.age} onChange={handlePatientChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Age" />
            </label>

            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-2 block font-medium">Condition</span>
              <input name="condition" value={patientForm.condition} onChange={handlePatientChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="e.g. Hypertension follow-up" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-2 block font-medium">Status</span>
              <select name="status" value={patientForm.status} onChange={handlePatientChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <option>Stable</option>
                <option>Monitoring</option>
                <option>Recovering</option>
                <option>Observation</option>
              </select>
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-2 block font-medium">Last updated</span>
              <input type="date" name="lastUpdated" value={patientForm.lastUpdated} onChange={handlePatientChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
            </label>

            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-2 block font-medium">Diagnosis</span>
              <textarea name="diagnosis" value={patientForm.diagnosis} onChange={handlePatientChange} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Clinical diagnosis" />
            </label>

            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="mb-2 block font-medium">Notes</span>
              <textarea name="notes" value={patientForm.notes} onChange={handlePatientChange} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Care notes" />
            </label>
          </div>

          <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" />
            Save patient record
          </button>
        </form>

        <form onSubmit={handleSendMessage} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Messaging</p>
              <h3 className="text-xl font-bold text-slate-900">Send staff update</h3>
            </div>
          </div>

          <label className="block text-sm text-slate-700">
            <span className="mb-2 block font-medium">Send to</span>
            <select value={recipient} onChange={(event) => setRecipient(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              {staffOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm text-slate-700">
            <span className="mb-2 block font-medium">Message</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows="7" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" placeholder="Write update for staff..." />
          </label>

          <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">
            <Send className="h-4 w-4" />
            Send message
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Patient list</h3>
          <span className="text-sm text-slate-500">{records.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Condition</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Doctor</th>
                <th className="px-3 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-slate-200">
                  <td className="px-3 py-3 font-medium text-slate-900">{record.name}</td>
                  <td className="px-3 py-3 text-slate-700">{record.condition}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{record.doctor}</td>
                  <td className="px-3 py-3 text-slate-700">{record.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">Hospital team</p>
            <h3 className="text-xl font-bold text-slate-900">Staff directory</h3>
          </div>
          <span className="text-sm text-slate-500">{staffRecords.length} active staff</span>
        </div>
        {staffRecords.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No active staff accounts found yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700"><tr><th className="px-3 py-3 font-semibold">Name</th><th className="px-3 py-3 font-semibold">Email</th><th className="px-3 py-3 font-semibold">Role</th><th className="px-3 py-3 font-semibold">Phone</th></tr></thead>
              <tbody>{staffRecords.map((staff) => <tr key={staff._id || staff.id} className="border-t border-slate-200"><td className="px-3 py-3 font-medium text-slate-900">{staff.name}</td><td className="px-3 py-3 text-slate-700">{staff.email}</td><td className="px-3 py-3 capitalize text-slate-700">{staff.role}</td><td className="px-3 py-3 text-slate-700">{staff.phone || '—'}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
