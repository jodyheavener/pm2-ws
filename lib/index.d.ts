#!/usr/bin/env node
export declare enum Commands {
    GetProcesses = "GetProcesses",
    StartLogs = "StartLogs",
    StopLogs = "StopLogs",
    StartProcess = "StartProcess",
    StopProcess = "StopProcess",
    RestartProcess = "RestartProcess"
}
export declare enum WSEvents {
    InternalError = "InternalError",
    InvalidCommand = "InvalidCommand",
    ProcessesList = "ProcessesList",
    PM2Error = "PM2Error",
    LogData = "LogData"
}
