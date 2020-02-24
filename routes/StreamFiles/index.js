const express = require('express')
const request = require('request')

const parseString = require('xml2js').parseString

const { WOWZA_INFORMATION } = require('../../config/config.json')

const router = express.Router()

router.get('/', (req, res) => {
    const url = `http://${WOWZA_INFORMATION.ADDRESS}:${WOWZA_INFORMATION.API_PORT}/v2/servers/${WOWZA_INFORMATION.SERVER_NAME}/vhosts/${WOWZA_INFORMATION.VHOST_NAME}/applications/${WOWZA_INFORMATION.APP_NAME}/instances`
    request.get(url, (error, response, body) => {
        if (error) {
            console.log(error)
            return
        }

        if (response) {
            parseString(body, (err, result) => {
                if (err) {
                    console.log(err)
                    return
                }

                const { Instances: { InstanceList } } = result
                const { IncomingStreams } = InstanceList[0]
                const { IncomingStream } = IncomingStreams[0]

                const BuiltResponse = { "Streams": [] }

                if (IncomingStream !== undefined) {
                    IncomingStream.map(Instance => {
                        if (Instance.SourceIp[0] === "local (Transcoder)") {
                            BuiltResponse.Streams.map(builtValue => {
                                if (Instance.Name[0].includes(`${builtValue.Name}_`)) {
                                    const splitName = Instance.Name[0].split('_')

                                    if (builtValue.Qualities === undefined)
                                        builtValue.Qualities = []

                                    builtValue.Qualities.push(splitName[1])
                                }
                            })
                        } else {
                            const tempObject = {}
                            tempObject.Name = Instance.Name[0].split('_')[0]
                            BuiltResponse.Streams.push(tempObject)
                        }
                    })
                } else {
                    
                }

                console.log(JSON.stringify(BuiltResponse))
            })
        }

        res.status(200).json({ "message": "TESTING" })
    }).auth(WOWZA_INFORMATION.LOGIN_USERNAME, WOWZA_INFORMATION.LOGIN_PASSWORD, false)
})

module.exports = router