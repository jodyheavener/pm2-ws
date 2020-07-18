# pm2-ws

A PM2 WebSocket server for piping PM2 data

## Installation & usage

[![NPM](https://nodei.co/npm/pm2-ws.png?downloads=true&downloadRank=true)](https://nodei.co/npm/pm2-ws/)

### Globally

- Install it: `yarn global add pm2-ws` or `npm i -g pm2-ws`
- Use it: `pm2-ws`

### In your project

- Install it: `yarn add --dev pm2-ws` or `npm i --save-dev pm2-ws`
- Add it to your PM2 startup script, so it's always active when PM2 is active.

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

## License

MPL-2.0
