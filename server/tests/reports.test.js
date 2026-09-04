const assert = require('node:assert/strict')
const { parseDate, monthKey } = require('../controllers/reports.controllers')

const fallback = new Date('2026-01-01T00:00:00.000Z')
assert.equal(parseDate('not-a-date', fallback), null)
assert.equal(parseDate(undefined, fallback), fallback)
assert.equal(monthKey(new Date('2026-09-02T12:00:00.000Z')), '2026-09')

console.log('reports test passed')
