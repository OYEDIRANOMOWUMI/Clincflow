/* eslint-disable react-hooks/static-components */
import { API_URL } from './api.js'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Heart, 
  Stethoscope, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronRight, 
  ShieldCheck, 
  User, 
  Calendar, 
  Activity,
  Facebook,
  Linkedin,
  Instagram,
  Menu,
  X,
  Award,
  Users,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getDashboardPathForRole, getSession } from './auth';
import { getAuthHeaders } from './api.js';

// --- Vanilla CSS for non-Tailwind fallbacks and Animations ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

  :root {
    --primary-emerald: #064E3B;
    --primary-light: #0d6d53;
    --secondary-stone: #F8F7F3;
    --ink: #10231d;
    --line: rgba(6, 78, 59, 0.12);
  }

  html { scroll-behavior: smooth; }

  .fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }

  .slide-up {
    animation: slideUp 0.8s ease-out forwards;
  }

  .reveal-on-scroll {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s cubic-bezier(.22, 1, .36, 1);
  }

  .reveal-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .reveal-stagger > * {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.6s ease, transform 0.6s cubic-bezier(.22, 1, .36, 1);
  }

  .reveal-stagger.is-visible > * {
    opacity: 1;
    transform: translateY(0);
  }

  .reveal-stagger.is-visible > *:nth-child(2) { transition-delay: 80ms; }
  .reveal-stagger.is-visible > *:nth-child(3) { transition-delay: 160ms; }
  .reveal-stagger.is-visible > *:nth-child(4) { transition-delay: 240ms; }
  .reveal-stagger.is-visible > *:nth-child(5) { transition-delay: 320ms; }
  .reveal-stagger.is-visible > *:nth-child(6) { transition-delay: 400ms; }

  @media (max-width: 640px) {
    .hero-title { font-size: clamp(2.6rem, 12vw, 4rem); }
    .section-heading { font-size: clamp(2rem, 9vw, 2.75rem); }
    .mobile-gutter { padding-left: 1.25rem; padding-right: 1.25rem; }
    .hero-surface { background-size: 30px 30px, 30px 30px, auto; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .reveal-on-scroll, .reveal-stagger > * { opacity: 1; transform: none; transition: none; }
    .fade-in, .slide-up { animation: none; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .font-serif { font-family: 'Playfair Display', serif; }
  .font-sans { font-family: 'Inter', sans-serif; }

  .leader-card:hover .leader-overlay {
    opacity: 1;
    transform: translateY(0);
  }
  .home-shell { background: #fbfcfa; color: var(--ink); }
  .hero-surface {
    background:
      linear-gradient(90deg, rgba(6, 78, 59, 0.045) 1px, transparent 1px),
      linear-gradient(rgba(6, 78, 59, 0.045) 1px, transparent 1px),
      linear-gradient(135deg, #f5faf6 0%, #fbfcfa 55%, #eef8f2 100%);
    background-size: 44px 44px, 44px 44px, auto;
  }
  .hero-panel { border: 1px solid rgba(6, 78, 59, 0.14); box-shadow: 0 30px 70px rgba(6, 78, 59, 0.16); }
  .hero-stat { border-left: 2px solid #43a982; padding-left: 0.85rem; }
  .service-card { border: 1px solid var(--line); box-shadow: 0 8px 24px rgba(15, 35, 29, 0.04); transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
  .service-card:hover { transform: translateY(-6px); border-color: rgba(6, 78, 59, 0.28); box-shadow: 0 18px 34px rgba(6, 78, 59, 0.12); }
`;

const Check = () => {
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [page]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    navigate('/');
  };

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-[#F8F7F3]/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => setPage('home')}>
          <div className="bg-[#064E3B] p-2 rounded-lg mr-2 shadow-lg">
            <Activity className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-[#064E3B] tracking-tight">
            Carevyn<span className="text-emerald-700 font-light">Hospital</span>
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => setPage('home')} 
            className={`text-sm font-semibold transition-colors ${page === 'home' ? 'text-[#064E3B]' : 'text-stone-500 hover:text-[#064E3B]'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setPage('appointment')} 
            className="text-sm font-semibold text-stone-500 hover:text-[#064E3B] transition-colors"
          >
            Services
          </button>
          <button 
            onClick={() => setPage('about')} 
            className={`text-sm font-semibold transition-colors ${page === 'about' ? 'text-[#064E3B]' : 'text-stone-500 hover:text-[#064E3B]'}`}
          >
            About
          </button>
          <button 
            onClick={() => {
              const footer = document.querySelector('footer');
              if (footer) footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-sm font-semibold text-stone-500 hover:text-[#064E3B] transition-colors"
          >
            Contact
          </button>
          {session ? (
            <>
              <button onClick={() => navigate(getDashboardPathForRole(session?.role))} className="text-sm font-semibold text-stone-500 hover:text-[#064E3B] transition-colors">Dashboard</button>
              <button onClick={handleLogout} className="bg-[#064E3B] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#0d6d53] shadow-md active:scale-95 transition-all">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-stone-500 hover:text-[#064E3B] transition-colors">Sign in</Link>
              <Link to="/hospital-register" className="bg-[#064E3B] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#0d6d53] shadow-md active:scale-95 transition-all">Register</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-[#064E3B]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#F8F7F3] border-b border-stone-200 p-6 space-y-4 fade-in">
          <button onClick={() => { setPage('home'); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-stone-600">Home</button>
          <button onClick={() => { setPage('appointment'); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-stone-600">Services</button>
          <button onClick={() => { setPage('about'); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-stone-600">About</button>
          <button onClick={() => { setIsMenuOpen(false); const footer = document.querySelector('footer'); if (footer) footer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="block w-full text-left font-bold text-stone-600">Contact</button>
          {session ? (
            <>
              <button onClick={() => { navigate(getDashboardPathForRole(session?.role)); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-[#064E3B]">Dashboard</button>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-[#064E3B]">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-left font-bold text-[#064E3B]">Sign in</Link>
              <Link to="/hospital-register" onClick={() => setIsMenuOpen(false)} className="block w-full text-left font-bold text-[#064E3B]">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );

  const Hero = () => (
    <section className="hero-surface py-16 lg:py-24 px-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] items-center gap-12">
        <div className="fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-[0.22em] rounded-full mb-6">
            <Heart className="h-4 w-4" /> Elite Medical Standards
          </span>
          <h1 className="hero-title text-5xl lg:text-7xl font-serif font-bold text-[#064E3B] mb-6 leading-[1.05]">
            Smarter care for
            <span className="block text-emerald-700 italic">every patient journey.</span>
          </h1>
          <p className="text-lg text-stone-600 mb-9 leading-relaxed max-w-xl font-sans">
            Carevyn Hospital connects leading specialists, seamless scheduling, digital records, and compassionate care in one modern clinical experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => setPage('appointment')}
              className="bg-[#064E3B] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#0d6d53] transition-all flex items-center justify-center shadow-lg active:scale-95"
            >
              Book an appointment <ChevronRight className="ml-2" size={20} />
            </button>
            {session ? (
              <button
                onClick={() => navigate(getDashboardPathForRole(session?.role))}
                className="border border-[#064E3B] text-[#064E3B] px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all"
              >
                Open dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="border border-[#064E3B] text-[#064E3B] px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center"
              >
                Hospital login
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            {[
              { label: '100+', detail: 'Specialists' },
              { label: '24/7', detail: 'Emergency care' },
              { label: '96%', detail: 'Patient satisfaction' }
            ].map((stat) => (
              <div key={stat.label} className="hero-stat text-left">
                <div className="text-2xl font-extrabold text-[#064E3B]">{stat.label}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mt-1">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block relative fade-in">
          <div className="hero-panel relative z-10 rounded-[2rem] overflow-hidden border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000"
              alt="Carevyn Medical Center"
              className="w-full h-[560px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B]/85 via-[#064E3B]/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 text-green-100 mb-3">
                <ShieldCheck size={18} className="text-emerald-300" />
                <span className="text-sm font-bold">Carevyn Hospital</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4 max-w-xs">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-100">Care quality</div>
                <div className="mt-2 text-2xl font-bold">A+ clinical outcomes</div>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute -bottom-12 -left-8 w-52 h-52 bg-stone-200 rounded-full blur-3xl opacity-60"></div>
        </div>
      </div>
    </section>
  );

  const Leadership = () => (
    <section className="py-24 px-6 bg-white slide-up">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#064E3B] mb-4">Our Distinguished Leadership</h2>
          <div className="w-24 h-1 bg-emerald-700 mx-auto rounded-full"></div>
          <p className="text-stone-500 mt-6 max-w-2xl mx-auto">Led by visionaries in medicine and healthcare management, our team ensures Carevyn remains at the forefront of clinical excellence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              name: "Dr. Aisha Bello",
              role: "Medical Director",
              specialty: "Family Medicine",
              img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
            },
            {
              name: "Dr. Daniel Okafor",
              role: "Chief Specialist",
              specialty: "Cardiovascular Surgery",
              img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
            },
            {
              name: "Dr. Grace Nwosu",
              role: "Clinical Lead",
              specialty: "Internal Medicine",
              img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400"
            }
          ].map((leader) => (
            <div key={leader.name} className="leader-card group relative bg-stone-50 rounded-[2rem] overflow-hidden border border-stone-100 transition-all hover:shadow-2xl">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={leader.img} alt={leader.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-8 text-center bg-white">
                <h3 className="text-xl font-bold text-[#064E3B]">{leader.name}</h3>
                <p className="text-emerald-700 font-semibold text-sm mb-1">{leader.role}</p>
                <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">{leader.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Form States
  const [loading, setLoading] = useState(false);
const nameRef = useRef();
const phoneRef = useRef();
const deptRef = useRef();
const issueRef = useRef();
const dateRef = useRef();
const timeRef = useRef();
const departmentOptions = [
  'Others',
  'Cardiovascular Surgery',
  'Neuroscience',
  'Oncology',
  'Modern Pediatrics',
  'General Medicine',
  'Dermatology',
  'Orthopedics',
  'ENT'
];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const handleSubmit1 = (e) => {
    e.preventDefault();
    if (!session?.token) {
      toast.info('Please log in before requesting an appointment.');
      navigate('/login');
      return;
    }
    setLoading(true);

    // 2. Extract values using .current.value
    const userData = { 
      firstName: nameRef.current.value, 
      phoneNumber: phoneRef.current.value, 
      department: deptRef.current.value, 
      issue: issueRef.current.value,
      date: dateRef.current.value,
      time: timeRef.current.value
    };

    // console.log("Sending to backend:", userData); 

    axios.post(`${API_URL}/patient/appointment`, userData, { headers: getAuthHeaders() })
      .then(() => {
        toast.success("Appointment Booked  kindly Expect a message on your whatsapp");
        setLoading(false);
      
        
       
      })
      .catch(() => {
        setLoading(false);
         toast.error("Internal Error!");
      });
  };

  const AboutSection = () => (
    <section className="bg-[#F8F7F3] py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0f766e]">About us</p>
          <h2 className="mt-4 text-4xl font-serif font-bold text-[#064E3B]">Compassionate care, clinical precision, and human connection.</h2>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="rounded-[2rem] overflow-hidden shadow-xl border border-stone-200 bg-white">
            <img
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895977?auto=format&fit=crop&q=80&w=1200"
              alt="Doctors in consultation"
              className="w-full h-[420px] object-cover"
            />
          </div>

          <div className="space-y-6">
            <p className="text-stone-600 leading-relaxed">
              Carevyn Hospital was built to give families a better healthcare experience—one that combines trusted specialists, streamlined digital records, and clean, patient-first support from admission to recovery.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Our philosophy is simple: every patient deserves clear communication, timely treatment, and a caring environment where they feel understood and supported.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                'Multi-specialist care',
                'Patient-centered workflows',
                'Modern diagnostics',
                'Secure digital records'
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white border border-stone-200 p-4 text-sm font-semibold text-[#064E3B] shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Our mission', text: 'To deliver accessible, high-quality care that helps every patient feel confident in their treatment journey.' },
            { title: 'Our vision', text: 'To transform healthcare delivery with technology, trust, and excellence across every touchpoint.' },
            { title: 'What we value', text: 'Safety, empathy, innovation, and a commitment to clinical outcomes that matter.' }
          ].map((card) => (
            <div key={card.title} className="bg-white rounded-[2rem] border border-stone-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">{card.title}</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const AppointmentView = () => (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_25%),linear-gradient(180deg,#f6f8f5_0%,#edf5f1_100%)] py-16 px-6 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
        <div className="bg-[#064E3B] rounded-[2rem] p-8 text-stone-50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100">
                <Calendar size={14} /> Priority booking
              </div>
              <h2 className="mt-8 text-4xl font-serif font-bold">Book your visit</h2>
              <p className="mt-4 text-sm text-emerald-100 leading-relaxed">
                Talk to the right specialist, get a fast response, and receive attentive care from our clinical team.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                { icon: Phone, label: '+234 9072606277', sub: 'Call for urgent support' },
                { icon: Clock, label: 'Mon - Sat: 8:00 AM - 8:00 PM', sub: 'Flexible appointment slots' },
                { icon: MapPin, label: 'Ogbomoso High School, Ogbomoso', sub: 'Hospital & Clinic access' }
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
                  <div className="bg-emerald-800/60 p-2 rounded-xl"><item.icon size={18} /></div>
                  <div>
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="text-xs text-emerald-100/80 mt-1">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <ShieldCheck size={16} className="text-emerald-300" /> Carevyn Secure
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl border border-stone-200 p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0f766e]">Patient booking</p>
            <h3 className="mt-3 text-3xl font-serif font-bold text-[#064E3B]">Request a scheduled visit</h3>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2 block">Patient name</label>
                <input required type="text" placeholder="Full name" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100 transition" ref={nameRef} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2 block">WhatsApp number</label>
                <input required type="text" placeholder="080..." className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100 transition" ref={phoneRef} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2 block">Department</label>
              <input required list="departments" defaultValue="Others" className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100 transition" ref={deptRef} placeholder="Type or select department" />
              <datalist id="departments">
                {departmentOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2 block">Tell us about your concern</label>
              <textarea required rows="5" placeholder="Describe your symptoms or reason for visit..." className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none resize-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100 transition" ref={issueRef}></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required type="date" ref={dateRef} min={new Date().toISOString().slice(0, 10)} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none" />
              <input required type="time" ref={timeRef} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Fast response', value: 'Within 30 min' },
                { label: 'Priority access', value: 'Care team triage' },
                { label: 'Secure booking', value: 'Verified patient info' }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-700">{item.label}</div>
                  <div className="mt-2 text-sm font-bold text-[#064E3B]">{item.value}</div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#064E3B] text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#0d6d53] shadow-lg active:scale-[0.98]'}`}
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? 'Processing...' : 'Request scheduled visit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

 

  return (
    <div className="home-shell min-h-screen font-sans">
      <style>{styles}</style>
      
      <Navbar />
      
      <main>
        {page === 'home' ? (
          <div>
            <Hero />
            
            <section className="py-20 px-6 max-w-7xl mx-auto slide-up mobile-gutter reveal-on-scroll">
              <div className="text-center mb-12">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0f766e]">Our services</p>
                <h2 className="section-heading mt-4 text-4xl font-serif font-bold text-[#064E3B]">Complete medical care, all in one place</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal-stagger">
                {[
                  { title: 'Emergency Care', icon: Activity, text: 'Trauma response and acute care available round-the-clock.' },
                  { title: 'Diagnostic Imaging', icon: Stethoscope, text: 'Advanced MRI, CT, and molecular imaging technologies.' },
                  { title: 'Precision Surgery', icon: Heart, text: 'Minimally invasive and robotic-assisted surgical excellence.' }
                ].map((s) => (
                  <div key={s.title} className="service-card p-8 bg-white rounded-[1.5rem] cursor-default">
                    <div className="bg-[#064E3B] text-white p-3 rounded-2xl w-fit mb-6 shadow-lg">
                      <s.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#064E3B] mb-3">{s.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="reveal-on-scroll"><Leadership /></div>

            <section className="bg-white py-20 px-6 border-y border-stone-100 mobile-gutter reveal-on-scroll">
              <div className="max-w-7xl mx-auto">
                <div className="max-w-2xl mb-12">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0f766e]">Care pathways</p>
                  <h2 className="section-heading mt-4 text-4xl font-serif font-bold text-[#064E3B]">Support for the care that happens between visits.</h2>
                  <p className="mt-4 text-stone-600 leading-relaxed">From specialist guidance to follow-up reminders, Carevyn keeps patients and care teams connected at every important step.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
                  {[
                    { icon: Stethoscope, title: 'Specialist clinics', text: 'Find focused care for family medicine, children, surgery, women’s health, eye care, ENT, and orthopaedics.' },
                    { icon: Calendar, title: 'Follow-up care', text: 'Keep the next visit, care instructions, and medication reminders together after the consultation.' },
                    { icon: Activity, title: 'Preventive checks', text: 'Make routine screening, wellness reviews, and early conversations part of your health plan.' },
                    { icon: ShieldCheck, title: 'Connected diagnostics', text: 'Lab requests and results move through the care team so important findings are easier to follow.' },
                    { icon: Heart, title: 'Pharmacy support', text: 'Prescriptions move from the clinician to dispensing with clear medication details and reminders.' },
                    { icon: Users, title: 'Care navigation', text: 'Get help choosing a department, preparing for a visit, or contacting the hospital when you need support.' }
                  ].map((item) => (
                    <article key={item.title} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6 hover:shadow-lg transition-shadow">
                      <div className="bg-[#064E3B] text-white p-3 rounded-2xl w-fit mb-5">{React.createElement(item.icon, { size: 22 })}</div>
                      <h3 className="text-xl font-bold text-[#064E3B] mb-2">{item.title}</h3>
                      <p className="text-sm text-stone-600 leading-relaxed">{item.text}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button onClick={() => setPage('appointment')} className="bg-[#064E3B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d6d53] transition-colors">Start with an appointment</button>
                  <Link to="/login" className="bg-emerald-100 text-[#064E3B] px-6 py-3 rounded-xl font-bold hover:bg-emerald-200 transition-colors">Sign in</Link>
                  <button onClick={() => document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#064E3B] font-bold hover:underline">Contact the care team</button>
                </div>
              </div>
            </section>

            <section className="bg-[#F8F7F3] py-24 px-6 mobile-gutter reveal-on-scroll">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_0.9fr] items-center gap-12">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0f766e]">Why choose us</p>
                  <h2 className="mt-4 text-4xl font-serif font-bold text-[#064E3B] mb-6">Built on a foundation of trust</h2>
                  <p className="text-stone-600 mb-8 leading-relaxed">We believe every medical success starts with a strong partnership between doctor and patient. Our facility is designed to deliver clarity, comfort, and clinically proven outcomes at every stage of care.</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="metric-card p-5">
                      <Award className="text-emerald-700 mb-3" size={24} />
                      <div className="font-bold text-[#064E3B]">ISO Certified</div>
                    </div>
                    <div className="metric-card p-5">
                      <Users className="text-emerald-700 mb-3" size={24} />
                      <div className="font-bold text-[#064E3B]">Patient Choice '25</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-md aspect-square bg-emerald-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400"
                      alt="Laboratory"
                      className="w-full h-full object-cover rounded-[2.3rem]"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : page === 'about' ? (
          <AboutSection />
        ) : (
          <AppointmentView />
        )}
      </main>

      <footer className="bg-[#064E3B] text-stone-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-emerald-900 pb-12 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center text-white font-bold text-xl mb-4">
               <Activity className="mr-2" size={20}/> Carevyn
            </div>
            <p className="text-xs leading-relaxed">Defining the next generation of healthcare through research and empathy.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/doctor" className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10">Staff login</Link>
              <Link to="/login" className="rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900 hover:bg-white">Sign in</Link>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-stone-300 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-stone-300 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-stone-300 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Services</h4>
            <ul className="text-xs space-y-2">
              <li className="hover:text-white cursor-pointer transition-colors">Neurology</li>
              <li className="hover:text-white cursor-pointer transition-colors">Cardiology</li>
              <li className="hover:text-white cursor-pointer transition-colors">Pediatrics</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Contact</h4>
            <ul className="text-xs space-y-2">
              <li>07044985701</li>
              <li>omowumioyegbile@gmail.com</li>
              <li>Ogbomoso High School, Ogbomoso</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-[10px] uppercase tracking-widest text-emerald-800">
          &copy; 2026 Carevyn Hospital Systems. Precision in Practice.
        </div>
      </footer>
        <ToastContainer />
    </div>
  );
};

export default Check;