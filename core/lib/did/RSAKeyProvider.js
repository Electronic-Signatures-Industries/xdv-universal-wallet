"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSAProvider = exports.RSAKeyGenerator = exports.encodeDID = void 0;
const tslib_1 = require("tslib");
// https://github.com/ceramicnetwork/key-did-provider-ed25519/blob/master/src/index.ts
// cidv1	ipld	0x01	permanent	CIDv1
const CID = require('cids');
const NodeRSA = require('node-rsa');
const did_jwt_rsa_1 = require("did-jwt-rsa");
const fast_json_stable_stringify_1 = tslib_1.__importDefault(require("fast-json-stable-stringify"));
const rsa = tslib_1.__importStar(require("@digitalbazaar/rsa-verification-key-2018"));
const rpc_utils_1 = require("rpc-utils");
const SmartcardSigner_1 = require("./SmartcardSigner");
const B64 = 'base64pad';
function toStableObject(obj) {
    return JSON.parse(fast_json_stable_stringify_1.default(obj));
}
function encodeDID(publicKey, privateKey) {
    const ldSig = new rsa.RsaVerificationKey2018({
        privateKeyPem: privateKey,
        publicKeyPem: publicKey,
    });
    return `did:key:${ldSig.fingerprint()}`;
}
exports.encodeDID = encodeDID;
function toGeneralJWS(jws) {
    const [protectedHeader, payload, signature] = jws.split('.');
    return {
        payload,
        signatures: [{ protected: protectedHeader, signature }],
    };
}
const sign = async (payload, did, secretKey, isPIN, protectedHeader = {}) => {
    const kid = `${did}#${did.split(':')[2]}`;
    const signer = (await SmartcardSigner_1.RSASigner(secretKey, isPIN));
    const header = toStableObject(Object.assign(protectedHeader, { kid, alg: 'RS256' }));
    const jws = did_jwt_rsa_1.createJWS(toStableObject(payload), signer, header);
    return jws;
};
///@ts-ignore
const didMethods = {
    did_authenticate: async ({ did, secretKey, isPIN }, params) => {
        const response = await sign({
            did,
            iss: did,
            aud: params.aud,
            nonce: params.nonce,
            paths: params.paths,
            exp: Math.floor(Date.now() / 1000) + 600, // expires 10 min from now
        }, did, secretKey, isPIN);
        return toGeneralJWS(response);
    },
    did_createJWS: async ({ did, secretKey, isPIN }, params) => {
        const requestDid = params.did.split('#')[0];
        if (requestDid !== did)
            throw new rpc_utils_1.RPCError(4100, `Unknown DID: ${did}`);
        const jws = await sign(params.payload, did, secretKey, isPIN, params.protected);
        return { jws: toGeneralJWS(jws) };
    },
    did_decryptJWE: async ({ secretKey }, params) => {
        // const decrypter = x25519Decrypter(convertSecretKeyToX25519(secretKey))
        // try {
        //   const bytes = await decryptJWE(params.jwe, decrypter)
        //   return { cleartext: u8a.toString(bytes, B64) }
        // } catch (e) {
        //  throw new RPCError(-32000, (e as Error).message)
        //}
        return null;
    },
};
/**
 * RSA key generator
 */
class RSAKeyGenerator {
    static createKeypair() {
        const key = new NodeRSA({ b: 2048 }).generateKeyPair();
        const publicDer = key.exportKey('pkcs8-public-der');
        const privateDer = key.exportKey('pkcs1-der');
        return {
            privateDer,
            publicDer,
            sign: key.sign,
            publicPem: key.exportKey('pkcs8-public-pem'),
            pem: key.exportKey(),
        };
    }
}
exports.RSAKeyGenerator = RSAKeyGenerator;
/**
 * RSA DID Key Provider
 */
class RSAProvider {
    constructor(pub, pem, pin) {
        const did = encodeDID(pub, pem);
        const handler = rpc_utils_1.createHandler(didMethods);
        const isPIN = pin ? true : false;
        this._handle = async (msg) => handler({ did, secretKey: pem || pin, isPIN }, msg);
    }
    get isDidProvider() {
        return true;
    }
    async send(msg) {
        return await this._handle(msg);
    }
}
exports.RSAProvider = RSAProvider;
//# sourceMappingURL=RSAKeyProvider.js.map