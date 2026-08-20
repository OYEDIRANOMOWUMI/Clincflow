import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, LogOut, Stethoscope, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { patientRecordApi } from '../../api';
import { clearSession, getSession } from '../../auth';
import { patientRecords } from '../../data/patientRecords';

const buildNurseQueue = (records) => records.map((patient) => ({
  id: patient.id,
  name: patient.name,
  status: patient.status,
  vitals: `${patient.condition} · ${patient.doctor}`,
  doctorNote: patient.notes
}));

const NurseDashboard = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [records, setRecords] = useState(patientRecords);
  const [patients, setPatients] = useState(() => buildNurseQueue(patientRecords));
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [weight, setWeight] = useState('');
  const [pulse, setPulse] = useState('');
  const [urgentPatientId, setUrgentPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(patientRecords[0]);

  useEffect(() => {
    setPatients(buildNurseQueue(records));
  }, [records]);

  const handleStatusUpdate = (id) => {
    setRecords((current) => current.map((patient) => patient.id === id ? { ...patient, status: 'Ready for doctor' } : patient));
    const updatedPatient = records.find((patient) => patient.id === id) || patientRecords[0];
    setSelectedPatient({ ...updatedPatient, status: 'Ready for doctor' });
  };

  const handleVitalsSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPatient) return;

    const summary = `BP: ${bp || 'n/a'} | Temp: ${temp || 'n/a'} | Weight: ${weight || 'n/a'} | Pulse: ${pulse || 'n/a'}`;
    const nextPatient = {
      ...selectedPatient,
      notes: `${selectedPatient.notes} | Vitals updated: ${summary}`,
      status: 'Vitals recorded'
    };

    try {
      const response = await patientRecordApi.update(selectedPatient.id, {
        notes: `Vitals updated: ${summary}`,
        status: 'Vitals recorded'
      });
      if (response?.patient) {
        setRecords((current) => current.map((patient) => patient.id === selectedPatient.id ? response.patient : patient));
        setSelectedPatient(response.patient);
        toast.success('Vitals recorded and saved.');
      } else {
        setRecords((current) => current.map((patient) => patient.id === selectedPatient.id ? nextPatient : patient));
        setSelectedPatient(nextPatient);
        toast.error(response?.message || 'Unable to save vitals.');
      }
    } catch (error) {
      console.error('Nurse record update failed:', error);
      setRecords((current) => current.map((patient) => patient.id === selectedPatient.id ? nextPatient : patient));
      setSelectedPatient(nextPatient);
      toast.error('Nurse record update failed.');
    }

    setBp('');
    setTemp('');
    setWeight('');
    setPulse('');
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
            <h1 className="text-2xl font-bold">Nurse Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-100">{session?.user?.name || 'Nurse'}</span>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-2">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-900">Checked In / Waiting Patients</h2>
              <Stethoscope className="text-emerald-700" size={18} />
            </div>

            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setSelectedPatient(records.find((item) => item.id === patient.id) || records[0])} className="flex flex-1 items-center gap-3 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-900"><User size={18} /></div>
                      <div>
                        <p className="font-bold">{patient.name}</p>
                        <p className="text-sm text-slate-500">{patient.status}</p>
                      </div>
                    </button>
                    <button type="button" onClick={() => handleStatusUpdate(patient.id)} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Ready for doctor</button>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{patient.vitals}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <FileText size={16} className="text-emerald-700" />
                    <span className="text-sm text-slate-600">Doctor note: {patient.doctorNote}</span>
                  </div>
                  <button type="button" onClick={() => setUrgentPatientId(patient.id)} className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    <AlertTriangle size={14} /> Flag as urgent
                  </button>
                  {urgentPatientId === patient.id && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-red-700">Urgent flag raised for this case.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-700" size={18} /> <h2 className="text-xl font-bold text-emerald-900">Record Vitals</h2></div>
            <form onSubmit={handleVitalsSubmit} className="space-y-3">
              <input value={bp} onChange={(event) => setBp(event.target.value)} placeholder="BP (e.g. 120/80)" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <input value={temp} onChange={(event) => setTemp(event.target.value)} placeholder="Temperature (°C)" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <input value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="Weight (kg)" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <input value={pulse} onChange={(event) => setPulse(event.target.value)} placeholder="Pulse (bpm)" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
              <button type="submit" className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800">Save Vitals</button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-2"><FileText className="text-emerald-700" size={18} /> <h2 className="text-xl font-bold text-emerald-900">Selected Patient Record</h2></div>
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-700">Patient:</span> {selectedPatient.name}</p>
              <p><span className="font-semibold text-slate-700">Condition:</span> {selectedPatient.condition}</p>
              <p><span className="font-semibold text-slate-700">Note:</span> {selectedPatient.notes}</p>
            </div>
          </div>
        </section>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default NurseDashboard;
