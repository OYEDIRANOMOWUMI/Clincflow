import { API_URL } from '../../api.js'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, UserPlusIcon, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuthHeaders } from '../../api.js';

const DoctorSignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("doctor");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const userData = { name, email, password, role }

    const endpoint = role === 'patient' ? '/user/hospital-patient' : '/user/staff'
    axios.post(`${API_URL}${endpoint}`, userData, { headers: getAuthHeaders() })
      .then((res) => {
        setIsSubmitted(true)
        toast.success(res?.data?.message || `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`)
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Registration failed'
        toast.error(message)
      })
  };

  return (
   <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard/admin" className="flex items-center space-x-2 text-emerald-900 hover:text-emerald-700 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold tracking-tight">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-900 p-8 text-center">
            <div className="inline-flex bg-emerald-800 p-4 rounded-full mb-4">
              <UserPlusIcon size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Staff Registration</h2>
            <p className="text-emerald-200 text-sm mt-1">Create a new doctor, nurse, pharmacy, or lab account</p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Role</label>
                <div className="relative">
                  <select
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all bg-white"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                    name='name'
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="staff@medical.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                    name='email'
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border-2 border-emerald-50 rounded-xl focus:border-emerald-800 focus:outline-none transition-all"
                    name='password'
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-900"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-950 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                Create Staff Account
              </button>
            </form>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-900">
                <UserPlusIcon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-emerald-950">Staff account created</h3>
              <p className="mt-3 text-sm text-slate-600">The new {role} account is now ready for access.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/doctor" className="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-950">Login as Staff</Link>
                <button type="button" onClick={() => navigate('/dashboard/admin')} className="rounded-xl border border-emerald-800 px-5 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50">Back to dashboard</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-emerald-950 py-10 text-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="flex justify-center space-x-10 mb-6">
            <a href="#" className="hover:text-emerald-400 transition-colors"><Facebook size={24} /></a>
            <a href="#" className="hover:text-emerald-400 transition-colors"><Linkedin size={24} /></a>
          </div>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">
            &copy; 2026 Admin Portal • Secure Registration
          </p>
        </div>
      </footer>
       <ToastContainer />
    </div>
  )
}

export default DoctorSignUp