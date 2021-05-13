// https://github.com/ceramicnetwork/key-did-provider-ed25519/blob/master/src/index.ts
// cidv1	ipld	0x01	permanent	CIDv1
const CID = require('cids')
const NodeRSA = require('node-rsa')
import { createJWS, decryptJWE, x25519Decrypter } from 'did-jwt'
import type {
  AuthParams,
  CreateJWSParams,
  DecryptJWEParams,
  DIDMethodName,
  DIDProviderMethods,
  DIDProvider,
  GeneralJWS,
} from 'dids'
import stringify from 'fast-json-stable-stringify'
import { RPCError, createHandler } from 'rpc-utils'
import type {
  HandlerMethods,
  RPCRequest,
  RPCResponse,
  SendRequestFunc,
} from 'rpc-utils'
import * as u8a from 'uint8arrays'
import { RSASigner } from './SmartcardSigner'
const B64 = 'base64pad'

function toStableObject(obj: Record<string, any>): Record<string, any> {
  return JSON.parse(stringify(obj)) as Record<string, any>
}

export function encodeDID(publicKey: Uint8Array): string {
  const bytes = new Uint8Array(publicKey.length + 2)
  bytes[0] = 0x01 // cidv1	ipld	0x01	permanent	CIDv1
  // The multicodec is encoded as a varint so we need to add this.
  // See js-multicodec for a general implementation
  bytes[1] = 0x01
  bytes.set(publicKey, 2)
  return `did:key:z${u8a.toString(bytes, 'base58btc')}`
}

function toGeneralJWS(jws: string): GeneralJWS {
  const [protectedHeader, payload, signature] = jws.split('.')
  return {
    payload,
    signatures: [{ protected: protectedHeader, signature }],
  }
}

interface Context {
  did: string
  secretKey: string
}

const sign = async (
  payload: Record<string, any>,
  did: string,
  secretKey: string,
  protectedHeader: Record<string, any> = {},
) => {
  const kid = `${did}#${did.split(':')[2]}`
  const signer = (RSASigner(secretKey) as unknown) as (_) => Promise<string>
  const header = toStableObject(
    Object.assign(protectedHeader, { kid, alg: 'RSA' }),
  )
  return createJWS(toStableObject(payload), signer, header)
}

const didMethods: HandlerMethods<Context, DIDProviderMethods> = {
  did_authenticate: async ({ did, secretKey }, params: AuthParams) => {
    const response = await sign(
      {
        did,
        aud: params.aud,
        nonce: params.nonce,
        paths: params.paths,
        exp: Math.floor(Date.now() / 1000) + 600, // expires 10 min from now
      },
      did,
      secretKey,
    )
    return toGeneralJWS(response)
  },
  did_createJWS: async (
    { did, secretKey },
    params: CreateJWSParams & { did: string },
  ) => {
    const requestDid = params.did.split('#')[0]
    if (requestDid !== did) throw new RPCError(4100, `Unknown DID: ${did}`)
    const jws = await sign(params.payload, did, secretKey, params.protected)
    return { jws: toGeneralJWS(jws) }
  },
  did_decryptJWE: async ({ secretKey }, params: DecryptJWEParams) => {
    // const decrypter = x25519Decrypter(convertSecretKeyToX25519(secretKey))
    // try {
    //   const bytes = await decryptJWE(params.jwe, decrypter)
    //   return { cleartext: u8a.toString(bytes, B64) }
    // } catch (e) {
    //  throw new RPCError(-32000, (e as Error).message)
    //}
    return null
  },
}

/**
 * RSA key generator
 */
export class RSAKeyGenerator {
  static createKeypair() {
    const key = new NodeRSA().generateKeyPair()
    const publicDer = key.exportKey('pkcs8-public-der')
    const privateDer = key.exportKey('pkcs1-der')
    return {
      privateDer,
      publicDer,
      sign: key.sign,
      pem: key.exportKey(),
    }
  }
}

/**
 * RSA DID Key Provider
 */
export class RSAProvider implements DIDProvider {
  _handle: SendRequestFunc<DIDProviderMethods>

  constructor(publicKey: Uint8Array, privateKey: Uint8Array, pem: string) {
    const did = encodeDID(publicKey)
    const handler = createHandler<Context, DIDProviderMethods>(didMethods)
    this._handle = async (msg) => await handler({ did, secretKey: pem }, msg)
  }

  get isDidProvider(): boolean {
    return true
  }

  async send<Name extends DIDMethodName>(
    msg: RPCRequest<DIDProviderMethods, Name>,
  ): Promise<RPCResponse<DIDProviderMethods, Name> | null> {
    return await this._handle(msg)
  }
}