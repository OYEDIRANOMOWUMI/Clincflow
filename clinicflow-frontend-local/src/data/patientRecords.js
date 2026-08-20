export const patientRecords = [
  {
    id: 'pt-101',
    name: 'Maya Thompson',
    age: 34,
    condition: 'Hypertension follow-up',
    status: 'Stable',
    diagnosis: 'Controlled hypertension, monitor medication adherence.',
    notes: 'Patient reports improved sleep and reduced dizziness.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  },
  {
    id: 'pt-102',
    name: 'John Okafor',
    age: 52,
    condition: 'Chest pain review',
    status: 'Monitoring',
    diagnosis: 'Cardiac symptoms under observation.',
    notes: 'ECG reviewed; needs follow-up results before discharge.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  },
  {
    id: 'pt-103',
    name: 'Adebayo Musa',
    age: 41,
    condition: 'Post-op recovery',
    status: 'Recovering',
    diagnosis: 'Post-operative recovery with expected healing progression.',
    notes: 'Mobility improving; continue hydration regime.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  },
  {
    id: 'pt-104',
    name: 'Rachel Lee',
    age: 29,
    condition: 'Migraine with dizziness',
    status: 'Observation',
    diagnosis: 'Migraine flare under evaluation.',
    notes: 'Hydration check and glucose trend review pending.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  }
]

export const staffAppointments = [
  {
    id: 'appt-1',
    patientId: 'pt-101',
    patient: 'Maya Thompson',
    time: '09:00 AM',
    date: '2026-08-19',
    complaint: 'Hypertension follow-up',
    status: 'approved',
    doctor: 'Dr. Aisha Bello'
  },
  {
    id: 'appt-2',
    patientId: 'pt-102',
    patient: 'John Okafor',
    time: '10:30 AM',
    date: '2026-08-19',
    complaint: 'Chest pain review',
    status: 'pending',
    doctor: 'Dr. Aisha Bello'
  },
  {
    id: 'appt-3',
    patientId: 'pt-103',
    patient: 'Adebayo Musa',
    time: '12:15 PM',
    date: '2026-08-19',
    complaint: 'Post-op recovery',
    status: 'review',
    doctor: 'Dr. Aisha Bello'
  },
  {
    id: 'appt-4',
    patientId: 'pt-104',
    patient: 'Rachel Lee',
    time: '02:00 PM',
    date: '2026-08-19',
    complaint: 'Migraine evaluation',
    status: 'pending',
    doctor: 'Dr. Aisha Bello'
  }
]

export const pharmacyQueue = [
  { id: 'rx-1', patientId: 'pt-101', patient: 'Maya Thompson', drug: 'Amlodipine', dosage: '5mg', status: 'Paid', paid: true, instructions: 'Take once daily after breakfast.' },
  { id: 'rx-2', patientId: 'pt-102', patient: 'John Okafor', drug: 'Metformin', dosage: '500mg', status: 'Unpaid', paid: false, instructions: 'Take twice daily with food.' },
  { id: 'rx-3', patientId: 'pt-104', patient: 'Rachel Lee', drug: 'Ibuprofen', dosage: '200mg', status: 'Paid', paid: true, instructions: 'Take as needed for pain, max 2 tablets per 24 hours.' }
]

export const labQueue = [
  { id: 'lab-1', patientId: 'pt-101', patient: 'Maya Thompson', test: 'Lipid panel', status: 'Requested', result: '' },
  { id: 'lab-2', patientId: 'pt-103', patient: 'Adebayo Musa', test: 'CBC', status: 'In progress', result: 'Awaiting review' },
  { id: 'lab-3', patientId: 'pt-104', patient: 'Rachel Lee', test: 'Blood glucose', status: 'Requested', result: '' }
]
