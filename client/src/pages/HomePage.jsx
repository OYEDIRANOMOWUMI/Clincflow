import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Zap,
  TrendingUp,
  Users,
  Lock,
  BarChart3,
  Clock,
  Ambulance,
  FileCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    icon: ShieldCheck,
    title: 'Secure hospital operations',
    text: 'Role-based access for administrators, clinicians, pharmacy, lab, reception, and patient services.',
    color: 'from-blue-50 to-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    icon: Stethoscope,
    title: 'Clinical workflow visibility',
    text: 'Track patient activity, specialist referrals, appointments, and records from a single operational view.',
    color: 'from-emerald-50 to-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    icon: CalendarCheck2,
    title: 'Efficient scheduling',
    text: 'Manage doctor rosters, patient waitlists, and scheduling availability without operational chaos.',
    color: 'from-purple-50 to-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
];

const capabilities = [
  { icon: Zap, text: 'Real-time patient insights' },
  { icon: TrendingUp, text: 'Performance analytics' },
  { icon: Clock, text: 'Automated scheduling' },
  { icon: Lock, text: 'Enterprise security' },
];

const metrics = [
  { value: '24/7', label: 'Care visibility' },
  { value: '98%', label: 'Operational readiness' },
  { value: '1 platform', label: 'Clinical coordination' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 text-white shadow-lg">
              <Ambulance className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-700 leading-none">Carevyn</p>
              <p className="text-xs font-semibold text-slate-600">Hospital</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="hidden sm:inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Sign in
            </Link>
            <Link to="/register" className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-10 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-8 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-100 backdrop-blur-sm">
            <HeartPulse className="h-4 w-4" />
            Healthcare Revolution
          </div>

          <h1 className="max-w-4xl text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-white mb-6">
            Hospital management <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-blue-200 bg-clip-text text-transparent">reimagined</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-emerald-50/80 mb-10">
            Carevyn brings together hospital administration, care teams, patient access, and operational intelligence in one dependable platform. Built for modern healthcare systems to deliver exceptional patient care while streamlining workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-emerald-900 shadow-2xl transition hover:shadow-3xl hover:bg-emerald-50">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10 backdrop-blur-sm">
              Staff Login
            </Link>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 border-t border-white/10 pt-8">
            {metrics.map((item) => (
              <div key={item.label}>
                <p className="text-3xl md:text-4xl font-black text-white">{item.value}</p>
                <p className="text-sm md:text-base text-emerald-100/80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image Card */}
        <div className="relative mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80"
              alt="Hospital dashboard interface"
              className="w-full h-96 object-cover"
            />
            <div className="bg-gradient-to-t from-slate-900 to-slate-800 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/20 p-3">
                  <BarChart3 className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-emerald-300">Live Operations</p>
                  <p className="text-lg font-bold">186 patients • 38 consultations • 12 pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {capabilities.map(({ icon: Icon, text }) => (
            <div key={text} className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-center hover:shadow-md transition">
              <div className="flex justify-center mb-3">
                <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 mb-4">Why Choose Carevyn</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Built for safety, speed, <br /> and better patient outcomes.
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, text, color, iconBg, iconColor }) => (
            <div key={title} className={`rounded-2xl bg-gradient-to-br ${color} border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300`}>
              <div className={`mb-6 inline-flex rounded-xl ${iconBg} p-4 text-emerald-800`}>
                <Icon className={`h-7 w-7 ${iconColor}`} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-700 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section with Partners */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-8">Trusted by hospitals worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['NOVA CARE', 'ST. MARY', 'GREENFIELD', 'CITYMED', 'LIFECARE', 'AURORA'].map((brand) => (
              <div key={brand} className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-5 text-sm font-bold tracking-wider text-slate-500 shadow-sm hover:shadow-md transition">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="mb-6 inline-flex rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">Operational Excellence</div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
              From intake to discharge: complete visibility.
            </h2>
            <ul className="space-y-4">
              {[
                'Centralized patient records and documentation',
                'Reduced scheduling delays and bottlenecks',
                'Secure, role-based access across departments',
                'Real-time collaboration between teams',
                'Automated notifications and workflows'
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="rounded-lg bg-white/10 p-8 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100 mb-4">Platform Features</p>
              <h3 className="text-2xl font-black mb-6">Everything included</h3>
              <div className="space-y-3">
                {[
                  'Patient appointment booking',
                  'Doctor shift scheduling',
                  'Internal referral tracking',
                  'Waitlist management',
                  'Staff and patient roles',
                  'Hospital admin dashboard'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-200 flex-shrink-0" />
                    <span className="text-emerald-50">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Transform your hospital operations today</h2>
          <p className="text-lg text-emerald-50/90 mb-10 max-w-2xl mx-auto">
            Join hospitals worldwide using Carevyn to deliver better patient care while streamlining operational workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-bold text-emerald-900 shadow-xl hover:shadow-2xl hover:bg-emerald-50 transition">
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-transparent px-8 py-4 font-bold text-white hover:bg-white/10 transition">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <Ambulance className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-900">Carevyn</span>
              </div>
              <p className="text-sm text-slate-600">Built for modern hospital care and operations.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-4">Product</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-emerald-600 transition">Features</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition">Pricing</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-4">Company</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-emerald-600 transition">About</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition">Blog</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-emerald-600 transition">Privacy</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition">Terms</Link></li>
                <li><Link to="/" className="hover:text-emerald-600 transition">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8">
            <p className="text-center text-sm text-slate-600">
              © 2026 Carevyn. All rights reserved. Powering healthcare delivery worldwide.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
