/// <reference types="node" />
/// <reference types="pouchdb-core" />
import EthrDID from 'ethr-did';
import { ec, eddsa } from 'elliptic';
import { ethers } from 'ethers';
import { Subject } from 'rxjs';
import Web3 from 'web3';
import { DID } from 'did-jwt-rsa/lib/dids';
import { RxDatabase, RxDocument } from 'rxdb';
export declare type AlgorithmTypeString = keyof typeof AlgorithmType;
export declare enum AlgorithmType {
    RSA = 0,
    ES256K = 1,
    P256 = 2,
    ED25519 = 3,
    BLS_EIP2333 = 4,
    P256_JWK_PUBLIC = 5,
    ED25519_JWK_PUBLIC = 6,
    ES256K_JWK_PUBLIC = 7,
    RSA_JWK_PUBLIC = 8,
    RSA_PEM_PUBLIC = 9
}
export interface BlsEip2333 {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
}
export declare class WalletOptions {
    password: string;
    mnemonic?: string;
}
export interface XDVUniversalProvider {
    did: DID & EthrDID;
    secureMessage: any;
    privateKey: any;
    getIssuer: Function;
    issuer?: EthrDID;
    id: string;
    web3?: Web3;
    address?: string;
    publicKey: any;
}
export interface ICreateOrLoadWalletProps {
    walletId?: string;
    passphrase?: string;
    registry?: string;
    rpcUrl?: string;
    mnemonic?: string;
    accountName?: string;
}
export interface KeyStoreModel {
    ES256K: any;
    P256: any;
    BLS_EIP2333: any;
    ED25519: any;
}
export interface KeystoreDbModel {
    walletId: string;
    keypairs: KeyStoreModel;
    path?: string;
    mnemonic: string;
    keypairExports: KeyStoreModel;
    publicKeys?: any;
}
export declare class KeyStore implements KeyStoreModel {
    ED25519: any;
    ES256K: any;
    P256: any;
    BLS_EIP2333: any;
    constructor();
}
export interface Account {
    id: string;
    created: number;
    isLocked: boolean;
    description: string;
    attributes: any[];
    currentKeystoreId: string;
    keystores: KeystoreDbModel[];
}
export declare const XDVWalletSchema: {
    title: string;
    version: number;
    description: string;
    type: string;
    properties: {
        id: {
            type: string;
            primary: boolean;
        };
        created: {
            type: string;
        };
        isLocked: {
            type: string;
        };
        currentKeystoreId: {
            type: string;
        };
        attributes: {
            type: string;
        };
        keystores: {
            type: string;
            items: {
                type: string;
                properties: {
                    walletId: {
                        type: string;
                    };
                    mnemonic: {
                        type: string;
                    };
                    keystoreSeed: {
                        type: string;
                    };
                    keypairs: {
                        type: string;
                    };
                    keypairExports: {
                        type: string;
                    };
                    publicKeys: {
                        type: string;
                    };
                    path: {
                        type: string;
                    };
                };
            };
        };
        description: {
            type: string;
        };
    };
    encrypted: string[];
};
/**
 * XDV Wallet for DID and VC use cases
 */
export declare class Wallet {
    private readonly DB_NAME;
    onRequestPassphraseSubscriber: Subject<any>;
    onRequestPassphraseWallet: Subject<any>;
    onSignExternal: Subject<any>;
    protected db: RxDatabase;
    accepted: any;
    isWeb: boolean;
    /**
     * Creates a new Wallet
     * @param param0 isWeb, true if used by browser otherwise false
     */
    constructor({ isWeb }?: {
        isWeb: boolean;
    });
    /**\
     * Opens a db
     */
    open(accountName: string, passphrase: string): Promise<this>;
    /**
     * Enrolls account, returns false if already exists, otherwise account model
     * @param options create or load wallet options, password must be at least 12 chars
     * @deprecated Only call open, will be removed in 0.6.0
     */
    enrollAccount(options: ICreateOrLoadWalletProps): Promise<any>;
    close(): Promise<void>;
    /**
     * Creates an universal wallet for ES256K
     * @param options { passphrase, walletid, registry, rpcUrl }
     */
    createES256K(options: ICreateOrLoadWalletProps): Promise<XDVUniversalProvider>;
    /**
     * Creates an universal wallet for Ed25519
     * @param options { passphrase, walletid }
     */
    createEd25519(options: ICreateOrLoadWalletProps): Promise<XDVUniversalProvider>;
    /**
     * Creates an universal wallet  for Web3 Providers
     * @param options { passphrase, walletid, registry, rpcUrl }
     */
    createWeb3Provider(options: ICreateOrLoadWalletProps): Promise<XDVUniversalProvider>;
    /**
     * Signs message with a BLS private key given a wallet id
     * @param options
     * @param message
     * @returns Promise
     */
    aggregateSign(options: ICreateOrLoadWalletProps, message: Uint8Array): Promise<Uint8Array>;
    /**
     * Gets BLS public key
     * @param options
     * @returns UInt8Array
     */
    getBlsPublicKey(options: ICreateOrLoadWalletProps): Promise<Uint8Array>;
    /**
     * Verifies aggregated signatures, one message signed by many
     * @param signatures An array of signatures
     * @param message A single message
     * @param publicKeys An array of public keys
     * @returns Promise
     */
    verifyAggregatedPubkeys(signatures: any[], message: any, publicKeys: any[]): Promise<boolean>;
    /**
     * Verifies aggregated signatures, many messages signed by many
     * @param signatures An array of signatures
     * @param message An array of messages
     * @param publicKeys An array of public keys
     * @returns Promise
     */
    verifyBatch(signatures: any[], messages: any[], publicKeys: any[]): Promise<boolean>;
    /**
     * Adds a set of ES256K and ED25519 Wallets
     * @param options
     */
    addWallet(options?: ICreateOrLoadWalletProps): Promise<string>;
    /**
     * Get private key as elliptic keypair
     * @param algorithm
     * @param keystoreId
     */
    protected getPrivateKey(algorithm: AlgorithmTypeString, keystoreId: string): Promise<ec.KeyPair | eddsa.KeyPair>;
    /**
     * Get private key exports
     * @param algorithm
     * @param keystoreId
     */
    protected getPrivateKeyExports(algorithm: AlgorithmTypeString, keystoreId: string): Promise<any>;
    canUse(): Promise<unknown>;
    /**
     * Signs with selected algorithm
     * @param algorithm Algorithm
     * @param payload Payload as buffer
     * @param options options
     */
    sign(algorithm: AlgorithmTypeString, keystoreId: string, payload: Buffer): Promise<[Error, any?]>;
    /**
     * Signs a JWT for single recipient
     * @param algorithm Algorithm
     * @param payload Payload as buffer
     * @param options options
     */
    signJWT(algorithm: AlgorithmTypeString, keystoreId: string, payload: any, options: any): Promise<[Error, any?]>;
    /**
     * Signs JWT using public keys
     * @param publicKey
     * @param payload
     * @param options
     */
    signJWTFromPublic(publicKey: any, payload: any, options: any): Promise<[Error, any?]>;
    /**
     * Encrypts JWE
     * @param algorithm Algorithm
     * @param payload Payload as buffer
     * @param overrideWithKey Uses this key instead of current wallet key
     *
     */
    encryptJWE(algorithm: AlgorithmTypeString, keystoreId: string, payload: any, overrideWithKey: any): Promise<[Error, any?]>;
    /**
     * Decript JWE
     * @param algorithm
     * @param keystoreId
     * @param payload
     */
    decryptJWE(algorithm: AlgorithmTypeString, keystoreId: string, payload: any): Promise<[Error, any?]>;
    /**
     * Generates a mnemonic
     */
    static generateMnemonic(): ethers.utils.Mnemonic;
    /**
     * Derives a wallet from a path
     */
    deriveFromPath(mnemonic: string, path: string): any;
    getBlsEip2333(mnemonic: string): BlsEip2333;
    /**
     * Gets EdDSA key pair
     */
    getEd25519(mnemonic: string): eddsa.KeyPair;
    /**
     * Gets ECDSA key pair
     * @param mnemonic
     */
    getES256K(mnemonic: string): ec.KeyPair;
    /**
     * Gets keystore from session db
     */
    getAccount(passphrase?: string): Promise<RxDocument>;
    /**
     * Sets account lock
     * @param id
     */
    setAccountLock(lock: boolean): Promise<any>;
    /**
     * Sets current keystore
     * @param passphrase
     * @param id
     *
     */
    setCurrentKeystore(id: string): Promise<any>;
    /**
     * @deprecated This method is only used to be able to compile tests.
     * Please ignore.
     */
    initialize(password: string): Promise<void>;
}
