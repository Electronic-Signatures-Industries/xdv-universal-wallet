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


bootstrap();