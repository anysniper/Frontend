import axios from 'axios';
import config from '../config';

class APIHelper {

  constructor() {
  }

  config() {
    return this.call('GET', 'config');
  }

  cancel(accounts) {
    return this.call('POST', 'cancel', {
      accounts
    });
  }

  // accounts: array of publick key to be used
  // if history is null, then use normal gas
  // if gasGwei is 0, then use normal gas
  // max supply is max wallet percent of total supply
  buy(accounts, history, contract, gasGwei, gasMultiplier, amount, maxSupply) {
    return this.call('POST', 'buy', {
      accounts,
      history,
      contract,
      gasGwei,
      gasMultiplier,
      amount,
      maxSupply
    });
  }

  // accounts: array of publick key to be used
  // if history is null, then use normal gas
  // if gasGwei is 0, then use normal gas
  // max supply is max wallet percent of total supply
  sell(accounts, history, contract, gasGwei, gasMultiplier, percent) {
    return this.call('POST', 'sell', {
      accounts,
      history,
      contract,
      gasGwei,
      gasMultiplier,
      percent
    });
  }

  call(method, endpoint, params) {
    let url = config.API_BASE_URL + '/' + endpoint;

    let args = {};

    if (method == 'POST') {
      args = {
        method: 'post',
        url,
        data: params,
        headers: { 'Content-Type': 'application/json' }
      }
    } else {
      url += '?' + (new URLSearchParams(params)).toString()
      args = {
        method: 'get',
        url,
        headers: { 'Content-Type': 'application/json' }
      }
    }
    return axios(args).then(response => {
      return response.data;
    });
  }
}

const helper = new APIHelper();
export default helper;