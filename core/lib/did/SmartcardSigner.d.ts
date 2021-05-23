/**
 * Simple RSA Signer
 * @param key
 * @returns
 */
export declare function RSASigner(pem: string): (data: Uint8Array) => Promise<string>;
/**
 * Smartcard RSA Signer
 * @param key
 * @returns
 */
export declare function RSASCSigner(key: Uint8Array): Promise<any>;
