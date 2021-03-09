# pm2-ws

A WebSocket server for working with PM2

## Installation & usage

[![NPM](https://nodei.co/npm/pm2-ws.png?downloads=true&downloadRank=true)](https://nodei.co/npm/pm2-ws/)

Install it globally:

- Install it: `yarn global add pm2-ws` or `npm i -g pm2-ws`
- Use it: `pm2-ws`

Install it in your project:

- Install it: `yarn add --dev pm2-ws` or `npm i --save-dev pm2-ws`
- Add it to your PM2 startup script, so it's always active when PM2 is active.

Once set up and running, you can connect to the WebSocket server:

```javascript
let socket = new WebSocket("ws://localhost:7821");
socket.onmessage = (message) => {
  console.log(JSON.parse(message.data));
};
```

This socket will only send stringified JSON, so you should be able to `JSON.parse` anything incoming.

## Options

Use environment variables to configure how the script runs.

### `HOST`

The host you'd like the WebSocket served on.

Default: `localhost`

### `PORT`

The port you'd like the WebSocket served on.

Default: `7821`

### `CLEAR`

Clear the terminal when you start the script. Just to be _that_ annoying script. Set to `false` to disable.

Default: unset (enabled)

### `PROCESS_PING_INTERVAL`

Milliseconds between each Process Ping (a websocket event that transmits the status of processes). Set to `0` to disable entirely, even when `Commands.StartProcessPings` is called.

Default: 5000

## Sending commands

Once open, the socket can receive commands to execute PM2 functions. They need to be delivered in a JSON-stringified object with the command specified under the `command` key and remaining properties as arguments.

```javascript
socket.send(
  JSON.stringify({
    command: "StartProcess",
    name: "auth-server",
  })
);
```

### Commands

Any command you can send (and event you can receive) is enum'd, so for the most up to date list refer to [the code](./src/index.ts). Here's a brief description of what they do and need as arguments:

**GetProcesses**

Retrieves list of PM2 processes.

**StartLogs**

Start streaming process logs. Depending on your active processes this can be a lot of data.

**StopLogs**

Stop streaming process logs.

**StartProcess**

Starts a stopped process. Requires `name` as an argument.

**StopProcess**

Stops a started process. Requires `name` as an argument.

**RestartProcess**

Restarts any process. Requires `name` as an argument.

## License

MPL-2.0
