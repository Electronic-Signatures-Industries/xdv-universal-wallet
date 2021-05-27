import { CAGOB } from './cagob.pem'
import { CARAIZ } from './caraiz.pem'
import { CAPC2 } from './capc2.pem'

import { DIDManager } from './DIDManager'
import { IPLDManager } from './IPLDManager'
import { fromDagJWS } from 'did-jwt-rsa/lib/utils'
import { X509Utils } from '../crypto'

async function bootstrap() {
  const didManager = new DIDManager()
  const didRSA = await didManager.create3ID_RSA()
  await didRSA.did.authenticate()
  const res = await didRSA.did.createDagJWS({
    test: 'Hello World',
  })
  console.log(res)
  console.log(didRSA.did.id)
}

async function printVerification(res: any, didRSA: any) {
  const decoded = fromDagJWS(res.jws).split('.')
  const data = `${decoded[0]}.${decoded[1]}`
  const sig = `${decoded[2]}`
  const report = await X509Utils.verifyChain(data, sig, didRSA.certificate, [
    CAGOB,
    CAPC2,
    CARAIZ,
  ])
  console.log(res, report)
  console.log(didRSA.did.id)
}

async function pkcs11() {
  const didManager = new DIDManager()
  const pin = '18586874'
  const didRSA = await didManager.create3ID_PKCS11(pin)
  await didRSA.did.authenticate()
  const res = await didRSA.did.createDagJWS({
    test: 'Hello World',
  })
  printVerification(res, didRSA)
  const ipfsManager = new IPLDManager(didRSA.did)
  await ipfsManager.start()

  const fil = Buffer.from('Hola IPFS World!')
  // auth
  const cid = await ipfsManager.addSignedObject(fil, {
    name: 'UnitTest.txt',
    contentType: 'text/html',
    lastModified: new Date(),
  })
  const res2 = await ipfsManager.get(cid)
  console.log(res2.value)
  printVerification({ jws: res2.value }, didRSA)
}

pkcs11()
