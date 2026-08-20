const { updatePatientRecord } = require('../controllers/patient.controllers')

const roles = ['doctor','nurse','pharmacy','laboratory']
const ids = ['pt-101','pt-102']

const runOne = async (id, role, payload) => {
  const req = { params: { id }, body: payload, user: { _id: role + '-user', role } }
  const res = { status(code){ this._status = code; return this }, json(p){ console.log('RESULT', id, role, this._status, p.success? 'ok': p.message || p ); return p } }
  try {
    await updatePatientRecord(req, res)
  } catch (err) {
    console.error('ERROR', id, role, err)
  }
}

const run = async () => {
  for (const id of ids) {
    for (const role of roles) {
      await runOne(id, role, { diagnosis: `Diag by ${role}`, notes: `Notes by ${role}` })
    }
  }
}

run().catch(err => console.error(err))
