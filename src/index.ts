#!/usr/bin/env node

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import clear from "clear";
import pm2 from "pm2";
import WebSocket from "./websocket";

export enum Commands {
  GetProcesses = "GetProcesses",
  StartLogs = "StartLogs",
  StopLogs = "StopLogs",
  StartProcess = "StartProcess",
  StopProcess = "StopProcess",
  RestartProcess = "RestartProcess",
}

export enum WSEvents {
  InternalError = "InternalError",
  InvalidCommand = "InvalidCommand",
  ProcessesList = "ProcessesList",
  PM2Error = "PM2Error",
  LogData = "LogData",
}

const clearOnStart = process.env.CLEAR !== "false";
const server = new WebSocket();

if (clearOnStart) {
  clear();
}

pm2.connect(async (error) => {
  if (error) {
    console.error(error);
    return process.exit(1);
  }

  await server.init();
});
