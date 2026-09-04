const express = require('express')
const router = express.Router()
const { getAuth,getLogin, getAllPatients } = require('../controllers/doctors.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

router.post('/reg', getAuth)
router.post('/signin', getLogin)
router.get('/getUsers', authMiddleware, requireRole('doctor'), getAllPatients)

module.exports = router