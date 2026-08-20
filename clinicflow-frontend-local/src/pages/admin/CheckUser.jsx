import { API_URL } from '../../api.js'
import React, {useState, useEffect} from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Plus, User, Mail, Shield, ChevronRight, Phone, Activity, HeartOff ,Home} from 'lucide-react';
const CheckUser = () => {
      const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const colors = {
    deepGreen: '#064e3b', // Emerald-900
    forestGreen: '#065f46', // Emerald-800
    mintGreen: '#ecfdf5', // Emerald-50
    white: '#ffffff',
    border: '#d1d5db'
  };

  useEffect(() => {
    // Fetch data when the component mounts
    axios.get(`${API_URL}/doctor/getUsers`)
      .then((response) => {
        setPatients(response.data); // Update state with the actual data
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch patients");
        setLoading(false);
      });
  }, []); // Empty array means "run once on load"

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>{error}</p>;
  return (
  <>
      <main className="flex-grow container mx-auto  p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Patient List (Logic from your original code) */}
        <div className="lg:col-span-3">
            <Link 
              to="/admindash" 
              className="flex items-center space-x-2 px-4 py-2 border-2 border-emerald-800 text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.deepGreen }}>Patient Directory</h2>
          
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
            {loading ? (
              <div className="p-20 text-center text-gray-400">Loading records...</div>
            ) : patients.length === 0 ? (
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
  </>
  )
}

export default CheckUser