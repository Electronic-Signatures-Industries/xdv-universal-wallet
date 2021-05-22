import { DID, DIDProvider } from 'did-jwt-rsa/src/dids';

import { ec } from 'elliptic'
import EthrDID from 'ethr-did'
import { Ed25519Provider } from 'key-did-provider-ed25519'

const mockProvider: DIDProvider = new Ed25519Provider(new Uint8Array(32))

export class DIDManager {
  createEthrDID = jest.fn((
    address: string,
    ecKP: ec.KeyPair,
    registry: string,
    rpcUrl: string,
  ): EthrDID => {
    return new EthrDID({
      privateKey: ecKP.getPrivate('hex'),
      address,
      registry,
      rpcUrl,
    })
  })

  create3ID_Ed25519 = jest.fn().mockResolvedValue({
    did: new DID({ provider: mockProvider }),
    getIssuer: jest.fn()
  })

  create3IDWeb3 = jest.fn().mockResolvedValue({
    did: new DID({ provider: mockProvider }),
    getIssuer: jest.fn()
  })

  create3IDWeb3External = jest.fn().mockResolvedValue({
    did: new DID({ provider: mockProvider }),
    getIssuer: jest.fn()
  })
}