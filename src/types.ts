// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

export enum Commands {
  GetProcesses = "GetProcesses",
  StartLogs = "StartLogs",
  StopLogs = "StopLogs",
  StartProcessPings = "StartProcessPings",
  StopProcessPings = "StopProcessPings",
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
