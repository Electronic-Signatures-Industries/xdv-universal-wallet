import { DID } from 'did-jwt-rsa/src/dids';
export interface DIDContext {
    did: DID;
    getIssuer?: any;
    issuer?: any;
}
