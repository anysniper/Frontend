const CryptoJS = require('crypto-js');

class Crypto {
  encrypt(text, password) {
    return CryptoJS.AES.encrypt(text, password).toString();
  }

  decrypt(encrypted, password) {
    const bytes = CryptoJS.AES.decrypt(encrypted, password);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }
}

export default new Crypto();