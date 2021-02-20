/// <reference types="node" />
import { ec, eddsa } from 'elliptic';
import { LDCryptoTypes } from './LDCryptoTypes';
import { PrivateKey } from '../did';
import { JWK } from 'node-jose';
export declare class X509Info {
    countryName: string;
    stateOrProvinceName: string;
    localityName: string;
    organizationName: string;
    organizationalUnitName: string;
    commonName: string;
}
export declare class KeyConvert {
    static getX509RSA(kp: any): Promise<{
        jwk: any;
        der: any;
        pemAsPrivate: any;
        pemAsPublic: any;
        ldSuite: {
            publicKeyJwk: any;
        };
    }>;
    /**
     * Returns private keys in DER, JWK and PEM formats
     * @param kp Key pair
     * @param passphrase passphrase
     */
    static getP256(kp: ec.KeyPair, passphrase?: string): Promise<{
        der: any;
        pem: any;
        jwk?: undefined;
        ldSuite?: undefined;
    } | {
        der: any;
        jwk: any;
        pem: any;
        ldSuite: {
            publicKeyJwk: string;
            pubBytes: () => Uint8Array;
            privBytes: () => Buffer;
        };
    }>;
    /**
 * Returns private keys in DER, JWK and PEM formats
 * @param kp Key pair
 * @param passphrase passphrase
 */
    static getES256K(kp: ec.KeyPair, passphrase?: string): Promise<{
        der: any;
        pem: any;
        jwk?: undefined;
        ldSuite?: undefined;
    } | {
        der: any;
        jwk: any;
        pem: any;
        ldSuite: {
            publicKeyJwk: string;
            pubBytes: () => Uint8Array;
            privBytes: () => Buffer;
        };
    }>;
    static openEncryptedPEMtoJWK(pem: string, passphrase: string): Promise<any>;
    /**
     * Returns private keys in DER, JWK and PEM formats
     * @param kp Key pair
     * @param passphrase passphrase
     */
    static getEd25519(kp: eddsa.KeyPair, passphrase?: string): Promise<{
        der: any;
        pem: any;
    }>;
    static createLinkedDataJsonFormat(algorithm: LDCryptoTypes, key: KeyLike, hasPrivate?: boolean): (PrivateKey);
    /**
 * Returns private keys in JWK and PEM formats
 * @param kp Key pair
 * @param passphrase passphrase
 */
    static getRSA(rsa: any): {
        jwk: any;
        pem: any;
    };
}
export interface KeyLike {
    publicPem?: string;
    publicJwk?: JWK.Key;
    privBytes(): Buffer | Uint8Array;
    pubBytes(): Buffer | Uint8Array;
}
