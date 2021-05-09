"use strict";
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pm2_1 = __importDefault(require("pm2"));
var types_1 = require("./types");
var default_1 = /** @class */ (function () {
    function default_1(server) {
        var _this = this;
        this.server = server;
        this.logging = false;
        this.processPingTimer = null;
        this.processPingInterval = parseInt(process.env.PROCESS_PING_INTERVAL || "5000");
        pm2_1.default.launchBus(function (error, bus) {
            if (error) {
                return _this.server.send(types_1.WSEvents.PM2Error, {
                    message: "There was a problem opening PM2 message bus",
                    error: error.message,
                });
            }
            bus.on("process:event", function (packet) {
                if (!_this.logging) {
                    return;
                }
                _this.server.send(types_1.WSEvents.LogData, {
                    message: packet.data,
                    timestamp: packet.at,
                    type: "process_event",
                    status: packet.event,
                    name: packet.process.name,
                });
            });
            bus.on("log:*", function (type, packet) {
                if (!_this.logging) {
                    return;
                }
                if (type === "PM2") {
                    return;
                }
                if (typeof packet.data == "string") {
                    packet.data = packet.data.replace(/(\r\n|\n|\r)/gm, "");
                }
                _this.server.send(types_1.WSEvents.LogData, {
                    message: packet.data,
                    timestamp: packet.at,
                    type: type,
                    pmId: packet.process.pm_id,
                    name: packet.process.name,
                });
            });
        });
    }
    default_1.prototype.run = function (data) {
        var event = data.event, input = __rest(data, ["event"]);
        switch (event) {
            case types_1.Commands.GetProcesses:
                this.getProcesses();
                break;
            case types_1.Commands.StartLogs:
                this.startLogs();
                break;
            case types_1.Commands.StopLogs:
                this.stopLogs();
                break;
            case types_1.Commands.StartProcess:
                this.startProcess(input);
                break;
            case types_1.Commands.StopProcess:
                this.stopProcess(input);
                break;
            case types_1.Commands.RestartProcess:
                this.restartProcess(input);
                break;
            case types_1.Commands.StartProcessPings:
                this.startProcessPings();
                break;
            case types_1.Commands.StopProcessPings:
                this.stopProcessPings();
                break;
            default:
                this.server.send(types_1.WSEvents.InvalidCommand, {
                    message: "Invalid event received.",
                    received: data,
                });
                break;
        }
    };
    default_1.prototype.getProcesses = function () {
        var _this = this;
        pm2_1.default.list(function (error, processDescriptionList) {
            if (error) {
                return _this.server.send(types_1.WSEvents.PM2Error, {
                    message: "There was a problem listing all PM2 processes",
                    error: error.message,
                });
            }
            var processes = processDescriptionList.map(function (process) {
                var _a;
                return ({
                    pmId: process.pm_id || 0,
                    name: process.name,
                    status: ((_a = process.pm2_env) === null || _a === void 0 ? void 0 : _a.status) || "unknown",
                });
            });
            _this.server.send(types_1.WSEvents.ProcessesList, { processes: processes });
        });
    };
    default_1.prototype.startLogs = function () {
        this.logging = true;
    };
    default_1.prototype.stopLogs = function () {
        this.logging = false;
    };
    default_1.prototype.startProcessPings = function () {
        if (!this.processPingTimer && this.processPingInterval !== 0) {
            this.processPingTimer = setInterval(this.getProcesses.bind(this), this.processPingInterval);
        }
    };
    default_1.prototype.stopProcessPings = function () {
        if (this.processPingTimer) {
            clearInterval(this.processPingTimer);
            this.processPingTimer = null;
        }
    };
    default_1.prototype.startProcess = function (_a) {
        var _this = this;
        var name = _a.name;
        pm2_1.default.start({ name: name }, function (error) {
            if (error) {
                return _this.server.send(types_1.WSEvents.PM2Error, {
                    message: "There was a problem starting the PM2 process",
                    name: name,
                    error: error.message,
                });
            }
            setTimeout(_this.getProcesses.bind(_this), 1000);
        });
    };
    default_1.prototype.stopProcess = function (_a) {
        var _this = this;
        var name = _a.name;
        pm2_1.default.stop(name, function (error) {
            if (error) {
                return _this.server.send(types_1.WSEvents.PM2Error, {
                    message: "There was a problem stopping the PM2 process",
                    name: name,
                    error: error.message,
                });
            }
            setTimeout(_this.getProcesses.bind(_this), 1000);
        });
    };
    default_1.prototype.restartProcess = function (_a) {
        var _this = this;
        var name = _a.name;
        pm2_1.default.restart(name, function (error) {
            if (error) {
                return _this.server.send(types_1.WSEvents.PM2Error, {
                    message: "There was a problem restarting the PM2 process",
                    name: name,
                    error: error.message,
                });
            }
            setTimeout(_this.getProcesses.bind(_this), 1000);
        });
    };
    return default_1;
}());
exports.default = default_1;
