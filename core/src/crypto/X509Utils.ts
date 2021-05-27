import r from 'jsrsasign'
import forge from 'node-forge'
export class X509Utils {
  static async verifyChain(
    data: Uint8Array,
    sig: Uint8Array,
    certificate: any,
    certificateChain: [any],
  ) {
    const caStore = forge.pki.createCaStore(certificateChain)
    // RSA signature generation
    const rsa = new r.Signature({ alg: 'SHA256withRSA' })
    const pub = caStore.listAllCertificates()[3]
    rsa.init(certificate)
    rsa.updateHex(data)
    const isValid = rsa.verify(Buffer.from(sig).toString('hex'))

    const c = forge.pki.certificateFromPem(certificate)

    return new Promise((resolve, reject) => {
      forge.pki.verifyCertificateChain(caStore, [c], (vfd, depth, chain) => {
        const verificationReport = []

        const subjectCert = chain[0]
        if (isValid && subjectCert) {
          verificationReport.push({
            title: `Verified document`,
            subtitle: `Signed by ${subjectCert.subject.attributes[3].value}`,
          })
          verificationReport.push({
            title: `Name`,
            subtitle: `C=${subjectCert.subject.attributes[0].value}, O=${subjectCert.subject.attributes[1].value},
                OU=${subjectCert.subject.attributes[2].value}, CN=${subjectCert.subject.attributes[3].value}`,
          })
        } else {
          verificationReport.push({
            isError: true,
            title: `Document verification incomplete`,
          })
        }
        const vsubject = subjectCert.verifySubjectKeyIdentifier()
        if (vsubject && isValid) {
          const subjectKeyId = forge.pki.getPublicKeyFingerprint(
            subjectCert.publicKey,
            {
              type: 'SubjectPublicKeyInfo',
              encoding: 'hex',
              delimiter: ':',
            },
          )
          verificationReport.push({
            title: `Verified subject key identifier`,
            subtitle: `${subjectKeyId}`,
          })
        } else {
          verificationReport.push({
            isError: true,
            title: `Invalid subject key identifier`,
          })
        }
        if (vfd && vfd.indexOf('UnknownCertificateAuth') === -1) {
          verificationReport.push({
            title: `Verified certificate chain issued by`,
            subtitle: `C=${subjectCert.issuer.attributes[0].value}, O=${subjectCert.issuer.attributes[1].value},
                 CN=${subjectCert.issuer.attributes[2].value}`,
          })
        } else {
          verificationReport.push({
            isError: true,
            title: `Invalid certificate chain`,
          })
        }
        resolve(verificationReport)
      })
    })
  }
}
