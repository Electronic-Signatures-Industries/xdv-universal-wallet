"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSASCSigner = exports.RSASigner = void 0;
const tslib_1 = require("tslib");
const NodeRSA = require('node-rsa');
const base64url_1 = tslib_1.__importDefault(require("base64url"));
/**
 * Simple RSA Signer
 * @param key
 * @returns
 */
function RSASigner(pem) {
    const keyImport = new NodeRSA(pem);
    return async (data) => base64url_1.default.encode(await keyImport.sign(data));
}
exports.RSASigner = RSASigner;
//  TODO
/**
 * Smartcard RSA Signer
 * @param key
 * @returns
 */
async function RSASCSigner(key) {
    const keyImport = new NodeRSA();
    const rsa = keyImport.importKey(key);
    return async (data) => base64url_1.default.encode(await rsa.sign(data));
}
exports.RSASCSigner = RSASCSigner;
//# sourceMappingURL=SmartcardSigner.js.map