# xdv-universal-wallet
XDV Universal Wallet


## Install

`npm i xdv-universal-wallet-core`

## Features

* RxDB storage with encryption enabled
* DID and IPLD ready
* Supports ES256K, Ed25519 and RS256
* Aggregation signatures - BLS
* Signs hardware based PKCS#11 using XDV Signer


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

#### static async create3IDEd25519(options: any)
  
Creates an Ed25519 universal wallet

>Note: Signing only, support for X25519 will be added later

Creates an universal wallet for ES256K

Parameters

* `passphrase`: Passphrase
* `walletid`: A wallet id, set it to load a previously created wallet, otherwise leave empty

Returns a `XDVUniversalProvider`

* `did`: A DID object from 3ID library. Allows to authenticate and sign with IPLD
* `secureMesssage`: Uses `EthCrypto` for encrypting and decrypting
* `publicKey`: A public key as an array like
* `issuer`: A DID object for issue signers
* `web3`: Web3 instance used by DApps
* `id`: A wallet id
* `address`: Wallet address


#### static async createWeb3Provider(options: any)
  
Creates a Web3 provider universal wallet

Parameters

* `passphrase`: Passphrase
* `walletid`: A wallet id, set it to load a previously created wallet, otherwise leave empty
* `rpcUrl`: An EVM Compatible chain (Ethereum, Binance Smart Chain, etc)
* `registry`: Contract address for EVM compatible ethr-did registry

### 3id/DIDManager


#### async create3ID_RSA(kp: any)
  
Creates a RS256 did

Parameter

* `kp`: RSA keypair

Returns a `DIDContext`

* `did`: A DID object from 3ID library. Allows to authenticate and sign with IPLD
* `issuer`: A DID object for issue signers


#### async create3ID_PKCS11(pin: any)
  
Creates a RS256 did from a HSM

Parameter

* `pin`: HSM pin

Returns a `DIDContext`

* `did`: A DID object from 3ID library. Allows to authenticate and sign with IPLD

### 3id/DriveManager

### 3id/IPFSManager

### 3id/W3CVerifiedCredential


#### issueCredential(did: DID, issuer: any, holderInfo: any)
  
Issues a Verified Credential

Parameters
* @param options { passphrase, walletid, rpcUrl }
