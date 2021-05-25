import { ethers } from 'ethers'
import { Wallet } from '../crypto/Wallet'
import moment from 'moment'

jest.mock('../3id/IPLDManager')
jest.mock('../3id/DIDManager')

let localStorage = {}

describe('DID specs', function () {
  let selectedWallet: Wallet
  let id = null
  let url = 'https://ropsten.infura.io/v3/79110f2241304162b087759b5c49cf99'
  beforeAll(async function () { })

  it.skip('when KYC onboarding should pay with blockchain and register to get verified', async function () {
    //Register Name, Email and Ether account
    const personalinfo = {
      name: 'John Doe',
      email: 'jd@gmail.com',
      account: '0x',
    }

    //Pay Services and return TX Hash

    const txhash = function payKYCService() {
      return '0xa'
    }
    const wallet = new Wallet()
    const passphrase = '1234'
    await wallet.initialize(passphrase);
    const result = await wallet.createES256K({
      passphrase,
      rpcUrl: url,
      accountName: ''
    })
    const sig = await result.did.createJWS({
      name: 'Personal Signing',
      txhash,
      timestamp: moment().unix(),
    })

    const sigEth = ethers.utils.splitSignature(sig.signatures[0].signature)

    // Create DID
    const resultCreated = await function registerDID() {
      // ecrecover
      return '0xb'
    }

    // Optional - create DID backup in Swarm
    expect(result.id.length).toBeGreaterThan(0)
  })

  it.skip('when change owner, should validate it is', async function () {
    //Register Name, Email and Ether account
    const personalinfo = {
      name: 'John Doe',
      email: 'jd@gmail.com',
      account: '0x',
    }

    //Pay Services and return TX Hash

    const txhash = function payKYCService() {
      return '0xa'
    }
    //API redirects to request Wallet signature

    const wallet = new Wallet()
    await wallet.initialize('1234');
    const result = await wallet.createES256K({
      passphrase: '1234',
      rpcUrl: url,
      accountName: ''
    })

    const payload = Buffer.from('PersonalSigning');
    const [e, res] = await wallet.sign('ES256K', result.id, payload)
    const sigEth = ethers.utils.splitSignature(res)

    // Create DID
    const resultCreated = await function registerDID({
      ...sigEth
    }) {
      // ecrecover
      return '0xb'
    }
    // Optional - create DID backup in Swarm

    // Change owner
    await result.did.changeOwner('0xc')

    // Add Delegate
    const since = moment().unix() + (60 * 60 * 1)
    await result.did.addDelegate('0xd', {
      delegateType: '',
      expiresIn: since,
    });
  })
})
///
