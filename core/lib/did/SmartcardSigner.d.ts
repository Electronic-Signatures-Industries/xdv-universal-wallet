/**
 * Simple RSA Signer
 * @param key
 * @returns
 */
export declare function RSASigner(pem: string, isPIN: boolean): Promise<(data: Uint8Array) => Promise<any>>;
/**
 * Pades Signer
 * @param pem
 * @param isPIN
 * @returns
 */
export declare function PadesSigner(pem: string, isPIN: boolean): Promise<((data: Uint8Array) => Promise<import("./SmartcardConnector").SignPadesResponse>) | ((data: Uint8Array) => Promise<string>)>;
