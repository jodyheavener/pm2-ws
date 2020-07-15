const WebSocket = require('ws');
const chalk = require('chalk');
const readline = require('readline');
const { join } = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 7821;
// By default we'll package PM2, but you can
// supply your own if you'd like.
const PM2_PATH = process.env.BIN || join(__dirname, 'node_modules', '.bin');
// 'stdout' = log anything that comes out of a pm2 process
// 'errors' = only log errors that occur in this script
// 'all' = log it all, baby!
const LOG_LEVEL = process.env.LOG_LEVEL || 'off';

const activeConnections = [];
const wss = new WebSocket.Server({ port: PORT });

// I know this is quite limited right now.
// As this evolves and there is a desire for them,
// we can add more supported commands, but I'd
// far rather whitelist than let anything in.
const availableCommands = ['logs', 'start', 'stop', 'kill', 'restart'];

function log(type, data) {
  if (type === LOG_LEVEL || 'all' === LOG_LEVEL) {
    console.log(data);
  }
}

function showActiveConnections(init) {
  if (!init) {
    // FIXME: this doesn't appear to work?
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }

  console.info(
    `Active connections:`,
    chalk.bold(activeConnections.length.toString())
  );
}

function applyEventData(data = {}, type, extras = {}) {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      // The incoming stdout was something other than a
      // stringified JSON object, so let's just send it
      // as it arrived
      data = { output: data };
    }
  }

  data = Object.assign(data, {
    _event: {
      type,
      ...extras,
    },
  });

  return data;
}

function executeCommand(command, args = []) {
  if (!availableCommands.includes(command)) {
    return log('errors', `Invalid command supplied: ${command}`, args);
  }

  const allArgs = [command, ...args];
  const childProcess = spawn('pm2', [command, ...args], {
    cwd: PM2_PATH,
  });

  childProcess.stdout.on('data', (data) => {
    let message = data.toString().trim();
    log('stdout', message);

    // Sometimes we get empty data :(
    if (!message || !message.length) {
      return;
    }

    message = applyEventData(message, command, {
      command: `pm2 ${allArgs.join(' ')}`,
    });

    sendMessage(message);
  });
}

function sendMessage(message) {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  activeConnections.forEach((connection) => {
    connection.send(message);
  });
}

function sendError(error, extras = {}) {
  log('errors', error);

  const errorMessage = error instanceof Error ? error.message : error;
  const message = applyEventData({}, 'error', {
    message: errorMessage,
    ...extras,
  });

  sendMessage(message);
}

wss.on('connection', (connection) => {
  activeConnections.push(connection);
  showActiveConnections();

  const connectionIndex = activeConnections.length - 1;
  connection.on('close', () => {
    activeConnections.splice(connectionIndex, 1);
    showActiveConnections();
  });

  connection.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.command) {
        executeCommand(data.command, data.args);
      }
    } catch (error) {
      sendError(error);
    }
  });
});

executeCommand('logs', ['--json']);

console.info(
  '✨ PM2 WebSocket opened at',
  chalk.blue.underline.bold(`ws://localhost:${PORT}`)
);
showActiveConnections(true);
