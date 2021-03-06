"use strict";
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSEvents = exports.Commands = void 0;
var Commands;
(function (Commands) {
    Commands["GetProcesses"] = "GetProcesses";
    Commands["StartLogs"] = "StartLogs";
    Commands["StopLogs"] = "StopLogs";
    Commands["StartProcessPings"] = "StartProcessPings";
    Commands["StopProcessPings"] = "StopProcessPings";
    Commands["StartProcess"] = "StartProcess";
    Commands["StopProcess"] = "StopProcess";
    Commands["RestartProcess"] = "RestartProcess";
})(Commands = exports.Commands || (exports.Commands = {}));
var WSEvents;
(function (WSEvents) {
    WSEvents["InternalError"] = "InternalError";
    WSEvents["InvalidCommand"] = "InvalidCommand";
    WSEvents["ProcessesList"] = "ProcessesList";
    WSEvents["PM2Error"] = "PM2Error";
    WSEvents["LogData"] = "LogData";
})(WSEvents = exports.WSEvents || (exports.WSEvents = {}));
