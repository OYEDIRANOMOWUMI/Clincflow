const API = 'http://localhost:3700/api'

async function run() {
  console.log('1) POST /patient/appointment')
  let res = await fetch(`${API}/patient/appointment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: 'E2E Test', phoneNumber: '08012345678', department: 'Others', issue: 'Test issue' })
  })
  const postAppt = await res.json()
  console.log('POST appointment status:', res.status, postAppt)

  console.log('\n2) GET /demo/patients')
  res = await fetch(`${API.replace('/api','')}/demo/patients`)
  const patients = await res.json()
  console.log('GET patients demo status:', res.status, patients && (patients.patients ? patients.patients.slice(0,2) : patients))

  const id = patients?.patients?.[0]?.id || 'pt-101'
  console.log('\n3) PUT /demo/patients/' + id)
  res = await fetch(`${API.replace('/api','')}/demo/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diagnosis: 'E2E verify diag', notes: 'E2E verify notes' })
  })
  const putRes = await res.json()
  console.log('PUT response status:', res.status, putRes)

  console.log('\n4) GET /demo/patients (confirm)')
  res = await fetch(`${API.replace('/api','')}/demo/patients`)
  const patients2 = await res.json()
  console.log('GET patients demo after update:', res.status, patients2 && (patients2.patients ? patients2.patients.slice(0,2) : patients2))
}

run().catch(err => { console.error(err); process.exit(1) })
