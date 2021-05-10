import { Wallet } from './Wallet'
import { IPLDManager } from '../3id/IPLDManager'
import { W3CVerifiedCredential } from '../3id/W3CVerifiedCredential'

jest.mock('../3id/IPLDManager')
jest.mock('../3id/DIDManager')
jest.mock("../utils/web3factory")

let id = null
let url = 'https://ropsten.infura.io/v3/79110f2241304162b087759b5c49cf99'

describe('Wallet', () => {
  const wallet: Wallet = new Wallet()

  beforeEach(async () => {
    // Password 12 characters or more
    const passphrase = 'qwerty123456'
    const accountName = 'molekilla'

    await wallet.open(accountName, passphrase)

    // Enroll account only needs to done once
    // Returns account if already created
    await wallet.enrollAccount({
      passphrase,
      accountName: 'mywallet1',
    })
  })

  describe('wallet and 3ID', function () {
    it.skip('when calling createWeb3Provider, should return a web3 instance and wallet id', async function () {
      let acct = await wallet.getAccount()

      // Assert keystores length is 0, enrollAccount only creates an account
      if (acct.get('keystores').length === 0) {
        expect(acct.get('keystores').length).toEqual(0)
      }

      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      // Assert keystores exists
      if (acct.get('keystores').length > 0) {
        expect(acct.get('keystores').length).toBeGreaterThan(0)
      }

      // Create 3ID enabled Web3 provider
      const result = await wallet.createWeb3Provider({
        rpcUrl: url,
        walletId
      })

      expect(result.id.length).toBeGreaterThan(0)
      // wallet.close();
    })

    it('when calling createWeb3Provider and create3IDWeb3, should return a web3 instance and wallet id', async function () {
      let acct = await wallet.getAccount()

      // Assert keystores length is 0, enrollAccount only creates an account
      if (acct.get('keystores').length === 0) {
        expect(acct.get('keystores').length).toBe(0)
      }

      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      // Assert keystores exists
      if (acct.get('keystores').length > 0) {
        expect(acct.get('keystores').length).toBeGreaterThan(0)
      }
      id = walletId

      expect(id.length).toBeGreaterThan(0)
    })

    it('when calling createES256K with an existing id, should return a web3 instance and wallet id', async function () {
      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      const result = await wallet.createES256K({
        passphrase: '1234',
        rpcUrl: url,
        walletId,
        registry: '',
        accountName: '',
      })

      expect(result.address).toEqual(result.address)
    })

    it('when Allice, Charlie and Bob sign using BLS should verify aggregated signature and public key ', async function () {
      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      const result = await wallet.createES256K({
        passphrase: '1234',
        rpcUrl: url,
        walletId,
        registry: '',
        accountName: '',
      })

      expect(result.address).toEqual(result.address)
    })

    it('should verify aggregated signature', async function () {
      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      const result = await wallet.createES256K({
        passphrase: '1234',
        rpcUrl: url,
        walletId,
        registry: '',
        accountName: '',
      })

      expect(result.address).toEqual(result.address)
    })

    it('when calling createES256K with an existing id and create a VC, should return a web3 instance and wallet id', async function () {
      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      const result = await wallet.createES256K({
        passphrase: '1234',
        rpcUrl: url,
        walletId,
        registry: '',
        accountName: '',
      })

      const vcService = new W3CVerifiedCredential()
      const vc = await vcService.issueCredential(result.did, result.did, {
        name: 'Rogelio',
        lastName: 'Morrell',
        cedula: '8-713-2230',
        nationality: 'Panamanian',
        email: 'rogelio@ifesa.tech',
      })
      expect(vc.length).toBeGreaterThan(0)
    })

    it.skip('when calling create3IDEd25519 , should return a did instance and wallet id', async function () {
      // Password 12 characters or more
      const passphrase = 'qwerty123456'
      const accountName = 'molekilla'

      await wallet.open(accountName, passphrase)

      // Enroll account only needs to done once
      // Returns account if already created
      await wallet.enrollAccount({
        passphrase,
        accountName,
      })

      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      const result = await wallet.createEd25519({
        rpcUrl: url,
        walletId,
        registry: '',
      })
      await result.did.authenticate()
      const issuer = result.getIssuer()
      expect(issuer.alg).toEqual('Ed25519')
      expect(result.did.id.length).toBeGreaterThan(0)
    })
  })

  describe('wallet, 3ID and IPLD', function () {
    it.skip('when adding a signed DID/IPLD object , should fetch and return uploaded data', async function () {
      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletId = await wallet.addWallet()

      const result = await wallet.createEd25519({
        rpcUrl: url,
        walletId,
        registry: '',
      })
      const ipfsManager = new IPLDManager(result.did)
      await ipfsManager.start()

      const fil = Buffer.from('fffffffffffffffffffffff')
      // auth
      await result.did.authenticate()
      const cid = await ipfsManager.addSignedObject(fil, {
        name: 'UnitTest.txt',
        contentType: 'text/text',
        lastModified: new Date(),
      })
      expect(cid.length).toBeGreaterThan(0)

      const res = await ipfsManager.getObject(cid)
      expect(res.value.name).toEqual('UnitTest.txt')
    })

    it.skip('when adding a signed and encrypted DID/IPLD object , should fetch and return uploaded data', async function () {
      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletAId = await wallet.addWallet()
      const walletBId = await wallet.addWallet()

      const did = await wallet.createEd25519({
        walletId: walletAId
      })
      const didBob = await wallet.createEd25519({
        walletId: walletBId
      })

      const ipfsManager = new IPLDManager(did.did)
      await ipfsManager.start()

      // auth
      await did.did.authenticate()
      await didBob.did.authenticate()
      // Alice encrypts, and both Alice and Bob can decrypt
      const enc = await ipfsManager.encryptObject('Hola Mundo !!!', [
        didBob.did.id,
      ])

      // const cid = await ipfsManager.addSignedObject(Buffer.from(enc.toString()), {
      //   name: 'UnitTestEnc.txt',
      //   contentType: 'text/text',
      //   lastModified: new Date(),
      // })
      // expect(cid.length).to.be.above(0)
      const res = await ipfsManager.decryptObject(didBob.did, enc.toString(), {})
      expect(res.cleartext).toEqual('Hola Mundo !!!')
    })

    it('when adding a signed and encrypted DID/IPLD object , should failed decrypting if not allowed', async function () {
      let acct = await wallet.getAccount()
      // add wallet with no mnemonic
      const walletAId = await wallet.addWallet()
      const walletBId = await wallet.addWallet()

      const walletProviderAlice = await wallet.createES256K({
        walletId: walletAId
      })
      const walletProviderBob = await wallet.createES256K({
        walletId: walletBId
      })

      const ipfsManager = new IPLDManager(walletProviderAlice.did)
      await ipfsManager.start()
      const message = await walletProviderAlice.secureMessage.encrypt(
        walletProviderBob.publicKey,
        Buffer.from('Hola Mundo Secreto!'),
      )

      const plaintext = await walletProviderBob.secureMessage.decrypt(message)

      expect(plaintext).toEqual('Hola Mundo Secreto!')
    })
  })
})
