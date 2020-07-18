# pm2-ws

A WebSocket server for PM2 data

**This package is not finished yet!**

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
  console.log(JSON.parse(message.data))
};
```

## Options

Use environment variables to configure how the script runs.

### `PORT`

The port you'd like the WebSocket served on.

Default: `7821`

### `LOG_LEVEL`

Output various logs. Delimit with a comma to supply multiple.

Available levels:

- `errors` - Any errors that occur, with the client and this script.
- `pm2` - Anything that PM2 commands return (this can get noisy!).
- `all` - All of the above.
- `off` - Nothing.

Default: `off`

### `INIT_LOGS`

Immediately start relaying PM2 log output to the open socket. Set to `false` to disable.

Default: unset (enabled)

## Commands

Once open, the socket can receive special commands to execute PM2 functions. They need to be delivered in a stringified object with the command specified under the command key and remaining params as the arguments.

```javascript
const message = JSON.stringify({
  command: 'status',
  foo: bar
});
socket.send(message);
```

_This is going to be pretty limited until there is a greater need for more commands._

### `logs`

Will start streaming PM2 log data.

No arguments.

### `status`

Will respond with an object of all currently known (active, stopped, errored) PM2 services.

No arguments.

## License

MPL-2.0
