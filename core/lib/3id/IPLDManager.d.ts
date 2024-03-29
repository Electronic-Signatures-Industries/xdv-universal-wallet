/// <reference types="node" />
/// <reference types="pouchdb-core" />
import { DID } from 'did-jwt-rsa/lib/dids';
import { ethers } from 'ethers';
import CID from 'cids';
/**
 * XDV IPLD Manager
 */
export declare class IPLDManager {
    client: any;
    provider: ethers.providers.JsonRpcProvider;
    ipld: any;
    did: DID;
    constructor(did: DID);
    /**
     * Starts IPFS Client
     * @param hostname
     */
    start(hostname?: string): Promise<void>;
    /**
     * Converts Blob to Keccak 256 hash
     * @param payload
     */
    blobToKeccak256(payload: Blob): Promise<string>;
    /**
     * Add Signed Object
     * @param did DID
     * @param payload Payload, either Buffer or Blob
     * @param previousNode If it has previous node
     */
    addSignedObject(payload: Uint8Array, options?: any): Promise<CID>;
    createSignedContent({ contentType, name, lastModified, size, content, hash, documentPubCert, documentSignature, signaturePreset, }: {
        contentType: any;
        name: any;
        lastModified: any;
        size: any;
        content: any;
        hash: any;
        documentPubCert: any;
        documentSignature: any;
        signaturePreset: any;
    }): {
        contentType: any;
        name: any;
        lastModified: any;
        size: any;
        content: any;
        hash: any;
        created: number;
        documentPubCert: any;
        documentSignature: any;
        signaturePreset: any;
    };
    addIndex(documents: any[]): Promise<any>;
    /**
     * Get IPLD object
     * @param cid content id
     */
    getObject(cid: string): Promise<any>;
    /**
     * Get IPLD object
     * @param cid content id
     */
    get(cid: string): Promise<any>;
    verify(obj: any): Promise<any>;
    encryptObject(cleartext: any, dids: string[]): Promise<any>;
    decryptObject(didInstance: DID, cid: any, query: any): Promise<{
        jwe: any;
        cleartext: Record<string, any>;
    }>;
    addPublicWallet(did: DID, payload: Buffer): Promise<any>;
}
