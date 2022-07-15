import Web3 from 'web3';
import Web3Helper from './Web3';
import axios from 'axios';
import ABIHelper from './ABI';
import ABI from '../constants/abi';

class Transaction {
  constructor() {
    this.abis = {};
    this.isLoading = {};
    this.details = {};
  }

  async getAbiFromSelector(selector) {
    if (this.isLoading[selector]) {
      return null;
    }
    this.isLoading[selector] = true;
    return axios.get(
      `https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`, 
      { 
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(async response => {
      const results = response.data.results;
      if (results.length > 0) {
        const result = results[0];
        const text = result.text_signature;
        const name = text.split('(')[0];
        const args = text.split('(')[1].split(')')[0].split(',');
        const abi = {
          "inputs": [],
          "name": name,
          "type": "function"
        }
        args.map((arg) => {
          if (arg != '') {
            abi.inputs.push({
                "name": arg,
                "type": arg
            });
          }
        });
        this.abis[selector] = abi;
        return abi;        
      }
      return null;
    });
  }

  getFunctionSelector(abiItem) {
    const args = abiItem.inputs.map(input => {
      return input.type
    }).join(',');
    const func = `${abiItem.name}(${args})`;
    const web3 = new Web3();
    return web3.eth.abi.encodeFunctionSignature(func);
  }

  parseFunctionArgs(abiItem, input) {
    const web3 = new Web3();
    const argInput = input.substring(10);
    const argTypes = abiItem.inputs.map(item => item.type);
    const argNames = abiItem.inputs.map(item => item.name);
    const parameters = web3.eth.abi.decodeParameters(
      argTypes, 
      argInput
    );
    const result = {};
    for (let i = 0; i < argTypes.length; i++) {
      result[argNames[i]] = parameters[i];
    }
    return result;
  }

  isWarn(history, accounts, details, warns) {
    if (details && details.method && details.method.indexOf('removeLiquidity') != -1) {
      return true;
    }

    if (details && details.selector && warns && warns.includes(details.selector)) {
      return true;
    }
    
    const transaction = history.get('data').transaction;
    const input = transaction.input.toLowerCase();
    for (let account of accounts) {
      if (
        input.indexOf(account.get('address').substring(2).toLowerCase()) != -1 
        && transaction.from.toLowerCase() != account.get('address').toLowerCase()
      ) {
        return true;
      }
    }
    return false;
  }

  getDetails(contract, history, isRaw) {
    const data = history.get('data');
    const transaction = data.transaction;
    const hash = transaction.hash;
    
    const id = `${hash}`;
    
    let abi;
    if (contract) {
      abi = Web3Helper.getAbi(contract.get('address'));
    } else {
      abi = ABIHelper.getAbi(transaction.to);
    }
    
    let details = {
      hash,
      status: transaction.status,
      value: (parseInt(transaction.value) / (10 ** 18)).toFixed(3)
    };

    const txSelector = transaction.input.substring(0, 10);

    if (data.contractCall) {
      this.details[id] = {
        ...details,
        method: data.contractCall.methodName,
        selector: txSelector,
        params: data.contractCall.params
      };
    } else {
      let method, params;
      
      if (!isRaw) {
        let isFound = false;
        if (abi && Array.isArray(abi)) {
          for (let item of abi) {
            if (item.type == 'function') {
              const selector = this.getFunctionSelector(item);
              if (txSelector == selector) {
                method = item.name;
                params = this.parseFunctionArgs(item, transaction.input);
                isFound = true;
                break;
              }
            }
          }
        }
        if (!isFound) {

          if (this.abis[txSelector]) {
            method = this.abis[txSelector].name;
            params = this.parseFunctionArgs(this.abis[txSelector], transaction.input);
          } else {
            this.getAbiFromSelector(txSelector);
          }
        }
      }
      this.details[id] = {
        ...details,
        input: transaction.input,
        method,
        selector: txSelector,
        params
      }
    }
    return this.details[id];
  }

  parseTransaction(transaction) {
    let input = transaction.input;
    if (input.substring(0, 10) == '0x5ae401dc') {
      // this is multicall proxy
      input = '0x' + input.substr(330) + '00000000';
    }
    console.log(input)
    const web3 = new Web3();
    for (let abi of ABI.TradingABI) {
      // console.log(input.substring(0, 10));
      if (input.substring(0, 10) == abi.selector) {
        const params = web3.eth.abi.decodeParameters(abi.inputs, '0x' + input.substr(10));
        return {
          params,
          abi
        };
      }
    }
    return null;
  }
}
export default new Transaction();