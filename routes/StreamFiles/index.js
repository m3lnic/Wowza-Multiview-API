const express = require('express')
const request = require('request')

const parseString = require('xml2js').parseString

const { WOWZA_INFORMATION } = require('../../config/config.json')

const router = express.Router()

router.get('/', (req, res) => {
    const url = "http://148.88.67.141:8087/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/live/instances"
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
                        responseJSON.links.push(`http://148.88.67.141:1935/live/${streamInfo.Name[0]}/manifest.mpd`)
                }))

                console.log(responseJSON)

                res.status(200).json(responseJSON)
            })
        }
    }).auth("LA1TV", "CliffordLikesLA1TV", false)
})

module.exports = router