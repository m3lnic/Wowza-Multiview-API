const express = require('express')
const app = express()

const webPort = 3001

const routes = require('./routes')

app.use('/', routes)

app.listen(webPort, () => console.log(`API Listening on ${webPort}`))