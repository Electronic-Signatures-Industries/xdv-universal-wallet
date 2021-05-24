import type { DIDProvider } from 'did-jwt-rsa/src/dids';
export declare function encodeDID(publicKey: any, privateKey: any): string;
/**
 * RSA key generator
 */
export declare class RSAKeyGenerator {
    static createKeypair(): {
        privateDer: any;
        publicDer: any;
        sign: any;
        publicPem: any;
        pem: any;
    };
}
/**
 * RSA DID Key Provider
 */
export declare class RSAProvider implements DIDProvider {
    _handle: any;
    constructor(pub: string, pem: string, pin?: string);
    get isDidProvider(): boolean;
    send(msg: any): Promise<any>;
}
