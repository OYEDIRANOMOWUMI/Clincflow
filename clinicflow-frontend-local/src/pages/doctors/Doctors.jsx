import { API_URL } from '../../api.js'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Facebook, Linkedin, Plus, User, Mail, Shield, ChevronRight, Phone, Activity, LogOut } from 'lucide-react';
import { clearSession, getSession } from '../../auth';
import { useNavigate } from 'react-router-dom';

const Doctors = () => {
  const [patients, setPatients] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const session = getSession();
  const colors = {
    deepGreen: '#064e3b',
    forestGreen: '#065f46',
    mintGreen: '#ecfdf5',
    white: '#ffffff',
    border: '#d1d5db'
  };

  useEffect(() => {
    axios.get(`${API_URL}/doctor/getUsers`)
      .then((response) => {
        setPatients(response.data);
      })
      .catch((err) => {
        setError('Failed to fetch patients');
      })
      .finally(() => setLoading(false));

    const token = session?.token;
    if (!token) return;

    axios.get(`${API_URL}/availability/doctor`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        setAvailability(response.data?.availability || []);
      })
      .catch((err) => {
        console.error('availability fetch failed', err);
      });
  }, [session?.token]);

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.post(`${API_URL}/availability/doctor`, { date: selectedDate, status }, {
        headers: {
          Authorization: `Bearer ${session?.token || ''}`
        }
      });

      const updated = response.data?.availability || [];
      setAvailability((prev) => {
        const filtered = prev.filter((item) => item.date !== selectedDate);
        return [...filtered, updated].sort((a, b) => a.date.localeCompare(b.date));
      });
    } catch (err) {
      console.error('availability save failed', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: colors.white }}>
      <nav className="fixed top-0 left-0 w-full z-50 p-4 shadow-md flex justify-between items-center" style={{ backgroundColor: colors.deepGreen, color: colors.white }}>
        <div className="flex items-center gap-2">
          <Activity size={28} />
          <h1 className="text-xl font-bold tracking-tight uppercase">ClinicFlow Hospital</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-emerald-100">{session?.user?.email || 'Doctor'}</span>
          <button
            type="button"
            onClick={() => {
              clearSession();
              navigate('/doctor');
            }}
            className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-grow container mx-auto pt-40 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.deepGreen }}>Patient Directory</h2>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
            {patients.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <p className="text-lg font-medium text-gray-500 italic">No patients found</p>
                <div className="mt-4 w-12 h-1 rounded" style={{ backgroundColor: colors.deepGreen }}></div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <li key={patient._id} className="p-6 flex justify-between items-center hover:bg-emerald-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.mintGreen, color: colors.deepGreen }}>
                        <User size={24} />
                      </div>
                      <div>
                        <strong className="text-lg block" style={{ color: colors.deepGreen }}>{patient.firstName}</strong>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail size={14} /> {patient.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone size={14} /> {patient.phoneNumber}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-emerald-700 transition" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.deepGreen }}>Availability</h2>
              <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <button type="submit" disabled={saving} className="w-full py-3 rounded-lg font-bold text-white bg-emerald-800 hover:bg-emerald-900">
                  {saving ? 'Saving...' : 'Save Availability'}
                </button>
              </form>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <h3 className="text-lg font-bold mb-4" style={{ color: colors.deepGreen }}>My Schedule</h3>
              {availability.length === 0 ? (
                <p className="text-sm text-gray-500">No dates set yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {availability.map((item) => (
                    <li key={item._id || `${item.date}-${item.status}`} className="flex justify-between border-b pb-2">
                      <span>{item.date}</span>
                      <span className={`font-semibold ${item.status === 'available' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-12 border-t" style={{ backgroundColor: colors.mintGreen }}>
        <div className="container mx-auto flex flex-col items-center">
          <div className="flex space-x-10 mb-6">
            <a href="#" className="hover:scale-110 transition" style={{ color: colors.deepGreen }}><Facebook size={24} /></a>
            <a href="#" className="hover:scale-110 transition" style={{ color: colors.deepGreen }}><Linkedin size={24} /></a>
          </div>
          <p className="text-sm font-semibold tracking-widest uppercase opacity-60" style={{ color: colors.deepGreen }}>
            &copy; 2026 ClinicFlow Hospital
          </p>
        </div>
      </footer>
    </div>
  )
};

export default Doctors;