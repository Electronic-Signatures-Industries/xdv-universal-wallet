import { DID } from 'dids';
export interface DIDContext {
    did: DID;
    getIssuer?: any;
    issuer?: any;
}
