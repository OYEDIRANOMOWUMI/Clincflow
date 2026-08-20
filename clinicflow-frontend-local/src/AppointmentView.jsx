import { API_URL } from './api.js'
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { buildWaUrl } from './utils/phone'

// Helper: clean Nigerian phone number input and return E.164-style digits for wa.me (no plus)
function cleanPhoneForWa(raw) {
  if (!raw) return ''
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('+')) return digits.replace(/[^0-9]/g, '')
  return digits
}

// Component-level hooks are declared inside `AppointmentView`.

  const handleSubmit1 = (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = { firstName, phoneNumber, department, issue };

    axios.post(`${API_URL}/patient/appointment`, userData)
      .then((res) => {
        setLoading(false);

        // Only offer WhatsApp confirmation after successful save
        try {
          const saved = res?.data?.appointment || null
          const phone = phoneNumber || (saved && saved.phoneNumber) || ''
          const date = saved && saved.date ? new Date(saved.date).toLocaleDateString() : ''
          const dept = saved && saved.department ? saved.department : department || ''
          const message = `Hi, this confirms your ClinicFlow appointment request for ${dept}${date ? ' on ' + date : ''}. We'll contact you shortly.`
          const built = buildWaUrl(phone, message)
          if (built) {
            setWaUrl(built)
            setShowWaPrompt(true)
          }
        } catch (err) {
          console.error('WhatsApp link creation error', err)
        }

        // follow existing navigation behavior
        try { setPage('home') } catch (e) {}
        try { navigate('/') } catch (e) {}
      })
      .catch((err) => {
        console.error("error", err);
        setLoading(false);
      });
  };

  const AppointmentView = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = React.useState(false)
    const [firstName, setFirstName] = React.useState('')
    const [phoneNumber, setPhoneNumber] = React.useState('')
    const [department, setDepartment] = React.useState('Others')
    const [issue, setIssue] = React.useState('')
    const [showWaPrompt, setShowWaPrompt] = React.useState(false)
    const [waUrl, setWaUrl] = React.useState('')

    React.useEffect(() => {
      window.scrollTo(0, 0)
    }, [])

    return (
    <div className="bg-stone-100 py-16 px-6 min-h-screen font-sans">
      {showWaPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowWaPrompt(false)} />
          <div className="bg-white rounded-xl p-6 z-60 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-3">Send WhatsApp confirmation</h3>
            <p className="text-sm mb-4">Open WhatsApp with a pre-filled confirmation message now.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowWaPrompt(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={() => { window.open(waUrl, '_blank'); setShowWaPrompt(false) }} className="px-4 py-2 rounded bg-green-600 text-white">Send via WhatsApp</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="bg-[#064E3B] md:w-1/3 p-10 text-stone-50 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">Appointment</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-800/50 p-2 rounded-lg"><Phone size={18}/></div>
                <span className="text-sm font-medium">+234 9072606277</span>
              </div>
            </div>
          </div>
          <div className="mt-12 text-xs flex items-center text-emerald-400">
            <ShieldCheck size={16} className="mr-2"/> ClinicFlow Secure
          </div>
        </div>

        <div className="p-10 md:w-2/3">
          <form onSubmit={handleSubmit1} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block">Patient Name</label>
                <input 
                  required 
                  type="text" 
                  value={firstName} // LIKING VALUE
                  placeholder="Full Name" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-900/10" 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block">Phone Number</label>
                <input 
                  required 
                  type="text" 
                  value={phoneNumber} // LIKING VALUE
                  placeholder="080..." 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-900/10" 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block">Department</label>
              <select 
                required 
                value={department} // LIKING VALUE
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none" 
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Others">Others</option>
                <option value="Cardiovascular Surgery">Cardiovascular Surgery</option>
                <option value="Neuroscience">Neuroscience</option>
                <option value="Oncology">Oncology</option>
                <option value="Modern Pediatrics">Modern Pediatrics</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block">Message</label>
              <textarea 
                required 
                rows="3" 
                value={issue} // LIKING VALUE
                placeholder="Symptoms..." 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none resize-none" 
                onChange={(e) => setIssue(e.target.value)}
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full bg-[#064E3B] text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0d6d53] shadow-lg active:scale-[0.98]'}`}
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? "Processing..." : "Request Scheduled Visit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

 


export default AppointmentView;