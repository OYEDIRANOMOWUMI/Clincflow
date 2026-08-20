import React, { useEffect, useState } from 'react';
import { CheckCircle2, FlaskConical, LogOut, TimerReset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { patientRecordApi } from '../../api';
import { clearSession, getSession } from '../../auth';
import { labQueue, patientRecords } from '../../data/patientRecords';

const LabDashboard = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [records, setRecords] = useState(patientRecords);
  const [tests, setTests] = useState(labQueue);
  const [selectedTestId, setSelectedTestId] = useState(labQueue[0]?.id || 'lab-1');
  const [results, setResults] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await patientRecordApi.list();
        if (response?.patients?.length) {
          setRecords(response.patients);
        }
      } catch (error) {
        console.error('Lab patient load failed:', error);
      }
    };

    loadPatients();
  }, []);

  const selectedTest = tests.find((item) => item.id === selectedTestId) || tests[0];
  const selectedPatient = records.find((patient) => patient.id === selectedTest?.patientId) || records[0];

  const handleStatusChange = (id, nextStatus) => {
    setTests((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTest) return;

    const payloadNotes = results || 'Result entered.'
    setTests((current) => current.map((item) => item.id === selectedTestId ? { ...item, result: payloadNotes, status: 'Completed' } : item));

    try {
      const response = await patientRecordApi.update(selectedTest.patientId, {
        notes: payloadNotes,
        status: 'Lab review complete'
      });
      if (response?.patient) {
        setRecords((current) => current.map((patient) => patient.id === selectedTest.patientId ? response.patient : patient));
        toast.success('Lab result saved successfully.');
      } else {
        setRecords((current) => current.map((patient) => patient.id === selectedTest.patientId ? {
          ...patient,
          notes: `${patient.notes} | Lab result: ${payloadNotes}`,
          status: 'Lab review complete'
        } : patient));
        toast.error(response?.message || 'Unable to save lab result.');
      }
    } catch (error) {
      console.error('Lab update failed:', error);
      setRecords((current) => current.map((patient) => patient.id === selectedTest.patientId ? {
        ...patient,
        notes: `${patient.notes} | Lab result: ${payloadNotes}`,
        status: 'Lab review complete'
      } : patient));
      toast.error('Lab update failed.');
    }

    setResults('');
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
            <h1 className="text-2xl font-bold">Laboratory Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-100">{session?.user?.name || 'Lab'}</span>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-emerald-900">Lab Test Queue</h2>
            <FlaskConical className="text-emerald-700" size={18} />
          </div>
          <div className="space-y-4">
            {tests.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{item.patient}</p>
                    <p className="text-sm text-slate-500">{item.test}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">{item.status}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => setSelectedTestId(item.id)} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900">Select</button>
                  <button type="button" onClick={() => handleStatusChange(item.id, 'In progress')} className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">In progress</button>
                  <button type="button" onClick={() => handleStatusChange(item.id, 'Completed')} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Completed</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-emerald-900">Enter Results</h2>
            <TimerReset className="text-emerald-700" size={18} />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Selected test: <span className="font-semibold text-slate-800">{selectedTest?.test || 'None selected'}</span>
            </div>
            <textarea value={results} onChange={(event) => setResults(event.target.value)} rows="5" placeholder="Enter test result details, values, and notes..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700" />
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"><CheckCircle2 size={16} /> Save Result</button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h2 className="mb-3 text-xl font-bold text-emerald-900">Updated Patient Record</h2>
          {selectedPatient ? (
            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-700">Patient:</span> {selectedPatient.name}</p>
              <p><span className="font-semibold text-slate-700">Condition:</span> {selectedPatient.condition}</p>
              <p><span className="font-semibold text-slate-700">Notes:</span> {selectedPatient.notes}</p>
            </div>
          ) : null}
        </section>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default LabDashboard;
