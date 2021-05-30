const NodeRSA = require('node-rsa')
import base64url from 'base64url'
import { SmartCardConnectorPKCS11 } from './SmartcardConnector'
/**
 * Simple RSA Signer
 * @param key
 * @returns
 */
export async function RSASigner(pem: string, isPIN: boolean) {
  if (isPIN) {
    const sc = new SmartCardConnectorPKCS11()
    await sc.connect()

    return async (data: Uint8Array) =>{
     return JSON.parse((await sc.signPromise('0', pem,(data))).signature)
    }
  }

  const keyImport = new NodeRSA(pem)
  return async (data: Uint8Array) =>
    base64url.encode(await keyImport.sign(data))
}
