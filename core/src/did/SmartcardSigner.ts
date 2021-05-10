const NodeRSA = require('node-rsa')
import base64url from 'base64url'

/**
 * Simple RSA Signer
 * @param key 
 * @returns 
 */
export async function RSASigner(key: Uint8Array) {
  const keyImport = new NodeRSA()
  const rsa = keyImport.importKey(key)
  return async (data: Uint8Array) => base64url.encode(await rsa.sign(data))
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
  