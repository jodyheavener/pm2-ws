import { WSEvents } from "./types";
export default class {
    private host;
    private port;
    private server?;
    private commander?;
    private connections;
    init(): Promise<void>;
    showActiveConnections(): void;
    receive(message: string): void;
    send(event: WSEvents, data?: Record<string, any>): void;
}
