import Web3 from './Web3';

class ABI {
  constructor() {
  }

  getAbi(address) {
    for (let dex of Web3.getDexList()) {
      if (dex.address.toLowerCase() == address.toLowerCase()) {
        if (dex.abi) {
          return dex.abi;
        }
      }
    }
    return null;
  }
}

const helper = new ABI();
export default helper;