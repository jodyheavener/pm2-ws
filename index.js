const WebSocket = require('ws')
const chalk = require('chalk')
const readline = require('readline')
const pm2 = require('pm2')
const commands = require('./pm2-commands')

// 'errors' = any errors that occur, with the client and this script
// 'pm2' = anything that pm2 commands return, this can get noisy
// 'all' = log it all, baby!
// 'off' = nothing at all
const LOG_LEVEL = (process.env.LOG_LEVEL || 'off').split(',')
const INIT_LOGS = process.env.INIT_LOGS !== 'false'
const PORT = process.env.PORT || 7821

const activeConnections = []

function log(type, data) {
  if (LOG_LEVEL.includes(type) || LOG_LEVEL.includes('all')) {
    console.log(data)
  }
}

function showActiveConnections() {
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

function sendError(errorData, extras = {}) {
  log('errors', errorData)

  const data = applyEventData({}, 'error', {
    error: errorData instanceof Error ? errorData.message : errorData,
    ...extras,
  })

  sendMessage(data)
}

function commandSendMessage(type) {
  return function (data) {
    data = applyEventData(data, type)
    log('pm2', data)
    sendMessage(data)
  }
}

function commandSendError(type) {
  return function (errorData, extras = {}) {
    extras = Object.assign(extras, { command: type })
    sendError(errorData, extras)
  }
}

function handleMessage(message) {
  try {
    const data = JSON.parse(message)
    const { command, ...options } = data
    if (command) {
      if (Object.keys(commands).includes(command)) {
        commands[command].call(
          {
            pm2,
            sendMessage: commandSendMessage(command),
            sendError: commandSendError(command),
          },
          options
        )
      } else {
        sendError(`The command '${command}' is not supported`, {
          data,
        })
      }
    } else {
      sendError('A valid command was not received', { data })
    }
  } catch (error) {
    log('errors', error)
    sendError('Could not parse command', { data: message })
  }
}

function initWs() {
  return new Promise((resolve) => {
    const wss = new WebSocket.Server({ port: PORT })

    console.info(
      'pm2-ws - PM2 WebSocket opened at',
      chalk.blue.underline.bold(`ws://localhost:${PORT}`)
    )
    showActiveConnections()

    wss.on('connection', (connection) => {
      activeConnections.push(connection)
      showActiveConnections()

      const connectionIndex = activeConnections.length - 1
      connection.on('close', () => {
        activeConnections.splice(connectionIndex, 1)
        showActiveConnections()
      })

      connection.on('message', handleMessage)
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

  if (INIT_LOGS) {
    // Finally, start listening for PM2 logs
    commands.logs.call({
      pm2,
      sendMessage: commandSendMessage('logs'),
      sendError: commandSendMessage('logs'),
    })
  }
})
