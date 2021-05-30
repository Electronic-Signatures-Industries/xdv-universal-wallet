/**
 * Simple RSA Signer
 * @param key
 * @returns
 */
export declare function RSASigner(pem: string, isPIN: boolean): Promise<(data: Uint8Array) => Promise<any>>;
