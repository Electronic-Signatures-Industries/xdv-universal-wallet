const NodeRSA = require('node-rsa')
import base64url from 'base64url'
import * as cryptoUtils from 'js-crypto-key-utils'
/**
 * Simple RSA Signer
 * @param key 
 * @returns 
 */
export function RSASigner(pem: string) {
  const keyImport = new NodeRSA(pem)
  return async (data: Uint8Array) => base64url.encode(await keyImport.sign(data))
}


//  TODO
/**
 * Smartcard RSA Signer
 * @param key 
 * @returns 
 */
 export async function RSASCSigner(key: Uint8Array): Promise<any> {
    const keyImport = new NodeRSA()
    const rsa = keyImport.importKey(key)
    return async (data: Uint8Array) => base64url.encode(await rsa.sign(data))
  }
  