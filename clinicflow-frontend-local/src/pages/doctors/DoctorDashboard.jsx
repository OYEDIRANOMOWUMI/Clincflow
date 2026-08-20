import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock3, FileText, FlaskConical, LogOut, Stethoscope, User, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { patientRecordApi } from '../../api';
import { clearSession, getSession } from '../../auth';
import { patientRecords, staffAppointments } from '../../data/patientRecords';

const DoctorDashboard = () => {
  const session = getSession();
  const navigate = useNavigate();
  const [records, setRecords] = useState(patientRecords);
  const [selectedPatientId, setSelectedPatientId] = useState(patientRecords[0]?.id || 'pt-101');
  const [appointments, setAppointments] = useState(staffAppointments);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [labRequest, setLabRequest] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().slice(0, 10));
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [savedAvailabilityMessage, setSavedAvailabilityMessage] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await patientRecordApi.list();
        if (response?.patients?.length) {
          setRecords(response.patients);
          const firstPatientId = response.patients[0]?.id || selectedPatientId;
          setSelectedPatientId(firstPatientId);
        }
      } catch (error) {
        console.error('Failed to load patient records:', error);
      }
    };

    loadPatients();
  }, []);

  const selectedPatient = useMemo(
    () => records.find((patient) => patient.id === selectedPatientId) || records[0],
    [records, selectedPatientId]
  );

  const handleApprove = (id) => {
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, status: 'approved' } : item));
  };

  const handleCancel = (id) => {
    setAppointments((current) => current.filter((item) => item.id !== id));
  };

  const handleComplete = (id) => {
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, status: 'completed' } : item));
  };

  const handleSaveNote = async (event) => {
    event.preventDefault();

    if (!selectedPatientId) return;

    const payload = {
      diagnosis: diagnosis.trim() || selectedPatient?.diagnosis || '',
      notes: prescription.trim() || selectedPatient?.notes || '',
      status: 'Ready for review'
    };

    try {
      const response = await patientRecordApi.update(selectedPatientId, payload);
      if (response?.patient) {
        setRecords((current) => current.map((patient) => patient.id === selectedPatientId ? response.patient : patient));
        toast.success('Patient record updated successfully.');
      } else {
        toast.error(response?.message || 'Unable to update patient record.');
      }
    } catch (error) {
      console.error('Doctor record update failed:', error);
      toast.error('Doctor record update failed.');
    }

    setDiagnosis('');
    setPrescription('');
  };

  const handleLabRequest = (event) => {
    event.preventDefault();
    if (!selectedPatientId) return;

    setRecords((current) => current.map((patient) => patient.id === selectedPatientId ? {
      ...patient,
      notes: `${patient.notes} | Lab request: ${labRequest.trim() || 'Follow-up labs needed.'}`
    } : patient));
    setLabRequest('');
  };

  const handleAvailabilitySave = () => {
    if (!availabilityDate) return;
    setSavedAvailabilityMessage(`Availability saved for ${availabilityDate}: ${availabilityStatus}`);
    toast.success('Availability saved successfully.');
  };

  const handleLogout = () => {
    clearSession();
    navigate('/doctor');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <nav className="bg-emerald-900 text-white px-6 py-4 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">ClinicFlow</p>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-100">{session?.user?.name || 'Doctor'}</span>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-900">Assigned Appointments</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">{appointments.length} active</span>
            </div>

            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className={`rounded-2xl border p-4 ${selectedPatientId === appointment.patientId ? 'border-emerald-700 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setSelectedPatientId(appointment.patientId)} className="flex flex-1 items-center gap-3 text-left">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-900"><User size={18} /></div>
                      <div>
                        <p className="font-bold">{appointment.patient}</p>
                        <p className="text-sm text-slate-500">{appointment.complaint}</p>
                      </div>
                    </button>
                    <span className="text-right text-sm font-semibold text-slate-700">{appointment.time}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleApprove(appointment.id)} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Approve</button>
                    <button type="button" onClick={() => handleCancel(appointment.id)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">Cancel</button>
                    <button type="button" onClick={() => handleComplete(appointment.id)} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900">Complete</button>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-amber-700">Status: {appointment.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-900">Pending Approval Queue</h2>
              <Clock3 className="text-emerald-700" size={18} />
            </div>

            <div className="space-y-4">
              {appointments.filter((item) => item.status !== 'completed').map((request) => (
                <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold">{request.patient}</p>
                      <p className="text-sm text-slate-500">{request.complaint}</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-amber-700">{request.time}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => handleApprove(request.id)} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"><CheckCircle2 size={16} /> Approve</button>
                    <button type="button" onClick={() => handleCancel(request.id)} className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"><XCircle size={16} /> Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-bold text-emerald-900">Patient Record</h2>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-lg font-bold">{selectedPatient.name}</p>
              <p className="text-sm text-slate-600">Age {selectedPatient.age} · {selectedPatient.condition}</p>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800">Diagnosis</p>
                <p className="mt-1 text-sm text-slate-600">{selectedPatient.diagnosis}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800">Care Note</p>
                <p className="mt-1 text-sm text-slate-600">{selectedPatient.notes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-2"><Activity className="text-emerald-700" size={18} /> <h2 className="text-xl font-bold text-emerald-900">Update Patient Record</h2></div>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <textarea value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} rows="3" placeholder="Update diagnosis notes..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <textarea value={prescription} onChange={(event) => setPrescription(event.target.value)} rows="3" placeholder="Prescription / care instruction..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <button type="submit" className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">Save Record</button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-2"><FlaskConical className="text-emerald-700" size={18} /> <h2 className="text-xl font-bold text-emerald-900">Request Lab Test</h2></div>
            <form onSubmit={handleLabRequest} className="space-y-3">
              <textarea value={labRequest} onChange={(event) => setLabRequest(event.target.value)} rows="3" placeholder="Lab test request details..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <button type="submit" className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">Send Lab Request</button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-2"><Activity className="text-emerald-700" size={18} /> <h2 className="text-xl font-bold text-emerald-900">Availability</h2></div>
            <div className="space-y-3">
              <input type="date" value={availabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <select value={availabilityStatus} onChange={(event) => setAvailabilityStatus(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <button type="button" onClick={handleAvailabilitySave} className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">Save Availability</button>
              {savedAvailabilityMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {savedAvailabilityMessage}
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default DoctorDashboard;
