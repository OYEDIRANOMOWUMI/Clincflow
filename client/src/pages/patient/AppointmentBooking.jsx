import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { API_URL, getAuthHeaders } from '../../api'
import { getSession } from '../../auth'

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  dateTime: z.string().min(1, 'Please select a date and time'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  notes: z.string().optional(),
  medicationName: z.string().optional(),
  frequency: z.string().optional(),
  reminderTime: z.string().optional()
})

export default function PatientAppointmentBooking() {
  const session = getSession()
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(appointmentSchema)
  })

  const selectedDoctorId = watch('doctorId')

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true)
        const response = await axios.get(`${API_URL}/doctors`, { headers: getAuthHeaders() })
        setDoctors(response.data?.doctors || [])
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError('Unable to load doctors right now. Please try again later.')
      } finally {
        setLoadingDoctors(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDoctorId) {
        setSlots([])
        setSelectedSlot('')
        setValue('dateTime', '')
        return
      }

      try {
        setLoadingSlots(true)
        setError('')
        const response = await axios.get(`${API_URL}/availability?doctorId=${selectedDoctorId}`, { headers: getAuthHeaders() })
        const nextSlots = response.data?.slots || []
        setSlots(nextSlots)

        if (nextSlots.length > 0) {
          const firstAvailable = nextSlots[0].value
          setSelectedSlot(firstAvailable)
          setValue('dateTime', firstAvailable)
        } else {
          setSelectedSlot('')
          setValue('dateTime', '')
        }
      } catch (err) {
        console.error('Error fetching availability:', err)
        setSlots([])
        setSelectedSlot('')
        setValue('dateTime', '')
        setError(err.response?.data?.message || 'No open consultation slots are available for this doctor right now.')
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailability()
  }, [selectedDoctorId, setValue])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      setSuccessMessage('')

      const patientId = session?.userId || session?.user?.id || session?.user?._id

      if (!patientId) {
        setError('You must be logged in to book an appointment')
        return
      }

      const response = await axios.post(
        `${API_URL}/appointments`,
        {
          patientId,
          doctorId: data.doctorId,
          dateTime: data.dateTime,
          reason: data.reason,
          notes: data.notes || ''
        },
        { headers: getAuthHeaders() }
      )

      if (data.medicationName?.trim()) {
        await axios.post(
          `${API_URL}/medication-reminders`,
          {
            medicationName: data.medicationName.trim(),
            frequency: data.frequency || 'Once daily',
            reminderTimes: data.reminderTime ? [data.reminderTime] : [],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 86400000).toISOString()
          },
          { headers: getAuthHeaders() }
        )
      }

      if (response.data?.appointment) {
        setSuccessMessage(`Appointment booked successfully with ${response.data.appointment.doctorName} on ${new Date(response.data.appointment.date).toLocaleDateString()}`)
        reset()
        setSelectedSlot('')
        setTimeout(() => {
          setSuccessMessage('')
        }, 5000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Book an Appointment</h1>
            </div>
            <p className="text-emerald-100">Schedule a consultation with one of our doctors</p>
          </div>

          <div className="p-6 md:p-8">
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Success!</p>
                  <p className="text-emerald-800">{successMessage}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Select Doctor
                </label>
                <select
                  {...register('doctorId')}
                  disabled={loadingDoctors}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                >
                  <option value="">{loadingDoctors ? 'Loading doctors...' : 'Choose a doctor'}</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.department || 'General'}
                    </option>
                  ))}
                </select>
                {errors.doctorId && <p className="text-red-600 text-sm mt-1">{errors.doctorId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Available time slots
                </label>

                {loadingSlots ? (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading available slots...
                  </div>
                ) : !selectedDoctorId ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Select a doctor to view available slots.
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    No open slots are currently available for this doctor.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot.value)
                          setValue('dateTime', slot.value)
                        }}
                        className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                          selectedSlot === slot.value
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}

                {errors.dateTime && <p className="text-red-600 text-sm mt-1">{errors.dateTime.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-2" />
                  Reason for Visit
                </label>
                <textarea
                  {...register('reason')}
                  placeholder="Describe your symptoms or reason for the visit"
                  rows="4"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  placeholder="Any additional information you'd like to share"
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Medication name</label>
                  <input
                    {...register('medicationName')}
                    placeholder="e.g. Paracetamol"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Frequency</label>
                  <select
                    {...register('frequency')}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    defaultValue=""
                  >
                    <option value="">Not set</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reminder time</label>
                  <input
                    type="time"
                    {...register('reminderTime')}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || loadingDoctors || loadingSlots}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Note:</span> Your appointment will be pending until confirmed by the doctor or hospital staff. You'll receive a confirmation notification once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
