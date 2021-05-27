// https://github.com/ceramicnetwork/key-did-provider-ed25519/blob/master/src/index.ts
// cidv1	ipld	0x01	permanent	CIDv1
const CID = require('cids')
const NodeRSA = require('node-rsa')
import { createJWS } from 'did-jwt-rsa'
import type {
  AuthParams,
  CreateJWSParams,
  DecryptJWEParams,
  DIDMethodName,
  DIDProviderMethods,
  DIDProvider,
  GeneralJWS,
} from 'did-jwt-rsa/src/dids'
import stringify from 'fast-json-stable-stringify'
import * as rsa from '@digitalbazaar/rsa-verification-key-2018'
import { RPCError, createHandler } from 'rpc-utils'
import type {
  HandlerMethods,
  RPCRequest,
  RPCResponse,
  SendRequestFunc,
} from 'rpc-utils'
import { RSASigner } from './SmartcardSigner'
const B64 = 'base64pad'

function toStableObject(obj: Record<string, any>): Record<string, any> {
  return JSON.parse(stringify(obj)) as Record<string, any>
}

export function encodeDID(publicKey: any, privateKey: any): string {
  const ldSig = new rsa.RsaVerificationKey2018({
    privateKeyPem: privateKey,
    publicKeyPem: publicKey,
  })
  return `did:key:${ldSig.fingerprint()}`
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
  isPIN: boolean,
  protectedHeader: Record<string, any> = {},
) => {
  const kid = `${did}#${did.split(':')[2]}`
  const signer = (await RSASigner(secretKey, isPIN)) as any
  const header = toStableObject(
    Object.assign(protectedHeader, { kid, alg: 'RS256' }),
  )
  const jws = createJWS(toStableObject(payload), signer, header)
  return jws
}

///@ts-ignore
const didMethods: HandlerMethods<Context, DIDProviderMethods> = {
  did_authenticate: async ({ did, secretKey, isPIN }, params: AuthParams) => {
    const response = await sign(
      {
        did,
        iss: did,
        aud: params.aud,
        nonce: params.nonce,
        paths: params.paths,
        exp: Math.floor(Date.now() / 1000) + 600, // expires 10 min from now
      },
      did,
      secretKey,
      isPIN,
    )

    return toGeneralJWS(response)
  },
  did_createJWS: async (
    { did, secretKey, isPIN },
    params: CreateJWSParams & { did: string },
  ) => {
    const requestDid = params.did.split('#')[0]
    if (requestDid !== did) throw new RPCError(4100, `Unknown DID: ${did}`)
    const jws = await sign(
      params.payload,
      did,
      secretKey,
      isPIN,
      params.protected,
    )
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
    const key = new NodeRSA({ b: 2048 }).generateKeyPair()
    const publicDer = key.exportKey('pkcs8-public-der')
    const privateDer = key.exportKey('pkcs1-der')
    return {
      privateDer,
      publicDer,
      sign: key.sign,
      publicPem: key.exportKey('pkcs8-public-pem'),
      pem: key.exportKey(),
    }
  }
}

/**
 * RSA DID Key Provider
 */
export class RSAProvider implements DIDProvider {
  ///@ts-ignore
  _handle: any

  constructor(pub: string, pem: string, pin?: string) {
    const did = encodeDID(pub, pem)
    const handler = createHandler(didMethods)
    const isPIN = pin ? true : false
    this._handle = async (msg) =>
      handler({ did, secretKey: pem || pin, isPIN }, msg)
  }

  get isDidProvider(): boolean {
    return true
  }

  async send(msg: any) {
    return await this._handle(msg)
  }
}
