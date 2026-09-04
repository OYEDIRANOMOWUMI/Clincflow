const API = 'http://localhost:3700/api'

async function run() {
  console.log('GET /patients')
  let res = await fetch(`${API}/patients`)
  const list = await res.json()
  console.log('patients response:', list?.patients ? list.patients.slice(0,2) : list)

  const id = list?.patients?.[0]?.id || 'pt-101'
  console.log('PUT /patients/' + id)
  res = await fetch(`${API}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diagnosis: 'E2E Test diag', notes: 'E2E Test note' })
  })
  const putRes = await res.json()
  console.log('PUT response:', putRes)
}

run().catch(err => { console.error(err); process.exit(1) })
