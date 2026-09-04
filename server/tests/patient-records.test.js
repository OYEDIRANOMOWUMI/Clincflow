const assert = require('node:assert/strict');
const { buildPatientUpdate, isAllowedToEditPatientRecord } = require('../controllers/patient.controllers');

const payload = {
  diagnosis: 'Improved blood pressure',
  notes: 'Follow-up in one week',
  status: 'Ready for review'
};

assert.equal(isAllowedToEditPatientRecord('doctor'), true);
assert.equal(isAllowedToEditPatientRecord('nurse'), true);
assert.equal(isAllowedToEditPatientRecord('pharmacy'), true);
assert.equal(isAllowedToEditPatientRecord('laboratory'), true);
assert.equal(isAllowedToEditPatientRecord('patient'), false);

const result = buildPatientUpdate({ diagnosis: 'Improved blood pressure', notes: 'Follow-up in one week', status: 'Ready for review' }, {
  diagnosis: 'Initial evaluation',
  notes: 'Needs review'
});

assert.equal(result.diagnosis, 'Improved blood pressure');
assert.equal(result.notes, 'Needs review | Follow-up in one week');
assert.equal(result.status, 'Ready for review');

console.log('patient-records test passed');
