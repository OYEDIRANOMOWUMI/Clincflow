import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, RefreshCw, Search } from 'lucide-react'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/admin/audit-logs`, { headers: getAuthHeaders() })
      setLogs(response.data?.logs || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const filteredLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return logs
    return logs.filter((log) => [log.action, log.targetType, log.actor?.name, log.actor?.email].some((value) => String(value || '').toLowerCase().includes(normalized)))
  }, [logs, query])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 p-6 text-white shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-white/10 p-3"><ClipboardList className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Security history</p><h2 className="mt-2 text-3xl font-bold">Audit log</h2><p className="mt-1 text-sm text-emerald-100">Review activity recorded across your hospital.</p></div></div><button type="button" onClick={fetchLogs} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button></div></section>
      {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={fetchLogs} className="font-semibold underline">Retry</button></div>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold text-slate-900">Activity history</h3><p className="mt-1 text-sm text-slate-500">{filteredLogs.length} visible entr{filteredLogs.length === 1 ? 'y' : 'ies'}</p></div><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity" className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-700" /></label></div>{loading ? <div className="space-y-3 p-5">{[1, 2, 3, 4].map((row) => <div key={row} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div> : filteredLogs.length === 0 ? <div className="p-14 text-center text-sm text-slate-500">No audit activity matches this view.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3 font-semibold">Time</th><th className="px-5 py-3 font-semibold">Actor</th><th className="px-5 py-3 font-semibold">Action</th><th className="px-5 py-3 font-semibold">Target</th></tr></thead><tbody>{filteredLogs.map((log) => <tr key={log._id} className="border-t border-slate-200 hover:bg-slate-50"><td className="whitespace-nowrap px-5 py-4 text-slate-600">{new Date(log.timestamp).toLocaleString()}</td><td className="px-5 py-4"><p className="font-semibold text-slate-900">{log.actor?.name || 'Unknown user'}</p><p className="text-xs text-slate-500">{log.actor?.role || ''}</p></td><td className="px-5 py-4 font-medium text-slate-800">{log.action}</td><td className="px-5 py-4 text-slate-600">{log.targetType}</td></tr>)}</tbody></table></div>}</section>
    </div>
  )
}
