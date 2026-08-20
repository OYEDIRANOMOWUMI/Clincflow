import React, { useEffect, useState } from 'react';
import { CheckCircle2, LogOut, Pill, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { patientRecordApi } from '../../api';
import { clearSession, getSession } from '../../auth';
import { patientRecords, pharmacyQueue } from '../../data/patientRecords';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [records, setRecords] = useState(patientRecords);
  const [queue, setQueue] = useState(pharmacyQueue);
  const [selectedPatientId, setSelectedPatientId] = useState(pharmacyQueue[0]?.patientId || patientRecords[0]?.id);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await patientRecordApi.list();
        if (response?.patients?.length) {
          setRecords(response.patients);
        }
      } catch (error) {
        console.error('Pharmacy patient load failed:', error);
      }
    };

    loadPatients();
  }, []);

  const selectedPatient = records.find((patient) => patient.id === selectedPatientId) || records[0];

  const handleDispense = async (id) => {
    const selectedItem = queue.find((item) => item.id === id);
    setQueue((current) => current.map((item) => item.id === id ? { ...item, status: 'Dispensed' } : item));
    if (selectedItem) {
      setSelectedPatientId(selectedItem.patientId);
      try {
        const response = await patientRecordApi.update(selectedItem.patientId, {
          notes: `${selectedItem.drug} dispensed successfully.`,
          status: 'Medication dispensed'
        });
        if (response?.patient) {
          setRecords((current) => current.map((patient) => patient.id === selectedItem.patientId ? response.patient : patient));
        } else {
          setRecords((current) => current.map((patient) => patient.id === selectedItem.patientId ? {
            ...patient,
            notes: `${patient.notes} | Pharmacy: ${selectedItem.drug} dispensed successfully.`,
            status: 'Medication dispensed'
          } : patient));
        }
      } catch (error) {
        console.error('Pharmacy update failed:', error);
        setRecords((current) => current.map((patient) => patient.id === selectedItem.patientId ? {
          ...patient,
          notes: `${patient.notes} | Pharmacy: ${selectedItem.drug} dispensed successfully.`,
          status: 'Medication dispensed'
        } : patient));
      }
    }
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
            <h1 className="text-2xl font-bold">Pharmacy Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-100">{session?.user?.name || 'Pharmacy'}</span>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-900">Prescription Queue</h2>
              <Pill className="text-emerald-700" size={18} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-emerald-900">Patient</th>
                    <th className="px-4 py-3 font-semibold text-emerald-900">Drug</th>
                    <th className="px-4 py-3 font-semibold text-emerald-900">Dosage</th>
                    <th className="px-4 py-3 font-semibold text-emerald-900">Payment</th>
                    <th className="px-4 py-3 font-semibold text-emerald-900">Status</th>
                    <th className="px-4 py-3 font-semibold text-emerald-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200 bg-white">
                      <td className="px-4 py-3 font-medium">{item.patient}</td>
                      <td className="px-4 py-3">{item.drug}</td>
                      <td className="px-4 py-3">{item.dosage}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {item.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.status === 'Dispensed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.paid && item.status !== 'Dispensed' ? (
                          <button type="button" onClick={() => handleDispense(item.id)} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                            <CheckCircle2 size={16} /> Mark dispensed
                          </button>
                        ) : (
                          <span className="flex items-center gap-2 text-sm text-slate-500"><XCircle size={16} /> Awaiting payment</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-xl font-bold text-emerald-900">Patient Record Update</h2>
            {selectedPatient ? (
              <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Patient:</span> {selectedPatient.name}</p>
                <p><span className="font-semibold text-slate-700">Condition:</span> {selectedPatient.condition}</p>
                <p><span className="font-semibold text-slate-700">Notes:</span> {selectedPatient.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PharmacyDashboard;
