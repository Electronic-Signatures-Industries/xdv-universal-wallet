/// <reference types="node" />
/// <reference types="pouchdb-core" />
import { CompatClient } from '@stomp/stompjs';
import { Subject } from 'rxjs';
export interface SignResponse {
    publicKey: string;
    signature: string;
    digest: string;
    type: string;
    error: string;
}
export interface SmartCardConnectorEvent {
    eventName: string;
    payload: any;
}
export declare class SmartCardConnectorPKCS11 {
    private keyId?;
    module: string;
    subscribe: Subject<any>;
    socket: any;
    stompClient: CompatClient;
    constructor(keyId?: string);
    getSlots(): Promise<void>;
    signPromise(index: string, pin: string, data: Uint8Array): Promise<SignResponse>;
    getCerts(index: string, pin: string): Promise<SignResponse>;
    sign(index: string, pin: string, data: Buffer): Promise<void>;
    connect(): Promise<unknown>;
}
