# pm2-ws

A PM2 WebSocket server for piping PM2 data

## Installation & usage

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

### `PM2_PATH`

Point to a different binary path.

Default: `./node_modules/bin`

### `LOG_LEVEL`

Output various logs.

Available levels:

- `stdout` - Log anything that comes out of a pm2 process. This will be pretty busy because of pm2 logs.
- `errors` - Only log errors that occur from within the script.
- `all` - Log all of the above.
- `off` - Log nothing

Default: `off`

## License

MPL-2.0
