const express = require('express')
const request = require('request')

const parseString = require('xml2js').parseString

const { WOWZA_INFORMATION } = require('../../config/config.json')

const router = express.Router()

router.get('/', (req, res) => {
    const url = `http://${WOWZA_INFORMATION.ADDRESS}:${WOWZA_INFORMATION.API_PORT}/v2/servers/${WOWZA_INFORMATION.SERVER_NAME}/vhosts/${WOWZA_INFORMATION.VHOST_NAME}/applications/${WOWZA_INFORMATION.APP_NAME}/instances`

    const BuiltResponse = {}

    request.get(url, (requestError, response, body) => {
        if (requestError) {
            BuiltResponse.Error = requestError
            BuiltResponse.Status = 400
        }

        if (response && !requestError) {
            parseString(body, (parseError, result) => {
                if (parseError) {
                    BuiltResponse.Error = requestError
                    BuiltResponse.Status = 400
                }

                const { Instances: { InstanceList } } = result

                if (InstanceList !== undefined && !parseError) {
                    const { IncomingStreams } = InstanceList[0]
                    const { IncomingStream } = IncomingStreams[0]

                    BuiltResponse.Streams = []
                    BuiltResponse.Status = 200;

                    IncomingStream.map(Instance => {
                        if (Instance.SourceIp[0] === "local (Transcoder)") {
                            BuiltResponse.Streams.map(builtValue => {
                                if (Instance.Name[0].split('_')[0] === builtValue.Name) {
                                    const splitName = Instance.Name[0].split('_')

                                    if (builtValue.Qualities === undefined)
                                        builtValue.Qualities = []

                                    builtValue.Qualities.push(splitName[1])
                                }
                            })
                        } else {
                            const tempObject = {}
                            tempObject.Name = Instance.Name[0].split('_')[0]
                            tempObject.URL = `http://${WOWZA_INFORMATION.ADDRESS}:${WOWZA_INFORMATION.RTMP_PORT}/${WOWZA_INFORMATION.APP_NAME}/ngrp:${tempObject.Name}_all/manifest.mpd`
                            BuiltResponse.Streams.push(tempObject)
                        }
                    })
                } else {
                    BuiltResponse.Message = "No streams available"
                    BuiltResponse.Status = 200;
                }
            })
        }

        res.status(BuiltResponse.Status).json(BuiltResponse)
    }).auth(WOWZA_INFORMATION.LOGIN_USERNAME, WOWZA_INFORMATION.LOGIN_PASSWORD, false)
})

module.exports = router