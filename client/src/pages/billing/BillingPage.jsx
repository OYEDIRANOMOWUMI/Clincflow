import { useEffect, useState } from 'react'
import { BadgeDollarSign, FileText, Loader2, RefreshCw, UserRound } from 'lucide-react'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import { getSession } from '../../auth'

const money = (value) => `$${Number(value || 0).toFixed(2)}`

export default function BillingPage() {
  const session = getSession()
  const [invoices, setInvoices] = useState([])
  const [summary, setSummary] = useState({ total: 0, paid: 0, unpaid: 0, totalBilled: 0, totalPaid: 0, outstanding: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_URL}/payments/invoices`, { headers: getAuthHeaders() })
      setInvoices(response.data?.invoices || [])
      setSummary(response.data?.summary || summary)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-800 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3"><BadgeDollarSign className="h-6 w-6" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Financial workspace</p><h2 className="mt-2 text-3xl font-bold">{session?.role === 'admin' ? 'Hospital billing' : 'My invoices'}</h2><p className="mt-1 text-sm text-emerald-100">{session?.role === 'admin' ? 'Track issued invoices and outstanding balances.' : 'Review prescriptions and payment history.'}</p></div>
          </div>
          <button type="button" onClick={fetchInvoices} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>
      </section>

      {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={fetchInvoices} className="font-semibold underline">Retry</button></div>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Invoices', summary.total],
          ['Paid', summary.paid],
          ['Outstanding', money(summary.outstanding)],
          ['Collected', money(summary.totalPaid)]
        ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></div>)}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4"><h3 className="font-bold text-slate-900">Invoice ledger</h3></div>
        {loading ? <div className="space-y-3 p-5">{[1, 2, 3, 4].map((row) => <div key={row} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}</div> : invoices.length === 0 ? <div className="p-14 text-center text-sm text-slate-500">No invoices are available yet.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3 font-semibold">Invoice</th>{session?.role === 'admin' && <th className="px-5 py-3 font-semibold">Patient</th>}<th className="px-5 py-3 font-semibold">Medication</th><th className="px-5 py-3 font-semibold">Issued</th><th className="px-5 py-3 font-semibold">Amount</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t border-slate-200 hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-700" /><span className="font-semibold text-slate-900">{invoice.invoiceNumber}</span></div></td>{session?.role === 'admin' && <td className="px-5 py-4"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-400" />{invoice.patient?.name || 'Patient'}</div></td>}<td className="px-5 py-4 text-slate-700">{invoice.medications.map((item) => item.name).join(', ')}</td><td className="px-5 py-4 text-slate-600">{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : '—'}</td><td className="px-5 py-4 font-semibold text-slate-900">{money(invoice.amount)}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{invoice.status}</span></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  )
}
