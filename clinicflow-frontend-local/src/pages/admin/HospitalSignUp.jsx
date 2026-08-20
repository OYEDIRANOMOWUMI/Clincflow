import { API_URL } from '../../api.js';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Building2, Mail, Lock, User, Facebook, Linkedin } from 'lucide-react';

const HospitalSignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      hospitalName: name,
      adminEmail: email,
      password,
      hospitalAddress,
      hospitalPhone
    };

    axios
      .post(`${API_URL}/hospitals/register`, payload)
      .then(() => {
        toast.success('Hospital account created successfully');
        setTimeout(() => navigate('/admin'), 1200);
      })
      .catch((err) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Hospital registration failed';
        toast.error(message);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-emerald-900 hover:text-emerald-700 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold tracking-tight">Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-900 p-8 text-center">
            <div className="inline-flex bg-emerald-800 p-4 rounded-full mb-4">
              <Building2 size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Hospital Registration</h2>
            <p className="text-emerald-200 text-sm mt-1">Create your hospital admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Hospital Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                <input
                  type="text"
                  required
                  placeholder="ClinicFlow Hospital"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                <input
                  type="email"
                  required
                  placeholder="admin@clinicflow.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Hospital Address</label>
              <input
                type="text"
                placeholder="123 Medical Avenue, Lagos"
                className="w-full px-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Hospital Phone</label>
              <input
                type="tel"
                placeholder="+234 800 000 0000"
                className="w-full px-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                value={hospitalPhone}
                onChange={(e) => setHospitalPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-950 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              Register Hospital
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-emerald-950 py-10 text-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="flex justify-center space-x-10 mb-6">
            <a href="#" className="hover:text-emerald-400 transition-colors"><Facebook size={24} /></a>
            <a href="#" className="hover:text-emerald-400 transition-colors"><Linkedin size={24} /></a>
          </div>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">
            &copy; 2026 ClinicFlow Hospital • Secure Registration
          </p>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default HospitalSignUp;
