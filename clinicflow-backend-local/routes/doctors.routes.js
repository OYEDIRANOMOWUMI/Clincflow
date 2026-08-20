const express = require('express')
const router = express.Router()
const { getAuth,getLogin, getAllPatients } = require('../controllers/doctors.controllers')

router.post('/reg', getAuth)
router.post('/signin', getLogin)
router.get('/getUsers' ,getAllPatients)

module.exports = router