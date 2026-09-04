import { useMemo, useState, useEffect } from 'react';
import { PencilLine, Save, Trash2, UserRound, Users, CalendarDays, TrendingUp, Loader2 } from 'lucide-react';
import { patientApi } from '../../api';
import { patientRecords as fallbackRecords } from '../../data/patientRecords';

const emptyDraft = {
  id: '',
  name: '',
  age: '',
  condition: '',
  status: 'Stable',
  diagnosis: '',
  notes: '',
  doctor: '',
  nurse: '',
  lastUpdated: new Date().toISOString().slice(0, 10),
};

export default function StaffPatientsPage({ role = 'doctor' }) {
  const [records, setRecords] = useState(fallbackRecords);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const [response, volumeResponse] = await Promise.allSettled([patientApi.list(), patientApi.volume()]);
      if (response.status !== 'fulfilled') throw response.reason;
      if (response.value.data?.patients?.length > 0) {
        setRecords(response.value.data.patients);
      } else {
        setRecords(fallbackRecords);
      }
      setVolume(volumeResponse.status === 'fulfilled' ? volumeResponse.value.data?.volume || null : null);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setRecords(fallbackRecords);
      setError('Unable to load live patient data. Showing cached records.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = useMemo(() => {
    const labels = {
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Reception',
      pharmacy: 'Pharmacy',
      laboratory: 'Laboratory',
      admin: 'Admin',
    };
    return labels[role] || 'Staff';
  }, [role]);

  const startEditing = (record) => {
    setEditingId(record.id);
    setDraft({
      id: record.id,
      name: record.name,
      age: record.age,
      condition: record.condition,
      status: record.status,
      diagnosis: record.diagnosis,
      notes: record.notes,
      doctor: record.doctor,
      nurse: record.nurse,
      lastUpdated: record.lastUpdated,
    });
  };

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const saveRecord = async () => {
    try {
      setSaving(true);
      setError(null);
      const updateData = {
        diagnosis: draft.diagnosis,
        notes: draft.notes,
        status: draft.status,
        condition: draft.condition,
        age: draft.age,
      };

      const response = await patientApi.update(editingId, updateData);
      const savedPatient = response.data?.patient;
      if (!savedPatient) throw new Error('The server did not return the saved patient record');

      // Update local state
      setRecords((current) =>
        current.map((record) =>
          record.id === editingId
            ? { ...record, ...savedPatient, age: Number(savedPatient.age) || 0 }
            : record
        )
      );
      setEditingId(null);
      setDraft(emptyDraft);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record. Your changes were not saved.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (recordId) => {
    try {
      // Try to delete from API
      try {
        await patientApi.delete(recordId);
      } catch (apiError) {
        console.warn('API delete failed, using local state:', apiError);
      }

      // Update local state
      setRecords((current) => current.filter((record) => record.id !== recordId));
      if (editingId === recordId) {
        setEditingId(null);
        setDraft(emptyDraft);
      }
    } catch (err) {
      setError('Failed to delete record');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Care team access</p>
        <h2 className="mt-2 text-3xl font-bold">{roleLabel} patient records</h2>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Total patients', volume?.total ?? records.length, Users],
          ['Currently in hospital', volume?.active ?? records.length, UserRound],
          ['Entered today', volume?.admissionsToday ?? 0, CalendarDays],
          ['Entered this week', volume?.admissionsWeek ?? 0, TrendingUp],
          ['Entered this month', volume?.admissionsMonth ?? 0, CalendarDays]
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500"><span className="text-xs font-semibold uppercase tracking-wide">{label}</span><Icon className="h-5 w-5 text-emerald-700" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">Condition</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Diagnosis</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const isEditing = editingId === record.id;

              return (
                <tr key={record.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{record.name}</p>
                        <p className="text-xs text-slate-500">Age {record.age}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {isEditing ? (
                      <input name="condition" value={draft.condition} onChange={handleDraftChange} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2" />
                    ) : (
                      record.condition
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {isEditing ? (
                      <select name="status" value={draft.status} onChange={handleDraftChange} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
                        <option>Stable</option>
                        <option>Monitoring</option>
                        <option>Recovering</option>
                        <option>Observation</option>
                      </select>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        {record.status}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {isEditing ? (
                      <textarea name="diagnosis" value={draft.diagnosis} onChange={handleDraftChange} rows="3" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2" />
                    ) : (
                      record.diagnosis
                    )}
                  </td>

                  <td className="px-4 py-4 text-slate-700">{record.lastUpdated}</td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <button type="button" onClick={saveRecord} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      ) : (
                        <button type="button" onClick={() => startEditing(record)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}

                      <button type="button" onClick={() => deleteRecord(record.id)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
