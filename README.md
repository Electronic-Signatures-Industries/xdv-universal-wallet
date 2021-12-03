DEPRECATED

# xdv-universal-wallet
XDV Universal Wallet


## Install

`npm i xdv-universal-wallet-core`

## Features

* RxDB storage with encryption enabled
* DID and IPLD ready
* Supports ES256K, Ed25519 and RS256
* Aggregation signatures - BLS



## Quickstart

1. This repository uses NPM Workspaces.
1. On the root path, install all modules: `npm install`
1. To compile a new version of the Core Module: `npm run build --workspace core`
1. To run the NextJS frontend: `npm run dev --workspace frontend`
1. To run tests on all modules: `npm run test`
1. To build a production version of the NextJS frontend: `npm run build --workspace frontend`

## Example

```typescript
    import { Wallet } from "xdv-universal-wallet-core";

    const did = await Wallet.create3IDEd25519({
      passphrase: 'abcdef123456',
    })
    expect(did.id.length).to.be.above(0)

    const ipfsManager = new IPFSManager(did.did)
    await ipfsManager.start()

    const fil = Buffer.from('fffffffffffffffffffffff')
    // auth
    await did.did.authenticate()
    const cid = await ipfsManager.addSignedObject(fil, {
      name: 'UnitTest.txt',
      contentType: 'text/text',
      lastModified: new Date(),
    })
    expect(cid.length).to.be.above(0)

    const res = await ipfsManager.getObject(cid)
    expect(res.value.name).equal('UnitTest.txt')

```

## API

### crypto/Wallet

### BLS Signatures (aggregation)



#### async aggregateSign(options: any, message: Uint8Array)
  
Signs message with a selected wallet id

Parameters


* `options.walletid`: A wallet id, set it to load a previously created wallet, otherwise leave empty
* `messsage`: Uint8Array data to sign


Returns a `Promise<Uint8Array>`

#### async getBlsPublicKey(options: any)
  
Gets public key with a selected wallet id

Parameters


* `options.walletid`: A wallet id, set it to load a previously created wallet, otherwise leave empty

Returns a `Uint8Array`


####   async verifyAggregatedPubkeys(signatures: any[], message: any, publicKeys: any[])
  
Verifies aggregated signatures, one message signed by many

Returns a `Promise<Uint8Array>`

#### async verifyBatch(signatures: any[], messages: any[], publicKeys: any[])
  
Verifies aggregated signatures, many messages signed by many

Returns a `Promise<Uint8Array>`

### Crypto suites

#### static async createES256K(options: any)
  
Creates an ES256K universal wallet

Parameters

* `passphrase`: Passphrase
* `walletid`: A wallet id, set it to load a previously created wallet, otherwise leave empty
* `rpcUrl`: An EVM Compatible chain (Ethereum, Binance Smart Chain, etc)
* `registry`: Contract address for EVM compatible ethr-did registry

Returns a `XDVUniversalProvider`

* `did`: A DID object from 3ID library. Allows to authenticate and sign with IPLD
* `secureMesssage`: Uses `EthCrypto` for encrypting and decrypting
* `publicKey`: A public key as an array like
* `issuer`: A DID object for issue signers
* `web3`: Web3 instance used by DApps
* `id`: A wallet id
* `address`: Wallet address

#### static async createEd25519(options: any)
  
Creates an Ed25519 universal wallet with DID Key as result.

>Note: Signing only, support for X25519 will be added later

Creates an universal wallet for ES256K

Parameters

* `passphrase`: Passphrase
* `walletid`: A wallet id, set it to load a previously created wallet, otherwise leave empty

Returns a `XDVUniversalProvider`

* `did`: A DID object from 3ID library. Allows to authenticate and sign with IPLD
* `publicKey`: A public key as an array like
* `getIssuer`: A DID object for issue signers
* `privateKey`: A private key as an array like

#### static async createWeb3Provider(options: any)
  
Creates a Web3 provider

Parameters

* `passphrase`: Passphrase
* `walletid`: A wallet id, set it to load a previously created wallet, otherwise leave empty
* `rpcUrl`: An EVM Compatible chain (Ethereum, Binance Smart Chain, etc)
* `registry`: Contract address for EVM compatible ethr-did registry


Returns a `XDVUniversalProvider`

* `secureMesssage`: Uses `EthCrypto` for encrypting and decrypting
* `publicKey`: A public key as an array like
* `web3`: Web3 instance used by DApps
* `address`: Wallet address


### Usage

#### How to create, import and open a wallet

```typescript

  /**
   * Creates a wallet account
   * @param accountName Account name
   * @param passphrase Passphrase
   */
  async createAccount(accountName: string, passphrase: string) {
  // Set isWeb for browser usage
    const xdvWallet = new Wallet({ isWeb: true })
    
    // Unlocks wallet
    await xdvWallet.open(accountName, passphrase)
  }

  /**
   * Creates a wallet
   * @param accountName Account name
   * @param passphrase Passphrase
   * @returns
   */
  async createWallet(accountName: string, passphrase: string) {
    const xdvWallet = new Wallet({ isWeb: true })
    await xdvWallet.open(accountName, passphrase)

    // Gets account, if null, user needs to enroll
    const acct = (await xdvWallet.getAccount()) as any
    let walletId

    if (acct.keystores.length === 0) {
      // Adds a wallet. 
      walletId = await xdvWallet.addWallet()
    } else {
      // Gets first wallet 
      walletId = acct.keystores[0].walletId
    }

    // Creates a wallet based on crypto suite
    const wallet = await xdvWallet.createEd25519({
      passphrase: passphrase,
      walletId: walletId,
    })

    return wallet as any
  }

  /**
   * Imports an existing seed phrase
   * @param accountName Account name
   * @param passphrase Passphrase
   * @param mnemonic Seed phrase
   * @returns
   */
  async importWallet(
    accountName: string,
    passphrase: string,
    mnemonic: string,
  ) {
    const xdvWallet = new Wallet({ isWeb: true })
    await xdvWallet.open(accountName, passphrase)

    const acct = (await xdvWallet.getAccount()) as any

    if (acct.keystores.length > 0) {
      // already imported
      return xdvWallet
    }

    // Import wallet using existing mnemonic
    const walletId = await xdvWallet.addWallet({
      mnemonic,
    })

    const wallet = await xdvWallet.createEd25519({
      passphrase: passphrase,
      walletId: walletId,
    })

    return wallet as any
  }

```

#### How to encrypt between two parties

```typescript
// Obtain a previously created account
let acct = await wallet.getAccount()

// add Alice and Bob wallets with auto generated mnemonic
const walletAId = await wallet.addWallet()
const walletBId = await wallet.addWallet()

// create DIDs
const did = await wallet.createEd25519({
  walletId: walletAId
})
const didBob = await wallet.createEd25519({
  walletId: walletBId
})

// create Alice IPLD Manager
const ipfsManager = new IPLDManager(did.did)
await ipfsManager.start()

// Authenticate with DID
await did.did.authenticate()
await didBob.did.authenticate()

// Alice encrypts, and both Alice and Bob can decrypt
const enc = await ipfsManager.encryptObject('Hola Mundo !!!', [
  didBob.did.id,
])

// Bob DID decrypts content
const res = await ipfsManager.decryptObject(didBob.did, enc.toString(), {})
expect(res.cleartext).toEqual('Hola Mundo !!!')
```

#### Cosmos SDK - Starport Wallet

```typescript

require('dotenv').config()

import { DirectSecp256k1HdWallet, Registry } from '@cosmjs/proto-signing'
import { defaultRegistryTypes, SigningStargateClient, StargateClient } from '@cosmjs/stargate'

import { KeystoreDbModel, Wallet } from 'xdv-universal-wallet-core'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import * as xdvnode from './xdvnode'
import * as bank from './bank'

export class XDVNodeProvider {
  registry: Registry
  wallet: Wallet
  /**
   * Register Msg imports
   */
  constructor() {
    this.wallet = new Wallet({ isWeb: false })
    
  }

  /**
   * Creates a wallet account
   * @param accountName Account name
   * @param passphrase Passphrase
   */
  async createAccount(accountName: string, passphrase: string) {
    await this.wallet.open(accountName, passphrase)
    await this.wallet.enrollAccount({
      accountName,
    })

  }

  /**
   * Creates a wallet
   * @param accountName Account name
   * @param passphrase Passphrase
   * @returns
   */
  async createWallet(accountName: string, passphrase: string) {
    await this.wallet.open(accountName, passphrase)

    const acct = (await this.wallet.getAccount()) as any
    let walletId

    if (acct.keystores.length === 0) {
      walletId = await this.wallet.addWallet()
    } else {
      walletId = acct.keystores[0].walletId
    }

    const wallet = await this.wallet.createEd25519({
      passphrase: passphrase,
      walletId: walletId,
    })

    return wallet as any
  }

  /**
   * Imports an existing seed phrase
   * @param accountName Account name
   * @param passphrase Passphrase
   * @param mnemonic Seed phrase
   * @returns
   */
  async importWallet(
    accountName: string,
    passphrase: string,
    mnemonic: string,
  ) {
    await this.wallet.open(accountName, passphrase)

    const acct = (await this.wallet.getAccount()) as any

    if (acct.keystores.length > 0) {
      // already imported
      return this.wallet
    }

    const walletId = await this.wallet.addWallet({
      mnemonic,
    })

    const wallet = await this.wallet.createEd25519({
      passphrase: passphrase,
      walletId: walletId,
    })

    return wallet as any
  }

  async createOrLoadXDVProvider(accountName: string, passphrase: string) {
    const acct = (await this.wallet.getAccount()) as any
    let walletId = ''
    if (acct.keystores.length === 0) {
      walletId = await this.wallet.addWallet({
        mnemonic: process.env.ALICE_M,
      })
    } else {
      walletId = acct.keystores[0].walletId
    }

    const keystore = await acct.keystores.find(
      (k: KeystoreDbModel) => k.walletId === walletId,
    )

    console.log(keystore)
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(
      keystore.mnemonic,
      { prefix: 'xdv' },
    )
    
    return { 
      bank: await bank.txClient(
        signer,
      ),
      xdvnode: await xdvnode.txClient(
        signer,
      )
    }
  }
}
```

> Copyright Industrias de Firmas Electronicas SA and contributors 2020, 2021
