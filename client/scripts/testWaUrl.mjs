import { buildWaUrl } from '../src/utils/phone.js'

const samples = [
  '08012345678',
  '+2348012345678',
  '2348012345678',
  '8012345678',
  'abc0801234',
  ''
]

for (const s of samples) {
  const msg = `Hi, this confirms your Carevyn appointment request for Others. We'll contact you shortly.`
  console.log(s, '->', buildWaUrl(s, msg))
}
