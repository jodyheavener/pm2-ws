import { Commands } from "./types";
import WebSocket from "./websocket";
interface ProcessCommandArgs {
    name: string;
}
export default class {
    private server;
    private logging;
    private processPingTimer;
    private processPingInterval;
    constructor(server: WebSocket);
    run(data: {
        event?: Commands;
    } & Record<string, any>): void;
    getProcesses(): void;
    startLogs(): void;
    stopLogs(): void;
    startProcessPings(): void;
    stopProcessPings(): void;
    startProcess({ name }: ProcessCommandArgs): void;
    stopProcess({ name }: ProcessCommandArgs): void;
    restartProcess({ name }: ProcessCommandArgs): void;
}
export {};
