const NodeRSA = require('node-rsa')
import base64url from 'base64url'
import * as cryptoUtils from 'js-crypto-key-utils'
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

    return async (data: Uint8Array) =>
      JSON.parse((await sc.signPromise('0', pem,(data))).signature)
  }

  const keyImport = new NodeRSA(pem)
  return async (data: Uint8Array) =>
    base64url.encode(await keyImport.sign(data))
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
