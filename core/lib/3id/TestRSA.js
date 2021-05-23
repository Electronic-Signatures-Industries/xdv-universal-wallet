"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DIDManager_1 = require("./DIDManager");
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
bootstrap();
//# sourceMappingURL=TestRSA.js.map