const WebSocket = require('ws')
const chalk = require('chalk')
const readline = require('readline')
const pm2 = require('pm2')
const { logStream } = require('./pm2-utils')

// 'errors' = log any errors that occur
// 'logs' = output only pm2 logs
// 'all' = log it all, baby!
// 'off' = nothing at all
const LOG_LEVEL = process.env.LOG_LEVEL || 'off'
const PORT = process.env.PORT || 7821

const activeConnections = []

function log(type, data) {
  if (type === LOG_LEVEL || 'all' === LOG_LEVEL) {
    console.log(data)
  }
}

function showActiveConnections(init) {
  if (!init) {
    // FIXME: this doesn't appear to work?
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
  }

  console.info(
    `pm2-ws - Active connections:`,
    chalk.bold(activeConnections.length.toString())
  )
}

function applyEventData(data = {}, type, extras = {}) {
  data = Object.assign(data, {
    _event: {
      type,
      ...extras,
    },
  })

  return data
}

function sendMessage(message) {
  if (typeof message === 'object') {
    message = JSON.stringify(message)
  }

  activeConnections.forEach((connection) => {
    connection.send(message)
  })
}

function sendError(error, extras = {}) {
  log('errors', error)

  const errorMessage = error instanceof Error ? error.message : error
  const message = applyEventData({}, 'error', {
    message: errorMessage,
    ...extras,
  })

  sendMessage(message)
}

function handleLog(data) {
  log('logs', data)
  data = applyEventData(data, 'log')
  sendMessage(data)
}

function initWs() {
  return new Promise((resolve) => {
    const wss = new WebSocket.Server({ port: PORT })

    console.info(
      'pm2-ws - PM2 WebSocket opened at',
      chalk.blue.underline.bold(`ws://localhost:${PORT}`)
    )
    showActiveConnections(true)

    wss.on('connection', (connection) => {
      activeConnections.push(connection)
      showActiveConnections()

      const connectionIndex = activeConnections.length - 1
      connection.on('close', () => {
        activeConnections.splice(connectionIndex, 1)
        showActiveConnections()
      })

      connection.on('message', (message) => {
        try {
          const data = JSON.parse(message)
          if (data.command) {
            // executeCommand(data.command, data.args);
          }
        } catch (error) {
          sendError(error)
        }
      })
    })

    resolve()
  })
}

// First make sure we can connect to PM2
pm2.connect(async (err) => {
  if (err) {
    console.error(err)
    process.exit(2)
  }

  // Then start up the WebSocket server
  await initWs()

  // Finally, start listening for PM2 logs
  logStream(pm2, handleLog)
})
