const express = require('express')
const request = require('request')

const parseString = require('xml2js').parseString

const { WOWZA_INFORMATION } = require('../../config/config.json')

const router = express.Router()

router.get('/', (req, res) => {
    const url = `http://${WOWZA_INFORMATION.ADDRESS}:${WOWZA_INFORMATION.API_PORT}/v2/servers/${WOWZA_INFORMATION.SERVER_NAME}/vhosts/${WOWZA_INFORMATION.VHOST_NAME}/applications/${WOWZA_INFORMATION.APP_NAME}/instances`
    request.get(url, (error, response, body) => {
        if (error) {
            res.status(500).json({ error: "Unable to get data" })
        }

        if (response) {
            parseString(body, (err, result) => {
                if (err) {
                    res.status(500).json({ error: "Unable to parse data" })
                    return
                }

                const responseJSON = { links: [] }

                if (result.Instances.InstanceList === undefined) {
                    res.status(200).json({message: "no data"})
                    return
                }

                const data = result.Instances.InstanceList[0].IncomingStreams.map(inStream => inStream.IncomingStream.map(streamInfo => {
                    if (streamInfo.SourceIp[0] !== "local (Transcoder)")
                        responseJSON.links.push(`http://${WOWZA_INFORMATION.ADDRESS}:${WOWZA_INFORMATION.RTMP_PORT}/${WOWZA_INFORMATION.APP_NAME}/${streamInfo.Name[0]}/manifest.mpd`)
                }))

                console.log(responseJSON)

                res.status(200).json(responseJSON)
            })
        }
    }).auth(WOWZA_INFORMATION.LOGIN_USERNAME, WOWZA_INFORMATION.LOGIN_PASSWORD, false)
})

module.exports = router