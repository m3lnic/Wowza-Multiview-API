const express = require('express')
const app = express()

const { EXPRESS_CONFIGURATION } = require('./config/config.json')

const routes = require('./routes')
const cors = require('cors')

app.use(cors())

app.use('/', routes)

app.listen(EXPRESS_CONFIGURATION.PORT, () => {
    console.info(`EXPRESS CONFIGURATION LOADED: ${JSON.stringify(EXPRESS_CONFIGURATION)}`)
})