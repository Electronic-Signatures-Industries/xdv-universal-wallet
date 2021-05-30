"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cagob_pem_1 = require("./cagob.pem");
const caraiz_pem_1 = require("./caraiz.pem");
const capc2_pem_1 = require("./capc2.pem");
const DIDManager_1 = require("./DIDManager");
const IPLDManager_1 = require("./IPLDManager");
const utils_1 = require("did-jwt-rsa/lib/utils");
const crypto_1 = require("../crypto");
async function bootstrap() {
    const didManager = new DIDManager_1.DIDManager();
    const pin = '18586874';
    const didRSA = await didManager.create3ID_PKCS11(pin);
    await didRSA.did.authenticate();
    const res = await didRSA.did.createDagJWS({
        test: 'Hello World',
    });
    const ipfsManager = new IPLDManager_1.IPLDManager(didRSA.did);
    await ipfsManager.start(`http://ifesa.ipfs.pa:5001`);
    const alice = Buffer.from('Hola Alice!');
    const links = [];
    // Alice
    let cid = await ipfsManager.addSignedObject(alice, {
        name: 'alice.txt',
        contentType: 'text/html',
        lastModified: new Date(),
    });
    links.push(cid);
    const bob = Buffer.from('Hola IPFS World!');
    // Bob
    let cid2 = await ipfsManager.addSignedObject(bob, {
        name: 'bob.txt',
        contentType: 'text/html',
        lastModified: new Date(),
    });
    links.push(cid2);
    let cid3 = await ipfsManager.addSignedObject(Buffer.from('Alice and Bob linked data'), {
        info: 'Alice and Bob linked data',
        links
    });
    console.log(cid3);
    console.log(didRSA.did.id);
}
async function printVerification(res, didRSA) {
    const decoded = utils_1.fromDagJWS(res.jws).split('.');
    const data = `${decoded[0]}.${decoded[1]}`;
    const sig = `${decoded[2]}`;
    const report = await crypto_1.X509Utils.verifyChain(data, sig, didRSA.certificate, [
        cagob_pem_1.CAGOB,
        capc2_pem_1.CAPC2,
        caraiz_pem_1.CARAIZ,
    ]);
    console.log(res, report);
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
    printVerification(res, didRSA);
    const ipfsManager = new IPLDManager_1.IPLDManager(didRSA.did);
    await ipfsManager.start(`https://ifesa.ipfs.pa:5001`);
    const fil = Buffer.from('Hola IPFS World!');
    // auth
    const cid = await ipfsManager.addSignedObject(fil, {
        name: 'UnitTest.txt',
        contentType: 'text/html',
        lastModified: new Date(),
    });
    const res2 = await ipfsManager.get(cid.toString());
    console.log(res2.value);
    printVerification({ jws: res2.value }, didRSA);
}
bootstrap();
//# sourceMappingURL=TestRSA.js.map