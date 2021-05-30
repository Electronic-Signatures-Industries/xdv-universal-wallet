import * as u8a from 'uint8arrays'
import { ThreeIdConnect, EthereumAuthProvider } from '3id-connect'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'

import { ec, eddsa } from 'elliptic'
import EthrDID from 'ethr-did'
import { DIDContext } from './DIDContext'
import { RSAKeyGenerator, RSAProvider } from '../did/RSAKeyProvider'
import { DID, DIDOptions } from 'did-jwt-rsa/lib/dids'
import { SmartCardConnectorPKCS11 } from '../did/SmartcardConnector'
const DID_LD_JSON = 'application/did+ld+json'
const DID_JSON = 'application/did+json'

const varint = require('varint')
const multibase = require('multibase')
/**
 * Manages DIDs
 */
export class DIDManager {

  /**
   * Creates a did-ethr
   * using XDV
   */
  createEthrDID(
    address: string,
    ecKP: ec.KeyPair,
    registry: string,
    rpcUrl: string,
  ): EthrDID {
    const did = new EthrDID({
      privateKey: ecKP.getPrivate('hex'),
      address,
      registry,
      rpcUrl,
    })
    return did
  }

  /**
   * Create 3ID
   * using XDV
   * @param kp RSA keypair
   */
  async create3ID_RSA(kp?: any): Promise<DIDContext> {
    let keypair = RSAKeyGenerator.createKeypair()
    if (kp) {
      keypair = kp
    }
    const provider = new RSAProvider(keypair.publicPem, keypair.pem)
    const did = new DID(({
      provider,
      resolver: this.rsaGetResolver(keypair.publicPem),
    } as unknown) as DIDOptions)
    const issuer = () => ({
      signer: (data: Uint8Array) => {
        return keypair.sign(data)
      },
      alg: 'RS256',
      did: did.id,
    })

    return {
      did,
      getIssuer: issuer,
    } as DIDContext
  }
  
  base64toPem(base64)
  {
      for(var result="", lines=0;result.length-lines < base64.length;lines++) {
          result+=base64.substr(result.length-lines,64)+"\n"
      }
  
      return "-----BEGIN PUBLIC KEY-----\n" + result + "-----END PUBLIC KEY-----";
  }

  /**
   * Create 3ID
   * using XDV
   * @param kp RSA keypair
   */
  async create3ID_PKCS11(pin: string): Promise<DIDContext> {
    const sc = new SmartCardConnectorPKCS11()
    await sc.connect()
    const certs: any = await sc.getCerts('0', pin)
    const publicPem = this.base64toPem(certs.publicKey)
    const provider = new RSAProvider(publicPem, null, pin)
    const did = new DID(({
      provider,
      // @ts-ignore
      resolver: this.rsaGetResolver(publicPem),
    } as unknown) as DIDOptions)

    return {
      did,
      certificate: certs.publicKey2
    } as DIDContext
  }

  // @molekilla, 2021
  // ==========================================================
  // Forked off ceramic network key-did-resolver npm package
  // ==========================================================

  rsaGetResolver(publicKeyPem) {
    function keyToDidDoc(publicKeyPem, pubKeyBytes, fingerprint) {
      const did = `did:key:${fingerprint}`
      const keyId = `${did}#${fingerprint}`
      return {
        id: did,
        verificationMethod: [
          {
            id: keyId,
            type: 'RSAVerificationKey2018',
            controller: did,
            publicKeyBase58: u8a.toString(pubKeyBytes, 'base58btc'),
            publicKeyPem,
          },
        ],
        authentication: [keyId],
        assertionMethod: [keyId],
        capabilityDelegation: [keyId],
        capabilityInvocation: [keyId],
      }
    }

    async function resolve(did, parsed, resolver, options) {
      const contentType = options.accept || DID_JSON
      const response: any = {
        didResolutionMetadata: { contentType },
        didDocument: null,
        didDocumentMetadata: {},
      }
      try {
        const multicodecPubKey = multibase.decode(parsed.id)
        const pubKeyBytes = multicodecPubKey.slice(varint.decode.bytes)
        const doc = keyToDidDoc(publicKeyPem, pubKeyBytes, parsed.id)
        if (contentType === DID_LD_JSON) {
          doc['@context'] = 'https://w3id.org/did/v1'
          response.didDocument = doc
        } else if (contentType === DID_JSON) {
          response.didDocument = doc
        } else {
          delete response.didResolutionMetadata.contentType
          response.didResolutionMetadata.error = 'representationNotSupported'
        }
      } catch (e) {
        response.didResolutionMetadata.error = 'invalidDid'
        response.didResolutionMetadata.message = e.toString()
      }
      return response
    }
    return {
      key: resolve,
    }
  }

  /**
   * Create 3ID
   * using XDV
   * @param edDSAKeyPair EdDSA keypair
   */
  async create3ID_Ed25519(edDSAKeyPair: eddsa.KeyPair): Promise<DIDContext> {
    let seed = edDSAKeyPair.getSecret().slice(0, 32)

    const provider = new Ed25519Provider(seed)
    const did = new DID(({
      provider,
      resolver: KeyResolver.getResolver(),
    } as unknown) as DIDOptions)
    const issuer = () => ({
      signer: (data: eddsa.Bytes) => {
        return edDSAKeyPair.sign(data).toHex()
      },
      alg: 'Ed25519',
      did: did.id,
    })

    return {
      did,
      getIssuer: issuer,
    } as DIDContext
  }

  /**
   * Create 3ID
   * using XDV
   * @param address address
   * @param ecKeyPair ECDSA key pair
   * @param web3provider Web3 Provider
   */
  async create3IDWeb3(
    address: any,
    ecKeyPair: ec.KeyPair,
    web3provider: any,
    registry: string,
  ): Promise<DIDContext> {
    const threeid = new ThreeIdConnect()
    const authProvider = new EthereumAuthProvider(web3provider, address)
    await threeid.connect(authProvider)
    const did = new DID({
      provider: (await threeid.getDidProvider()) as any,
      resolver: KeyResolver.getResolver(),
    } as unknown)
    const issuer = new EthrDID({
      privateKey: ecKeyPair.getPrivate('hex'),
      address,
      web3: web3provider,
      registry,
    })

    return {
      did,
      issuer,
    } as DIDContext
  }

  /**
   * Create 3ID Web3 External
   * using XDV
   * @param address address
   * @param ecKeyPair ECDSA key pair
   * @param web3provider Web3 Provider
   */
  async create3IDWeb3External(
    web3provider: any,
    address: string,
  ): Promise<DIDContext> {
    const threeid = new ThreeIdConnect()
    const authProvider = new EthereumAuthProvider(web3provider, address)
    await threeid.connect(authProvider)

    const did = new DID({
      provider: (await threeid.getDidProvider()) as any,
      resolver: KeyResolver.getResolver(),
    } as unknown)

    return {
      did,
      issuer: null,
    } as DIDContext
  }
}
