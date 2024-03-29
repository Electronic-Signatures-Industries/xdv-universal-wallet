import EthrDID from 'ethr-did'
import * as blsKeygen from 'bls12-381-keygen'
import * as bls from 'noble-bls12-381'
import { ec, eddsa } from 'elliptic'
import { BigNumber, ethers } from 'ethers'
import { getMasterKeyFromSeed } from 'ed25519-hd-key'
import { IsDefined, IsOptional, IsString, matches } from 'class-validator'
import { JOSEService } from './JOSEService'
import { JWE, JWK } from 'node-jose'
import { JWTService } from './JWTService'
import { KeyConvert } from './KeyConvert'
import { LDCryptoTypes } from './LDCryptoTypes'
import { from, Subject, throwError } from 'rxjs'
import { arrayify, hexlify, mnemonicToSeed } from 'ethers/lib/utils'
import Web3 from 'web3'
import { DIDManager } from '../3id/DIDManager'
import { DID } from 'did-jwt-rsa/lib/dids';

import { toEthereumAddress } from 'did-jwt'
import EthCrypto from 'eth-crypto'
import { stringToBytes } from 'did-jwt/lib/util'
import { RxDatabase, RxDocument, RxQuery, RxDocumentBase } from 'rxdb'

// import modules
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core'
import moment from 'moment'

import * as PouchdbAdapterIdb from 'pouchdb-adapter-idb'
import * as PouchdbAdapterMemory from 'pouchdb-adapter-memory'
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption'
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import { getWeb3 } from '../utils/web3factory'

export type AlgorithmTypeString = keyof typeof AlgorithmType
export enum AlgorithmType {
  RSA,
  ES256K,
  P256,
  ED25519,
  BLS_EIP2333,
  P256_JWK_PUBLIC,
  ED25519_JWK_PUBLIC,
  ES256K_JWK_PUBLIC,
  RSA_JWK_PUBLIC,
  RSA_PEM_PUBLIC,
}

export interface BlsEip2333 {
  publicKey: Uint8Array
  privateKey: Uint8Array
}

export class WalletOptions {
  @IsString()
  @IsDefined()
  password: string

  @IsOptional()
  @IsString()
  mnemonic?: string
}
export interface XDVUniversalProvider {
  did: DID & EthrDID
  secureMessage: any
  privateKey: any
  getIssuer: Function
  issuer?: EthrDID
  id: string
  web3?: Web3
  address?: string
  publicKey: any
}

export interface ICreateOrLoadWalletProps {
  walletId?: string
  passphrase?: string
  registry?: string
  rpcUrl?: string
  mnemonic?: string
  accountName?: string
}

export interface KeyStoreModel {
  ES256K: any
  P256: any
  BLS_EIP2333: any
  ED25519: any
}

export interface KeystoreDbModel {
  walletId: string
  keypairs: KeyStoreModel
  path?: string
  mnemonic: string
  keypairExports: KeyStoreModel
  publicKeys?: any
}

export class KeyStore implements KeyStoreModel {
  public ED25519: any
  public ES256K: any
  public P256: any
  public BLS_EIP2333: any
  constructor() {}
}

// Main data repository
export interface Account {
  id: string
  created: number
  isLocked: boolean
  description: string
  attributes: any[]
  currentKeystoreId: string
  keystores: KeystoreDbModel[]
}

export const XDVWalletSchema = {
  title: 'XDV Wallet Schema',
  version: 0,
  description: 'A RxDB XDV Wallet Account schema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
    },
    created: {
      type: 'number',
    },
    isLocked: {
      type: 'boolean',
    },
    currentKeystoreId: {
      type: 'string',
    },
    attributes: {
      type: 'array',
    },
    keystores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          walletId: {
            type: 'string',
          },
          mnemonic: {
            type: 'string',
          },
          keystoreSeed: {
            type: 'string',
          },
          keypairs: {
            type: 'object',
          },
          keypairExports: {
            type: 'object',
          },
          publicKeys: {
            type: 'object',
          },
          path: {
            type: 'string',
          },
        },
      },
    },
    description: {
      type: 'string',
    },
  },
  encrypted: ['keystores'],
}

/**
 * XDV Wallet for DID and VC use cases
 */
export class Wallet {
  private readonly DB_NAME = 'xdv:universal:wallet'
  public onRequestPassphraseSubscriber: Subject<any> = new Subject<any>()
  public onRequestPassphraseWallet: Subject<any> = new Subject<any>()
  public onSignExternal: Subject<any> = new Subject<{
    isEnabled: boolean
    signature: string | Buffer
  }>()
  protected db: RxDatabase
  accepted: any
  isWeb = false

  /**
   * Creates a new Wallet
   * @param param0 isWeb, true if used by browser otherwise false
   */
  constructor({ isWeb } = { isWeb: false }) {
    addRxPlugin(RxDBUpdatePlugin)
    addRxPlugin(RxDBValidatePlugin)
    addRxPlugin(RxDBEncryptionPlugin)

    if (isWeb) {
      addRxPlugin(PouchdbAdapterIdb)
    } else {
      addRxPlugin(PouchdbAdapterMemory)
    }
    this.isWeb = isWeb
  }

  /**\
   * Opens a db
   */
  async open(accountName: string, passphrase: string) {
    try {
      if (!matches(accountName, /^[a-z][_$a-z0-9]*$/)) {
        throw new Error('Invalid account name')
      }
      if (passphrase.length < 11) {
        throw new Error('Passphrase must be 12 or more characters')
      }
      this.db = await createRxDatabase({
        name: accountName,
        adapter: this.isWeb ? 'idb' : 'memory',
        multiInstance: true,
        password: passphrase,
        ignoreDuplicate: true,
      })

      await this.enrollAccount({
        accountName,
        passphrase
      })
      return this
    } catch (e) {
      // already exists
      throw e
    }
  }
  /**
   * Enrolls account, returns false if already exists, otherwise account model
   * @param options create or load wallet options, password must be at least 12 chars
   * @deprecated Only call open, will be removed in 0.6.0
   */
  async enrollAccount(options: ICreateOrLoadWalletProps) {
    await this.db.addCollections({
      accounts: {
        schema: XDVWalletSchema,
      },
    })

    const accounts = this.db.accounts
    const accountModel: Account = {
      id: 'xdv:account',
      created: moment().unix(),
      isLocked: false,
      description: options.accountName,
      attributes: [],
      currentKeystoreId: '',
      keystores: [],
    }
    if (!((await this.db.accounts.findByIds(['xdv:account'])).size > 0)) {
      return accounts.insert(accountModel)
    }
  }

  async close() {
    await this.db.destroy()
  }

  /**
   * Creates an universal wallet for ES256K
   * @param options { passphrase, walletid, registry, rpcUrl }
   */
  async createES256K(options: ICreateOrLoadWalletProps) {
    let ks
    let account = await this.getAccount()

    //open an existing wallet
    ks = account.get('keystores').find((w) => w.walletId === options.walletId)
    if (!ks) throw new Error('No wallet selected')

    const kp = new ec('secp256k1')
    const kpInstance = kp.keyFromPrivate(ks.keypairs.ES256K);
    const didManager = new DIDManager()
    const address = toEthereumAddress(kpInstance.getPublic('hex'))

    const encrypt = async (pub, message) => {
      const data: any = await EthCrypto.encryptWithPublicKey(
        pub.replace('0x', ''),
        message,
      )

      return EthCrypto.cipher.stringify(data)
    }

    const decrypt = async (cipher) => {
      const data: any = await EthCrypto.decryptWithPrivateKey(
        ks.keypairs.ES256K,
        EthCrypto.cipher.parse(cipher),
      )

      return data
    }

    // Buffer.from(pub, 'hex')
    const did = didManager.createEthrDID(
      address,
      kpInstance,
      options.registry,
      options.rpcUrl,
    )

    return ({
      did,
      secureMessage: {
        encrypt,
        decrypt,
      },
      address,
      privateKey: kpInstance.getPrivate('hex'),
      publicKey: kpInstance.getPublic('hex'),
    } as unknown) as XDVUniversalProvider
  }

  /**
   * Creates an universal wallet for Ed25519
   * @param options { passphrase, walletid }
   */
  async createEd25519(options: ICreateOrLoadWalletProps) {
    let ks
    let account = await this.getAccount(options.passphrase)

    //open an existing wallet
    ks = account.get('keystores').find((w) => w.walletId === options.walletId)
    if (!ks) throw new Error('No wallet selected')

    const kp = new eddsa('ed25519')
    const kpInstance = kp.keyFromSecret(ks.keypairs.ED25519);
    const didManager = new DIDManager()
    const { did, getIssuer } = await didManager.create3ID_Ed25519(kpInstance)

    return ({
      did,
      getIssuer,
      privateKey: kpInstance.getSecret(),
      publicKey: kpInstance.getPublic(),
    } as unknown) as XDVUniversalProvider
  }

  /**
   * Creates an universal wallet  for Web3 Providers
   * @param options { passphrase, walletid, registry, rpcUrl }
   */
  async createWeb3Provider(options: ICreateOrLoadWalletProps) {
    let web3: Web3
    let ks: any
    let account = await this.getAccount()

    web3 = getWeb3(options.rpcUrl)
    //open an existing wallet
    ks = account.get('keystores').find((w) => w.walletId === options.walletId)
    if (!ks) throw new Error('No wallet selected')

    const privateKey = '0x' + ks.keypairs.ES256K
    web3.eth.accounts.wallet.add(privateKey)
    const address = web3.eth.accounts.privateKeyToAccount(privateKey).address
    web3.defaultAccount = address
    const ES256k = new ec('secp256k1')

    const encrypt = async (pub, message) => {
      const data: any = await EthCrypto.encryptWithPublicKey(
        pub.replace('0x', ''),
        message,
      )

      return EthCrypto.cipher.stringify(data)
    }

    const decrypt = async (cipher) => {
      const data: any = await EthCrypto.decryptWithPrivateKey(
        ks.keypairs.ES256K,
        EthCrypto.cipher.parse(cipher),
      )

      return data
    }
    

    return ({
      secureMessage: {
        encrypt,
        decrypt,
      },
      publicKey: ES256k.keyFromPrivate(ks.keypairs.ES256K).getPublic(),
      web3,
      address,
    } as unknown) as XDVUniversalProvider
  }

  // =========================================
  // BLS Multisig
  // =========================================
  /**
   * Signs message with a BLS private key given a wallet id
   * @param options 
   * @param message 
   * @returns Promise
   */
  async aggregateSign(options: ICreateOrLoadWalletProps, message: Uint8Array) {
    let ks
    let account = await this.getAccount()

    // open an existing wallet
    ks = account.get('keystores').find((w) => w.walletId === options.walletId)
    if (!ks) throw new Error('No wallet selected')

    const kp = arrayify(ks.keypairs.BLS_EIP2333);
    return bls.sign(message, kp, null);
  }


  /**
   * Gets BLS public key
   * @param options 
   * @returns UInt8Array
   */
  async getBlsPublicKey(options: ICreateOrLoadWalletProps){
    let ks
    let account = await this.getAccount()

    //open an existing wallet
    ks = account.get('keystores').find((w) => w.walletId === options.walletId)
    if (!ks) throw new Error('No wallet selected')

    const kp = arrayify(ks.keypairs.BLS_EIP2333);
    return bls.getPublicKey(kp);
  }

  /**
   * Verifies aggregated signatures, one message signed by many
   * @param signatures An array of signatures
   * @param message A single message
   * @param publicKeys An array of public keys
   * @returns Promise
   */
  async verifyAggregatedPubkeys(signatures: any[], message: any, publicKeys: any[]) {
    const aggregatedPublicKey = bls.aggregatePublicKeys(publicKeys)
    const aggregatedSignatures = bls.aggregateSignatures(signatures)

    return bls.verify(message, aggregatedPublicKey, aggregatedSignatures, null);
  }


  /**
   * Verifies aggregated signatures, many messages signed by many
   * @param signatures An array of signatures
   * @param message An array of messages
   * @param publicKeys An array of public keys
   * @returns Promise
   */
  async verifyBatch(signatures: any[], messages: any[], publicKeys: any[]) {
    const aggregatedSignatures = bls.aggregateSignatures(signatures);
    return await bls.verifyMultiple(
      messages,
      publicKeys,
      aggregatedSignatures,
      null
    );
  }

  // ========================================================

  /**
   * Adds a set of ES256K and ED25519 Wallets
   * @param options
   */
  public async addWallet(options: ICreateOrLoadWalletProps = {}) {
    let account = await this.getAccount()

    if (!account) throw new Error('No account')

    let id = Buffer.from(ethers.utils.randomBytes(100)).toString('base64')
    let mnemonic = options.mnemonic
    let ethersWallet
    if (mnemonic) {
      ethersWallet = ethers.Wallet.fromMnemonic(mnemonic)
    } else {
      ethersWallet = ethers.Wallet.createRandom()
      mnemonic = ethersWallet.mnemonic.phrase
    }

    let keystores: KeyStoreModel = new KeyStore()
    let keyExports: KeyStoreModel = new KeyStore()

    // ED25519
    let kp = this.getEd25519(mnemonic)
    keystores.ED25519 = kp.getSecret('hex')
    keyExports.ED25519 = await KeyConvert.getEd25519(kp)
    keyExports.ED25519.ldJsonPublic = await KeyConvert.createLinkedDataJsonFormat(
      LDCryptoTypes.Ed25519,
      kp as any,
      false,
    )

    // ES256K
    const kpec = this.getES256K(mnemonic) as ec.KeyPair
    keystores.ES256K = kpec.getPrivate('hex')
    keyExports.ES256K = await KeyConvert.getES256K(kpec)
    keyExports.ES256K.ldJsonPublic = await KeyConvert.createLinkedDataJsonFormat(
      LDCryptoTypes.JWK,
      // @ts-ignore
      { publicJwk: JSON.parse(keyExports.ES256K.ldSuite.publicKeyJwk) },
      false,
    )

    // Multisig, Ethereum2, Filecoin
    const blsKp = this.getBlsEip2333(mnemonic) as BlsEip2333
    keystores.BLS_EIP2333 = Buffer.from(blsKp.privateKey).toString('hex');

    const keystore: KeystoreDbModel = {
      walletId: id,
      keypairs: keystores,
      mnemonic: mnemonic,
      keypairExports: keyExports,
    }

    const ksArray = account.get('keystores')
    const row = await account.update({
      $set: {
        currentKeystoreId: id,
        keystores: [...ksArray, keystore],
      },
    })

    return id
  }

  /**
   * Get private key as elliptic keypair
   * @param algorithm
   * @param keystoreId
   */
  protected async getPrivateKey(
    algorithm: AlgorithmTypeString,
    keystoreId: string,
  ): Promise<ec.KeyPair | eddsa.KeyPair> {
    let account = await this.getAccount()

    //open an existing wallet
    const ks = account.get('keystores').find((w) => w._id === keystoreId)
    if (!ks) throw new Error('No wallet selected')

    if (algorithm === 'ED25519') {
      const kp = new eddsa('ed25519')
      return kp.keyFromSecret(ks.keypairs.ED25519) as eddsa.KeyPair
    } else if (algorithm === 'P256') {
      const kp = new ec('p256')
      return kp.keyFromPrivate(ks.keypairs.P256) as ec.KeyPair
    } else if (algorithm === 'ES256K') {
      const kp = new ec('secp256k1')
      return kp.keyFromPrivate(ks.keypairs.ES256K) as ec.KeyPair
    }
  }

  /**
   * Get private key exports
   * @param algorithm
   * @param keystoreId
   */
  protected async getPrivateKeyExports(
    algorithm: AlgorithmTypeString,
    keystoreId: string,
  ) {
    let account = await this.getAccount()

    //open an existing wallet
    const ks = account.get('keystores').find((w) => w._id === keystoreId)
    if (!ks) throw new Error('No wallet selected')

    return ks.keypairExports[algorithm]
  }

  public async canUse() {
    let ticket = null
    const init = this.accepted
    return new Promise((resolve) => {
      ticket = setInterval(() => {
        if (this.accepted !== init) {
          clearInterval(ticket)
          resolve(this.accepted)
          this.accepted = undefined
          return
        }
      }, 1000)
    })
  }

  /**
   * Signs with selected algorithm
   * @param algorithm Algorithm
   * @param payload Payload as buffer
   * @param options options
   */
  public async sign(
    algorithm: AlgorithmTypeString,
    keystoreId: string,
    payload: Buffer,
  ): Promise<[Error, any?]> {
    this.onRequestPassphraseSubscriber.next({
      type: 'request_tx',
      payload,
      algorithm,
    })

    const canUseIt = await this.canUse()

    let key
    if (canUseIt) {
      if (algorithm === 'ED25519') {
        key = await this.getPrivateKey(algorithm, keystoreId)
        return [null, key.sign(payload).toHex()]
      } else if (algorithm === 'ES256K') {
        key = await this.getPrivateKey(algorithm, keystoreId)
        return [null, key.sign(payload).toHex()]
      }
    }
    return [new Error('invalid_passphrase')]
  }

  /**
   * Signs a JWT for single recipient
   * @param algorithm Algorithm
   * @param payload Payload as buffer
   * @param options options
   */
  public async signJWT(
    algorithm: AlgorithmTypeString,
    keystoreId: string,
    payload: any,
    options: any,
  ): Promise<[Error, any?]> {
    this.onRequestPassphraseSubscriber.next({
      type: 'request_tx',
      payload,
      algorithm,
    })

    const canUseIt = await this.canUse()

    if (canUseIt) {
      const { pem } = await this.getPrivateKeyExports(algorithm, keystoreId)
      return [null, await JWTService.sign(pem, payload, options)]
    }
    return [new Error('invalid_passphrase')]
  }

  /**
   * Signs JWT using public keys
   * @param publicKey
   * @param payload
   * @param options
   */
  public async signJWTFromPublic(
    publicKey: any,
    payload: any,
    options: any,
  ): Promise<[Error, any?]> {
    this.onRequestPassphraseSubscriber.next({ type: 'request_tx', payload })

    const canUseIt = await this.canUse()

    if (canUseIt) {
      return [null, JWTService.sign(publicKey, payload, options)]
    }

    return [new Error('invalid_passphrase')]
  }

  /**
   * Encrypts JWE
   * @param algorithm Algorithm
   * @param payload Payload as buffer
   * @param overrideWithKey Uses this key instead of current wallet key
   *
   */
  public async encryptJWE(
    algorithm: AlgorithmTypeString,
    keystoreId: string,
    payload: any,
    overrideWithKey: any,
  ): Promise<[Error, any?]> {
    this.onRequestPassphraseSubscriber.next({
      type: 'request_tx',
      payload,
      algorithm,
    })

    const canUseIt = await this.canUse()

    if (canUseIt) {
      let jwk
      if (overrideWithKey === null) {
        const keys = await this.getPrivateKeyExports(algorithm, keystoreId)
        jwk = keys.jwk
      }
      // @ts-ignore
      return [null, await JOSEService.encrypt([jwk], payload)]
    }
    return [new Error('invalid_passphrase')]
  }

  /**
   * Decript JWE
   * @param algorithm
   * @param keystoreId
   * @param payload
   */
  public async decryptJWE(
    algorithm: AlgorithmTypeString,
    keystoreId: string,
    payload: any,
  ): Promise<[Error, any?]> {
    this.onRequestPassphraseSubscriber.next({
      type: 'request_tx',
      payload,
      algorithm,
    })

    const canUseIt = await this.canUse()

    if (canUseIt) {
      const { jwk } = await this.getPrivateKeyExports(algorithm, keystoreId)

      return [
        null,
        await JWE.createDecrypt(await JWK.asKey(jwk, 'jwk')).decrypt(payload),
      ]
    }
    return [new Error('invalid_passphrase')]
  }

  /**
   * Generates a mnemonic
   */
  public static generateMnemonic() {
    return ethers.Wallet.createRandom().mnemonic
  }

  /**
   * Derives a wallet from a path
   */
  public deriveFromPath(mnemonic: string, path: string): any {
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic).derivePath(path)
    return node
  }

  // ------------------------------------------------------------------
  // Algorithms supported: BLS EIP-2333, EdDSA, ECDSA secp256k1, p256
  // ------------------------------------------------------------------
  public getBlsEip2333(mnemonic: string): BlsEip2333 {
    const path = 'm/12381/3600/0/0/0'
    const pk = blsKeygen.deriveSeedTree(
      Buffer.from(mnemonicToSeed(mnemonic)),
      path,
    )

    return {
      publicKey: bls.getPublicKey(pk),
      privateKey: pk,
    }
  }
  /**
   * Gets EdDSA key pair
   */
  public getEd25519(mnemonic: string): eddsa.KeyPair {
    const ed25519 = new eddsa('ed25519')
    // const hdkey = HDKey.fromExtendedKey(HDNode.fromMnemonic(this.mnemonic).extendedKey);
    const { key } = getMasterKeyFromSeed(mnemonicToSeed(mnemonic))
    const keypair = ed25519.keyFromSecret(key)
    return keypair
  }

  /**
   * Gets ECDSA key pair
   * @param mnemonic
   */
  public getES256K(mnemonic: string): ec.KeyPair {
    const ES256k = new ec('secp256k1')
    const keypair = ES256k.keyFromPrivate(
      ethers.utils.HDNode.fromMnemonic(mnemonic).privateKey,
    )
    return keypair
  }

  /**
   * Gets keystore from session db
   */
  async getAccount(passphrase?: string): Promise<RxDocument> {
    let account
    try {
      const accounts = this.db.accounts
      account = await accounts
        .findOne({
          selector: {
            id: 'xdv:account',
          },
        })
        .exec()
      return account
    } catch (e) {
      return e
    }
  }

  /**
   * Sets account lock
   * @param id
   */
  async setAccountLock(lock: boolean) {
    const accounts = this.db.accounts
    const account: RxDocument = await accounts
      .findOne({
        selector: {
          id: 'xdv:account',
        },
      })
      .exec()

    const updated = await account.update({
      $set: {
        isLocked: lock,
      },
    })

    return updated
  }

  /**
   * Sets current keystore
   * @param passphrase
   * @param id
   *
   */
  async setCurrentKeystore(id: string) {
    const accounts = this.db.accounts
    const account: RxDocument = await accounts
      .findOne({
        selector: {
          id: 'xdv:account',
        },
      })
      .exec()

    const updated = await account.update({
      $set: {
        currentKeystoreId: id,
      },
    })

    return updated
  }

  /**
   * @deprecated This method is only used to be able to compile tests.
   * Please ignore.
   */
  async initialize(password: string) {}
}
