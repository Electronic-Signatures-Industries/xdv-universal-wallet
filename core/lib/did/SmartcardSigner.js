"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSASigner = void 0;
const tslib_1 = require("tslib");
const NodeRSA = require('node-rsa');
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const SmartcardConnector_1 = require("./SmartcardConnector");
/**
 * Simple RSA Signer
 * @param key
 * @returns
 */
async function RSASigner(pem, isPIN) {
    if (isPIN) {
        const sc = new SmartcardConnector_1.SmartCardConnectorPKCS11();
        await sc.connect();
        return async (data) => {
            return JSON.parse((await sc.signPromise('0', pem, (data))).signature);
        };
    }
    const keyImport = new NodeRSA(pem);
    return async (data) => base64url_1.default.encode(await keyImport.sign(data));
}
exports.RSASigner = RSASigner;
//# sourceMappingURL=SmartcardSigner.js.map