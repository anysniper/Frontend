import Web3 from 'web3';
class CopyTrade {
  constructor() {
    this.boughtTokens = [];
    this.buyProcessed = [];
    this.soldTokens = [];
    this.sellProcessed = [];
    this.processed = [];
  }

  setProcessed(tx, status) {
    this.processed.push(tx.toLowerCase() + '-' + status.toLowerCase());
  }

  hasProcessed(tx, status) {
    return this.processed.includes(tx.toLowerCase() + '-' + status.toLowerCase());
  }

  setBought(token) {
    this.boughtTokens.push(token.toLowerCase());
  }

  hasBought(token) {
    return this.boughtTokens.includes(token.toLowerCase());
  }

  setSold(token) {
    this.soldTokens.push(token.toLowerCase());
  }

  hasSold(token) {
    return this.soldTokens.includes(token.toLowerCase());
  }

  setBuyProcessed(token) {
    this.buyProcessed.push(token.toLowerCase());
  }

  hasBuyProcessed(token) {
    return this.buyProcessed.includes(token.toLowerCase());
  }

  setSellProcessed(token) {
    this.sellProcessed.push(token.toLowerCase());
  }

  hasSellProcessed(token) {
    return this.sellProcessed.includes(token.toLowerCase());
  }
  
  pad(num, size) {
    // eslint-disable-next-line no-undef
    num = BigInt(num).toString(16);
    while (num.length < size) num = "0" + num;
    return num;
  }

  fill(str, size) {
    while (str.length < size) str = str + "0";
    return str;
  }

  getInput({input, selector, args, abi, index}) {
    const web3 = new Web3();
    const params = [];
    let value = 0;

    for (let i = 0; i <= 5; i++) {
      for (let key in index) {
        if (index[key] === i && key != 'isExact') {
          if (i == 0) {
            value = args[key];
          } else {
            params.push(args[key]);
          }
          break;
        }
      }
    }
    const inputParams = web3.eth.abi.encodeParameters(abi, params);
    let finalInput = selector + inputParams.substr(2);

    if (index.deadline == -1) {
      let newInput = input.substr(0, 10) + this.pad(args['deadline'], 64) + input.substring(74, input.indexOf(selector.substr(2)));
      newInput += finalInput.substr(2, input.length - newInput.length);

      finalInput = newInput;
      finalInput = this.fill(finalInput, input.length);
    }
    return {
      value,
      input: finalInput
    };
  }
}

const helper = new CopyTrade();
export default helper;