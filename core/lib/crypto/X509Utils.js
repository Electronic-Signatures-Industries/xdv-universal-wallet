"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X509Utils = void 0;
const tslib_1 = require("tslib");
const jsrsasign_1 = tslib_1.__importDefault(require("jsrsasign"));
const node_forge_1 = tslib_1.__importDefault(require("node-forge"));
class X509Utils {
    static async verifyChain(data, signature, certificate, certificateChain) {
        const caStore = node_forge_1.default.pki.createCaStore(certificateChain);
        // RSA signature generation
        const c = node_forge_1.default.pki.certificateFromPem(certificate);
        const pubKeyObj = jsrsasign_1.default.KEYUTIL.getKey(certificate);
        const acceptField = { alg: [] };
        acceptField.alg = ['RS256', 'RS384', 'RS512',
            'PS256', 'PS384', 'PS512',
            'ES256', 'ES384', 'ES512'];
        const isValid = jsrsasign_1.default.jws.JWS.verify(`${data}.${signature}`, pubKeyObj, acceptField);
        return new Promise((resolve, reject) => {
            node_forge_1.default.pki.verifyCertificateChain(caStore, [c], (vfd, depth, chain) => {
                const verificationReport = [];
                const subjectCert = chain[0];
                if (isValid && subjectCert) {
                    verificationReport.push({
                        title: `Verified document`,
                        subtitle: `Signed by ${subjectCert.subject.attributes[3].value}`,
                    });
                    verificationReport.push({
                        title: `Name`,
                        subtitle: `C=${subjectCert.subject.attributes[0].value}, O=${subjectCert.subject.attributes[1].value},
                OU=${subjectCert.subject.attributes[2].value}, CN=${subjectCert.subject.attributes[3].value}`,
                    });
                }
                else {
                    verificationReport.push({
                        isError: true,
                        title: `Document verification incomplete`,
                    });
                }
                const vsubject = subjectCert.verifySubjectKeyIdentifier();
                if (vsubject && isValid) {
                    const subjectKeyId = node_forge_1.default.pki.getPublicKeyFingerprint(subjectCert.publicKey, {
                        type: 'SubjectPublicKeyInfo',
                        encoding: 'hex',
                        delimiter: ':',
                    });
                    verificationReport.push({
                        title: `Verified subject key identifier`,
                        subtitle: `${subjectKeyId}`,
                    });
                }
                else {
                    verificationReport.push({
                        isError: true,
                        title: `Invalid subject key identifier`,
                    });
                }
                if (vfd) {
                    verificationReport.push({
                        title: `Verified certificate chain issued by`,
                        subtitle: `C=${subjectCert.issuer.attributes[0].value}, O=${subjectCert.issuer.attributes[1].value},
                 CN=${subjectCert.issuer.attributes[2].value}`,
                    });
                }
                else {
                    verificationReport.push({
                        isError: true,
                        title: `Invalid certificate chain`,
                    });
                }
                resolve(verificationReport);
            });
        });
    }
}
exports.X509Utils = X509Utils;
//# sourceMappingURL=X509Utils.js.map