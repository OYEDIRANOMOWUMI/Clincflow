import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../auth';

const roleLabels = {
  doctor: 'Doctor Dashboard',
  nurse: 'Nurse Dashboard',
  pharmacy: 'Pharmacy Dashboard',
  laboratory: 'Laboratory Dashboard'
};

const roleDescriptions = {
  doctor: 'Doctor workspace and patient management area.',
  nurse: 'Nursing station overview and care coordination.',
  pharmacy: 'Medication inventory and prescription fulfillment area.',
  laboratory: 'Lab operations, sample tracking, and results queue.'
};

const RoleDashboard = ({ role = 'doctor' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/doctor');
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-900 px-8 py-10 text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">ClinicFlow</p>
              <h1 className="mt-2 text-3xl font-bold">{roleLabels[role] || 'Staff Dashboard'}</h1>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-white text-emerald-900 font-bold px-4 py-2 rounded-xl hover:bg-emerald-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-700 font-bold">Role Access</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-800">Welcome to your {roleLabels[role] || 'Staff Dashboard'}</h2>
            <p className="mt-3 text-slate-600">{roleDescriptions[role] || 'Protected staff workspace.'}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 text-lg font-bold text-slate-800">Authenticated</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
              <p className="mt-2 text-lg font-bold text-slate-800">{role}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Module</p>
              <p className="mt-2 text-lg font-bold text-slate-800">Placeholder dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;
