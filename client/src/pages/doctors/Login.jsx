import { API_URL } from '../../api.js'
import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { consumeAuthNotice, saveSession, roleDashboardMap, getSession } from '../../auth';

const Login = ({ patientOnly = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(patientOnly ? 'patient' : 'doctor');
  const navigate = useNavigate()

  useEffect(() => {
    const notice = consumeAuthNotice();
    if (notice) toast.info(notice);
    const session = getSession();
    const sessionRole = String(session?.role || '').trim().toLowerCase();
    if (sessionRole && roleDashboardMap[sessionRole]) {
      navigate(roleDashboardMap[sessionRole], { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault()
    const userData = { email, password, role };

    axios.post(`${API_URL}/user/login`, userData)
      .then((res) => {
        const user = res?.data?.user || { email, name: 'Staff User', role };
        const userRole = String(user.role || role || '').trim().toLowerCase();

        saveSession(userRole, user, res?.data?.token);

        toast.success("Login Successful");

        const targetRoute = roleDashboardMap[userRole] || '/doctor';
        setTimeout(() => {
          navigate(targetRoute, { replace: true });
          window.location.assign(targetRoute);
        }, 500);
      })
      .catch((err) => {
        console.error('LOGIN ERROR:', err)
        toast.error(err?.response?.data?.message || "Incorrect Password/Email!");
      })
  };

  return (
    <div className="bg-[#F8F7F3] py-20 px-6 min-h-[80vh] font-sans flex items-center justify-center slide-up">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden">
        <div className="bg-[#064E3B] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Lock size={32} className="text-emerald-400" />
          </div>
            <h2 className="text-2xl font-serif font-bold">
            {patientOnly ? 'Patient Portal' : 'Medical Staff Portal'}
          </h2>
          <p className="text-emerald-100/60 text-xs mt-2 uppercase tracking-widest font-bold">
            Secure Professional Access
          </p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              {!patientOnly && <>
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-900/10 outline-none transition-all">
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">
                {patientOnly ? 'Patient Email' : 'Staff ID / Email'}
              </label>
              <div className="relative">
                <input
                  required
                  type="email"
                  placeholder="staff@carevyn.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-900/10 outline-none transition-all"
                  name="email"
                  onChange={(e)=>{setEmail(e.target.value)}}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-emerald-900/10 outline-none transition-all"
                  name="password"
                  onChange={(e)=>{setPassword(e.target.value)}}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                className="text-emerald-700 font-bold hover:underline"
              >
                Forgot Access?
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-[#064E3B] text-white py-4 rounded-xl font-bold hover:bg-[#0d6d53] shadow-lg transition-all active:scale-[0.98]"
            >
              Login
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-100 text-center">
            <p className="text-stone-400 text-[10px] leading-relaxed">
              ACCESS RESTRICTED TO AUTHORIZED PERSONNEL ONLY. <br />
              Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
