import { DIDManager } from './DIDManager'
import { IPLDManager } from './IPLDManager';

async function bootstrap() {
    const didManager = new DIDManager();
    const didRSA = await didManager.create3ID_RSA();
    await didRSA.did.authenticate();
    const res = await didRSA.did.createDagJWS({
        test: 'Hello World',
    });
    console.log(res);
    console.log(didRSA.did.id);
}


async function pkcs11() {
    const didManager = new DIDManager();
    const pin = '18586874'
    const didRSA = await didManager.create3ID_PKCS11(pin);
    await didRSA.did.authenticate();
    const res = await didRSA.did.createDagJWS({
        test: 'Hello World',
    });
    console.log(res);
    console.log(didRSA.did.id);
    const ipfsManager = new IPLDManager(didRSA.did)
    await ipfsManager.start()

    const fil = Buffer.from('Hola IPFS World!')
    // auth
    const cid = await ipfsManager.addSignedObject(fil, {
      name: 'UnitTest.txt',
      contentType: 'text/html',
      lastModified: new Date(),
    })
    const res2 = await ipfsManager.getObject(cid)
    console.log(cid, res2)

}


pkcs11();
