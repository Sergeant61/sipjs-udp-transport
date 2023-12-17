declare module 'dgram' {
  import { Socket } from 'net';

  export function createSocket(type: string): Socket;
}

declare class UDPTransport {
  protocol: string;
  onMessage: ((msg: string) => void) | null;
  onConnect: (() => void) | null;
  onDisconnect: (() => void) | null;

  private logger: any;
  private port: number;
  private server: string;
  private asteriskPort: number | undefined;
  private asteriskDomain: string | undefined;
  private client: any; // You may want to replace 'any' with a more specific type for 'dgram.Socket'

  constructor(logger: any, options: {
    port?: number;
    server?: string;
    asteriskPort?: number;
    asteriskDomain?: string;
  });

  connect(): Promise<void>;
  private logMessage(action: string, msg: Buffer): void;
  isConnected(): boolean;
  dispose(): void;
  send(data: Buffer): Promise<void>;
  disconnect(): void;
}

export = UDPTransport;
