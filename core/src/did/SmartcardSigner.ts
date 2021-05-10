const nodeRSA = require('node-rsa');
export async function RSASmartcardSigner(
  key: Uint8Array,
): Promise<string> {
  const keyImport = new nodeRSA();
  const rsa = keyImport.importKey(key)
  return rsa.sign;
//  const signatureBytes = await call.to.your.HSM.backend(data)
//  return bytesToBase64url(signature)
}
