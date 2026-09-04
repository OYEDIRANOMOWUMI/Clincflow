const assert = require('node:assert/strict')
const router = require('../routes/workflow.routes')

const routes = new Set()

for (const layer of router.stack || []) {
  if (!layer.route) continue
  for (const method of Object.keys(layer.route.methods)) {
    routes.add(`${method.toUpperCase()} ${layer.route.path}`)
  }
}

assert(routes.has('PATCH /hospital/profile'), 'Missing PATCH /hospital/profile route')
assert(routes.has('GET /hospital/profile'), 'Missing GET /hospital/profile route')
assert(routes.has('POST /hospital/departments'), 'Missing POST /hospital/departments route')
assert(routes.has('PATCH /hospital/departments/:id'), 'Missing PATCH /hospital/departments/:id route')
assert(routes.has('DELETE /hospital/departments/:id'), 'Missing DELETE /hospital/departments/:id route')

console.log('workflow route assertions passed')
