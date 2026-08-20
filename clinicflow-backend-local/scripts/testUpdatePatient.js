const { updatePatientRecord } = require('../controllers/patient.controllers')

const run = async () => {
  const req = {
    params: { id: 'pt-101' },
    body: { diagnosis: 'Test diagnosis', notes: 'Test note', condition: 'Test condition' },
    user: { _id: null, role: 'doctor' }
  }

  const res = {
    status(code) { this._status = code; return this },
    json(payload) { console.log('STATUS', this._status); console.log(JSON.stringify(payload, null, 2)); return payload }
  }

  await updatePatientRecord(req, res)
}

run().catch(err => console.error(err))
