import { DIDManager } from './DIDManager'

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
}


pkcs11();