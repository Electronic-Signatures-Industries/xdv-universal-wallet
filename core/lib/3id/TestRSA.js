"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DIDManager_1 = require("./DIDManager");
const IPLDManager_1 = require("./IPLDManager");
async function bootstrap() {
    const didManager = new DIDManager_1.DIDManager();
    const didRSA = await didManager.create3ID_RSA();
    await didRSA.did.authenticate();
    const res = await didRSA.did.createDagJWS({
        test: 'Hello World',
    });
    console.log(res);
    console.log(didRSA.did.id);
}
async function pkcs11() {
    const didManager = new DIDManager_1.DIDManager();
    const pin = '18586874';
    const didRSA = await didManager.create3ID_PKCS11(pin);
    await didRSA.did.authenticate();
    const res = await didRSA.did.createDagJWS({
        test: 'Hello World',
    });
    console.log(res);
    console.log(didRSA.did.id);
    const ipfsManager = new IPLDManager_1.IPLDManager(didRSA.did);
    await ipfsManager.start();
    const fil = Buffer.from('Hola IPFS World!');
    // auth
    const cid = await ipfsManager.addSignedObject(fil, {
        name: 'UnitTest.txt',
        contentType: 'text/html',
        lastModified: new Date(),
    });
    const res2 = await ipfsManager.getObject(cid);
    console.log(cid, res2);
}
pkcs11();
//# sourceMappingURL=TestRSA.js.map