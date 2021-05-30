"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIDManager = void 0;
const tslib_1 = require("tslib");
const u8a = tslib_1.__importStar(require("uint8arrays"));
const _3id_connect_1 = require("3id-connect");
const key_did_provider_ed25519_1 = require("key-did-provider-ed25519");
const key_did_resolver_1 = tslib_1.__importDefault(require("key-did-resolver"));
const ethr_did_1 = tslib_1.__importDefault(require("ethr-did"));
const RSAKeyProvider_1 = require("../did/RSAKeyProvider");
const dids_1 = require("did-jwt-rsa/lib/dids");
const SmartcardConnector_1 = require("../did/SmartcardConnector");
const DID_LD_JSON = 'application/did+ld+json';
const DID_JSON = 'application/did+json';
const varint = require('varint');
const multibase = require('multibase');
/**
 * Manages DIDs
 */
class DIDManager {
    /**
     * Creates a did-ethr
     * using XDV
     */
    createEthrDID(address, ecKP, registry, rpcUrl) {
        const did = new ethr_did_1.default({
            privateKey: ecKP.getPrivate('hex'),
            address,
            registry,
            rpcUrl,
        });
        return did;
    }
    /**
     * Create 3ID
     * using XDV
     * @param kp RSA keypair
     */
    async create3ID_RSA(kp) {
        let keypair = RSAKeyProvider_1.RSAKeyGenerator.createKeypair();
        if (kp) {
            keypair = kp;
        }
        const provider = new RSAKeyProvider_1.RSAProvider(keypair.publicPem, keypair.pem);
        const did = new dids_1.DID({
            provider,
            resolver: this.rsaGetResolver(keypair.publicPem),
        });
        const issuer = () => ({
            signer: (data) => {
                return keypair.sign(data);
            },
            alg: 'RS256',
            did: did.id,
        });
        return {
            did,
            getIssuer: issuer,
        };
    }
    base64toPem(base64) {
        for (var result = "", lines = 0; result.length - lines < base64.length; lines++) {
            result += base64.substr(result.length - lines, 64) + "\n";
        }
        return "-----BEGIN PUBLIC KEY-----\n" + result + "-----END PUBLIC KEY-----";
    }
    /**
     * Create 3ID
     * using XDV
     * @param kp RSA keypair
     */
    async create3ID_PKCS11(pin) {
        const sc = new SmartcardConnector_1.SmartCardConnectorPKCS11();
        await sc.connect();
        const certs = await sc.getCerts('0', pin);
        const publicPem = this.base64toPem(certs.publicKey);
        const provider = new RSAKeyProvider_1.RSAProvider(publicPem, null, pin);
        const did = new dids_1.DID({
            provider,
            // @ts-ignore
            resolver: this.rsaGetResolver(publicPem),
        });
        return {
            did,
            certificate: certs.publicKey2
        };
    }
    // @molekilla, 2021
    // ==========================================================
    // Forked off ceramic network key-did-resolver npm package
    // ==========================================================
    rsaGetResolver(publicKeyPem) {
        function keyToDidDoc(publicKeyPem, pubKeyBytes, fingerprint) {
            const did = `did:key:${fingerprint}`;
            const keyId = `${did}#${fingerprint}`;
            return {
                id: did,
                verificationMethod: [
                    {
                        id: keyId,
                        type: 'RSAVerificationKey2018',
                        controller: did,
                        publicKeyBase58: u8a.toString(pubKeyBytes, 'base58btc'),
                        publicKeyPem,
                    },
                ],
                authentication: [keyId],
                assertionMethod: [keyId],
                capabilityDelegation: [keyId],
                capabilityInvocation: [keyId],
            };
        }
        async function resolve(did, parsed, resolver, options) {
            const contentType = options.accept || DID_JSON;
            const response = {
                didResolutionMetadata: { contentType },
                didDocument: null,
                didDocumentMetadata: {},
            };
            try {
                const multicodecPubKey = multibase.decode(parsed.id);
                const pubKeyBytes = multicodecPubKey.slice(varint.decode.bytes);
                const doc = keyToDidDoc(publicKeyPem, pubKeyBytes, parsed.id);
                if (contentType === DID_LD_JSON) {
                    doc['@context'] = 'https://w3id.org/did/v1';
                    response.didDocument = doc;
                }
                else if (contentType === DID_JSON) {
                    response.didDocument = doc;
                }
                else {
                    delete response.didResolutionMetadata.contentType;
                    response.didResolutionMetadata.error = 'representationNotSupported';
                }
            }
            catch (e) {
                response.didResolutionMetadata.error = 'invalidDid';
                response.didResolutionMetadata.message = e.toString();
            }
            return response;
        }
        return {
            key: resolve,
        };
    }
    /**
     * Create 3ID
     * using XDV
     * @param edDSAKeyPair EdDSA keypair
     */
    async create3ID_Ed25519(edDSAKeyPair) {
        let seed = edDSAKeyPair.getSecret().slice(0, 32);
        const provider = new key_did_provider_ed25519_1.Ed25519Provider(seed);
        const did = new dids_1.DID({
            provider,
            resolver: key_did_resolver_1.default.getResolver(),
        });
        const issuer = () => ({
            signer: (data) => {
                return edDSAKeyPair.sign(data).toHex();
            },
            alg: 'Ed25519',
            did: did.id,
        });
        return {
            did,
            getIssuer: issuer,
        };
    }
    /**
     * Create 3ID
     * using XDV
     * @param address address
     * @param ecKeyPair ECDSA key pair
     * @param web3provider Web3 Provider
     */
    async create3IDWeb3(address, ecKeyPair, web3provider, registry) {
        const threeid = new _3id_connect_1.ThreeIdConnect();
        const authProvider = new _3id_connect_1.EthereumAuthProvider(web3provider, address);
        await threeid.connect(authProvider);
        const did = new dids_1.DID({
            provider: (await threeid.getDidProvider()),
            resolver: key_did_resolver_1.default.getResolver(),
        });
        const issuer = new ethr_did_1.default({
            privateKey: ecKeyPair.getPrivate('hex'),
            address,
            web3: web3provider,
            registry,
        });
        return {
            did,
            issuer,
        };
    }
    /**
     * Create 3ID Web3 External
     * using XDV
     * @param address address
     * @param ecKeyPair ECDSA key pair
     * @param web3provider Web3 Provider
     */
    async create3IDWeb3External(web3provider, address) {
        const threeid = new _3id_connect_1.ThreeIdConnect();
        const authProvider = new _3id_connect_1.EthereumAuthProvider(web3provider, address);
        await threeid.connect(authProvider);
        const did = new dids_1.DID({
            provider: (await threeid.getDidProvider()),
            resolver: key_did_resolver_1.default.getResolver(),
        });
        return {
            did,
            issuer: null,
        };
    }
}
exports.DIDManager = DIDManager;
//# sourceMappingURL=DIDManager.js.map