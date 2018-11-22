'use strict'

process.env.DEBUG = '*' // 'bfx:hf:*'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:examples:server')
const SocksProxyAgent = require('socks-proxy-agent')
const { connectDB, startDB } = require('bfx-hf-models')
const {
  PingPong, Iceberg, TWAP, AccumulateDistribute
} = require('bfx-hf-algo')

const AOServer = require('../lib/server')
const { API_KEY, API_SECRET, WS_URL, REST_URL, SOCKS_PROXY_URL } = process.env

const run = async () => {
  await startDB(`${__dirname}/../db`)
  await connectDB('hf-as')

  const server = new AOServer({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    wsURL: WS_URL,
    restURL: REST_URL,
    agent: SOCKS_PROXY_URL ? new SocksProxyAgent(SOCKS_PROXY_URL) : null,
    port: 8877,

    aos: [
      PingPong,
      Iceberg,
      TWAP,
      AccumulateDistribute
    ],
  })

  server.on('auth:success', () => {
    debug('authenticated')
  })

  server.on('auth:error', (error) => {
    debug('auth error: %j', error)
  })
}

try {
  run()
} catch (err) {
  debug('error: %s', err)
}
