// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import pm2 from "pm2";
import WebSocket, { WSEvents } from "./websocket";

export enum Commands {
  GetProcesses = "GetProcesses",
  StartLogs = "StartLogs",
  StopLogs = "StopLogs",
  StartProcess = "StartProcess",
  StopProcess = "StopProcess",
  RestartProcess = "RestartProcess",
}

interface ProcessCommandArgs {
  name: string;
}

interface BusPacket {
  at: string;
  data: any;
  event: any;
  process: pm2.Proc;
}

export default class {
  private logging: boolean = false;

  constructor(private server: WebSocket) {
    pm2.launchBus((error, bus) => {
      if (error) {
        return this.server.send(WSEvents.PM2Error, {
          message: "There was a problem opening PM2 message bus",
          error: error.message,
        });
      }

      bus.on("process:event", (packet: BusPacket) => {
        if (!this.logging) {
          return;
        }

        this.server.send(WSEvents.LogData, {
          timestamp: packet.at,
          type: "process_event",
          status: packet.event,
          name: packet.process.name,
        });
      });

      bus.on("log:*", (type: string, packet: BusPacket) => {
        if (!this.logging) {
          return;
        }

        if (type === "PM2") {
          return;
        }

        if (typeof packet.data == "string") {
          packet.data = packet.data.replace(/(\r\n|\n|\r)/gm, "");
        }

        this.server.send(WSEvents.LogData, {
          message: packet.data,
          timestamp: packet.at,
          type,
          pmId: packet.process.pm_id,
          name: packet.process.name,
        });
      });
    });
  }

  run(
    data: {
      command?: Commands;
    } & Record<string, any>
  ) {
    const { command, ...input } = data;

    switch (command) {
      case Commands.GetProcesses:
        this.getProcesses();
        break;
      case Commands.StartLogs:
        this.startLogs();
        break;
      case Commands.StopLogs:
        this.stopLogs();
        break;
      case Commands.StartProcess:
        this.startProcess(input as ProcessCommandArgs);
        break;
      case Commands.StopProcess:
        this.stopProcess(input as ProcessCommandArgs);
        break;
      case Commands.RestartProcess:
        this.restartProcess(input as ProcessCommandArgs);
        break;
      default:
        this.server.send(WSEvents.InvalidCommand, {
          message: "Invalid command received.",
          received: data,
        });
        break;
    }
  }

  getProcesses() {
    pm2.list((error, processDescriptionList) => {
      if (error) {
        return this.server.send(WSEvents.PM2Error, {
          message: "There was a problem listing all PM2 processes",
          error: error.message,
        });
      }

      const processes = processDescriptionList.map((process) => ({
        pmId: process.pm_id || 0,
        name: process.name,
        status: process.pm2_env?.status || "unknown",
      }));

      this.server.send(WSEvents.ProcessesList, { processes });
    });
  }

  startLogs() {
    this.logging = true;
  }

  stopLogs() {
    this.logging = false;
  }

  startProcess({ name }: ProcessCommandArgs) {
    pm2.start({ name }, (error) => {
      if (error) {
        return this.server.send(WSEvents.PM2Error, {
          message: "There was a problem starting the PM2 process",
          process: name,
          error: error.message,
        });
      }
    });
  }

  stopProcess({ name }: ProcessCommandArgs) {
    pm2.stop(name, (error) => {
      if (error) {
        return this.server.send(WSEvents.PM2Error, {
          message: "There was a problem stopping the PM2 process",
          process: name,
          error: error.message,
        });
      }
    });
  }

  restartProcess({ name }: ProcessCommandArgs) {
    pm2.restart(name, (error) => {
      if (error) {
        return this.server.send(WSEvents.PM2Error, {
          message: "There was a problem restarting the PM2 process",
          process: name,
          error: error.message,
        });
      }
    });
  }
}
