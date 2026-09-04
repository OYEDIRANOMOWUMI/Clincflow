import { useEffect, useState } from 'react'
import { CalendarDays, Loader2, TrendingUp, UserRound, Users } from 'lucide-react'
import { patientApi } from '../api'

const cards = [
  { key: 'active', label: 'In hospital now', Icon: UserRound },
  { key: 'admissionsToday', label: 'Entered today', Icon: CalendarDays },
  { key: 'admissionsWeek', label: 'Entered this week', Icon: TrendingUp },
  { key: 'admissionsMonth', label: 'Entered this month', Icon: CalendarDays },
  { key: 'total', label: 'Total patients', Icon: Users }
]

export default function PatientVolumeCards() {
  const [volume, setVolume] = useState(null)

  useEffect(() => {
    patientApi.volume()
      .then((response) => setVolume(response.data?.volume || null))
      .catch((error) => console.error('Failed to load patient volume:', error))
  }, [])

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hospital activity</p>
          <h2 className="text-lg font-bold text-slate-900">Patient census and admissions</h2>
        </div>
        {!volume && <Loader2 className="h-5 w-5 animate-spin text-emerald-700" aria-label="Loading patient volume" />}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map(({ key, label, Icon }) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
              <Icon className="h-5 w-5 shrink-0 text-emerald-700" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{volume?.[key] ?? '—'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
