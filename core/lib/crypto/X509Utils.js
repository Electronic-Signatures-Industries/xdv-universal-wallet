"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X509Utils = void 0;
const tslib_1 = require("tslib");
const jsrsasign_1 = tslib_1.__importDefault(require("jsrsasign"));
const node_forge_1 = tslib_1.__importDefault(require("node-forge"));
class X509Utils {
    static async verifyChain(data, sig, certificate, certificateChain) {
        const caStore = node_forge_1.default.pki.createCaStore(certificateChain);
        // RSA signature generation
        const rsa = new jsrsasign_1.default.Signature({ alg: 'SHA256withRSA' });
        const pub = caStore.listAllCertificates()[3];
        rsa.init(certificate);
        rsa.updateHex(data);
        const isValid = rsa.verify(Buffer.from(sig).toString('hex'));
        const c = node_forge_1.default.pki.certificateFromPem(certificate);
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
                if (vfd && vfd.indexOf('UnknownCertificateAuth') === -1) {
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