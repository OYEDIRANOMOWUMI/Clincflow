import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, CreditCard, FileText, Lock, LogOut, ShieldCheck, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api';
import { clearSession, getSession } from '../../auth';

const appointments = [
  { date: '2026-08-21', time: '10:30 AM', doctor: 'Dr. Aisha Bello' }
];

const prescriptions = [
  { id: 'p-1', drug: 'Amlodipine', status: 'Unpaid', amount: '$18.00' },
  { id: 'p-2', drug: 'Vitamin D', status: 'Unpaid', amount: '$12.00' }
];

const history = [
  { date: '2026-07-12', doctor: 'Dr. Daniel Okafor', note: 'Follow-up on blood pressure management.' },
  { date: '2026-06-04', doctor: 'Dr. Grace Nwosu', note: 'Routine check-up and medication review.' }
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [items, setItems] = useState(prescriptions);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');

  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  const handlePayNow = (id) => {
    setSelectedItemId(id);
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!selectedItem) return;

    const sanitizedCardNumber = cardNumber.replace(/\s+/g, '');
    if (paymentMethod === 'card' && (sanitizedCardNumber.length < 12 || cvv.length < 3 || !cardName.trim() || !expiry.trim())) {
      setPaymentNotice('Please complete your card details before continuing.');
      return;
    }

    setIsSubmitting(true);
    setPaymentNotice('');

    try {
      const payload = {
        prescriptionId: selectedItem.id,
        patientId: session?.user?.id || '68a8b4a1f0d6c8b826d1d0fa',
        amount: Number(selectedItem.amount.replace(/[^\d.]/g, '')),
        paymentMethod,
        cardName,
        cardNumber: sanitizedCardNumber,
        expiry,
        cvv
      };

      if (session?.token) {
        const response = await axios.post(`${API_URL}/payments/checkout`, payload, {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        });

        if (response?.data?.success) {
          setItems((current) => current.map((item) => item.id === selectedItem.id ? { ...item, status: 'Paid' } : item));
          setSelectedItemId(null);
          setCardName('');
          setCardNumber('');
          setExpiry('');
          setCvv('');
          setPaymentNotice('Payment processed successfully.');
        }
        return;
      }

      setItems((current) => current.map((item) => item.id === selectedItem.id ? { ...item, status: 'Paid' } : item));
      setSelectedItemId(null);
      setCardName('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setPaymentNotice('Payment processed successfully in demo mode.');
    } catch (error) {
      console.error('PAYMENT_ERROR:', error);
      const message = error?.response?.data?.message || 'Payment processing failed. Please try again.';
      setPaymentNotice(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <nav className="bg-emerald-900 text-white px-6 py-4 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">ClinicFlow</p>
            <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-100">{session?.user?.name || 'Patient'}</span>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-2">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-900">Upcoming Appointment</h2>
              <CalendarDays className="text-emerald-700" size={18} />
            </div>
            <div className="space-y-3 rounded-2xl bg-emerald-50 p-4">
              {appointments.map((appointment) => (
                <div key={`${appointment.date}-${appointment.doctor}`} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">{appointment.date}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-900">{appointment.time}</p>
                  <p className="text-sm text-slate-600">with {appointment.doctor}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-900">Current Prescriptions</h2>
              <FileText className="text-emerald-700" size={18} />
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-bold">{item.drug}</p>
                    <p className="text-sm text-slate-500">{item.amount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
                    {item.status !== 'Paid' && (
                      <button type="button" onClick={() => handlePayNow(item.id)} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"><CreditCard size={14} /> Pay Now</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedItem && (
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-emerald-900">Secure Checkout</h2>
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={14} /> Gateway secure
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <Lock size={16} />
                <span>{selectedItem.drug} · {selectedItem.amount}</span>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Payment method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['card', 'wallet', 'bank'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wide ${paymentMethod === method ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                      >
                        {method === 'card' ? 'Card' : method === 'wallet' ? 'Wallet' : 'Bank'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    aria-label="Name on card"
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    placeholder="Name on card"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700"
                    required
                  />
                  <input
                    aria-label="Card number"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      aria-label="Expiry date"
                      value={expiry}
                      onChange={(event) => setExpiry(event.target.value)}
                      placeholder="MM/YY"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700"
                      required
                    />
                    <input
                      aria-label="CVV"
                      value={cvv}
                      onChange={(event) => setCvv(event.target.value)}
                      placeholder="CVV"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-emerald-700"
                      required
                    />
                  </div>
                </div>

                {paymentNotice && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {paymentNotice}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-500">
                  {isSubmitting ? 'Processing...' : `Pay securely via ${paymentMethod === 'card' ? 'Card' : paymentMethod === 'wallet' ? 'Wallet' : 'Bank'}`}
                </button>
              </form>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-emerald-900">Past Visit History</h2>
            <Stethoscope className="text-emerald-700" size={18} />
          </div>
          <div className="space-y-3">
            {history.map((visit) => (
              <div key={`${visit.date}-${visit.doctor}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{visit.date}</p>
                <p className="mt-1 font-semibold text-slate-800">{visit.doctor}</p>
                <p className="mt-2 text-sm text-slate-600">{visit.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 size={16} /> Visit summaries are read-only and securely stored.</div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;
