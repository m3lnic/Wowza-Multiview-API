const express = require('express')
const router = express.Router()

router.use('/streamfiles', require('./StreamFiles'))

module.exports = router