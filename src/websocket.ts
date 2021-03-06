// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import chalk from "chalk";
import WebSocket from "ws";
import { WSEvents } from "./types";
import Commander from "./commander";

export default class {
  private host = process.env.HOST || "localhost";
  private port = parseInt(process.env.PORT || "7821");
  private server?: WebSocket.Server;
  private commander?: Commander;
  private connections: WebSocket[] = [];

  async init() {
    this.server = new WebSocket.Server({ port: this.port, host: this.host });
    this.commander = new Commander(this);

    console.info(
      "pm2-ws - websocket server created:",
      chalk.blue.underline.bold(`ws://${this.host}:${this.port}`)
    );

    this.server.on("connection", (connection) => {
      this.connections.push(connection);
      this.showActiveConnections();

      const position = this.connections.length - 1;
      connection.on("close", () => {
        this.connections.splice(position, 1);
        this.showActiveConnections();
      });

      connection.on("message", this.receive.bind(this));
    });

    Promise.resolve();
  }

  showActiveConnections() {
    console.info(
      `pm2-ws - active connections:`,
      chalk.bold(this.connections.length.toString())
    );
  }

  receive(message: string) {
    let data: Record<string, any> = {};

    try {
      data = JSON.parse(message);
    } catch (error) {
      return this.send(WSEvents.InternalError, {
        message: "Could not parse incoming message. Is it JSON-formatted?",
        error: error.message,
      });
    }

    this.commander!.run(data);
  }

  send(event: WSEvents, data: Record<string, any> = {}) {
    const parsed = JSON.stringify({
      event,
      ...data,
    });

    for (const connection of this.connections) {
      connection.send(parsed);
    }
  }
}
