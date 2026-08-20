const express = require('express')
const router = express.Router()
const { getAuth,getLogin, getAllPatients, getAllDoctors } = require('../controllers/admin.contollers')


router.post('/reg', getAuth)
router.post('/signin', getLogin)
router.get('/getUsers' ,getAllDoctors)
router.get('/getPatient' ,getAllPatients)

module.exports = router