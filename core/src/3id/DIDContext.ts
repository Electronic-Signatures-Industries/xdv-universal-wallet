import { DID } from 'did-jwt-rsa/lib/dids';


export interface DIDContext {
  did: DID;
  getIssuer?: any;
  issuer?: any;
  certificate?: any;
}
