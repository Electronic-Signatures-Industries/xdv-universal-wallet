/// <reference types="node" />
/// <reference types="pouchdb-core" />
import { CompatClient } from '@stomp/stompjs';
import { Subject } from 'rxjs';
export interface SignResponse {
    publicKey: string;
    publicKey2?: string;
    certificate?: string;
    signature: string;
    digest: string;
    type: string;
    error: string;
}
export interface SignPSSResponse {
    publicKey: string;
    publicKey2?: string;
    certificate?: string;
    signature: string;
    digest: string;
    type: string;
    error: string;
}
export interface SignPadesResponse {
    publicKey: string;
    publicKey2?: string;
    certificate?: string;
    signedDocument: string;
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
    /**
     * Request current HSM / Smartcards slots
     * @returns void
     */
    getSlots(): Promise<void>;
    /**
     * Sign JWS
     * @param pin PIN
     * @param data Data as Uint8Array
     * @returns A Promise<SignResponse>
     */
    signJWS(pin: string, data: Uint8Array): Promise<SignResponse>;
    /**
     * Sign PAdes
     * @param pin PIN
     * @param data Data as Uint8Array
     * @returns A Promise<SignResponse>
     */
    signPades(pin: string, data: string): Promise<SignPadesResponse>;
    /**
   * Sign PSS
   * @param pin PIN
   * @param data Data as Uint8Array
   * @returns A Promise<SignResponse>
   */
    signPSS(pin: string, data: Uint8Array): Promise<SignResponse>;
    /**
     * Get certificates
     * @param index Slot index
     * @param pin PIN
     * @returns A Promise<SignResponse>
     */
    getCerts(index: string, pin: string): Promise<SignResponse>;
    sign(index: string, pin: string, data: Buffer): Promise<void>;
    /**
     * Connects to Java Signer
     * @returns A Promise
     */
    connect(): Promise<unknown>;
}
