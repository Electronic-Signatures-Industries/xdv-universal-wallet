import { ec, eddsa } from 'elliptic';
import EthrDID from 'ethr-did';
import { DIDContext } from './DIDContext';
/**
 * Manages DIDs
 */
export declare class DIDManager {
    /**
     * Creates a did-ethr
     * using XDV
     */
    createEthrDID(address: string, ecKP: ec.KeyPair, registry: string, rpcUrl: string): EthrDID;
    /**
     * Create 3ID
     * using XDV
     * @param kp RSA keypair
     */
    create3ID_RSA(kp?: any): Promise<DIDContext>;
    base64toPem(base64: any): string;
    /**
     * Create 3ID
     * using XDV
     * @param kp RSA keypair
     */
    create3ID_PKCS11(pin: string): Promise<DIDContext>;
    rsaGetResolver(publicKeyPem: any): {
        key: (did: any, parsed: any, resolver: any, options: any) => Promise<any>;
    };
    /**
     * Create 3ID
     * using XDV
     * @param edDSAKeyPair EdDSA keypair
     */
    create3ID_Ed25519(edDSAKeyPair: eddsa.KeyPair): Promise<DIDContext>;
    /**
     * Create 3ID
     * using XDV
     * @param address address
     * @param ecKeyPair ECDSA key pair
     * @param web3provider Web3 Provider
     */
    create3IDWeb3(address: any, ecKeyPair: ec.KeyPair, web3provider: any, registry: string): Promise<DIDContext>;
    /**
     * Create 3ID Web3 External
     * using XDV
     * @param address address
     * @param ecKeyPair ECDSA key pair
     * @param web3provider Web3 Provider
     */
    create3IDWeb3External(web3provider: any, address: string): Promise<DIDContext>;
}
