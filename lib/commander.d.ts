import { Commands } from ".";
import WebSocket from "./websocket";
interface ProcessCommandArgs {
    name: string;
}
export default class {
    private server;
    private logging;
    constructor(server: WebSocket);
    run(data: {
        command?: Commands;
    } & Record<string, any>): void;
    getProcesses(): void;
    startLogs(): void;
    stopLogs(): void;
    startProcess({ name }: ProcessCommandArgs): void;
    stopProcess({ name }: ProcessCommandArgs): void;
    restartProcess({ name }: ProcessCommandArgs): void;
}
export {};
