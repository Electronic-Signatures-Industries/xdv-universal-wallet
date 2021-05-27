export declare class X509Utils {
    static verifyChain(data: string, signature: string, certificate: string, certificateChain: Array<string>): Promise<unknown>;
}
