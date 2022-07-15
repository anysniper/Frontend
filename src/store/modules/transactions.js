import Utils from "@/helpers/Utils";
import Web3 from '@/helpers/Web3';

const state = {
  config: {
    gasGWei: 0,
    blocks: 1,
    buyGasMultiplier: 1,
    buyFastGasMultiplier: 1.5,
    buyAmount: 0.1,
    maxSupply: 0,
    sellPercent: 100,
    sellGasMultiplier: 1,
    sellFastGasMultiplier: 1.5,
    cancelGasMultiplier: 1.5,

    // Buy Params
    buyOn: '',
    isBuyInstant: true,
    isSellOnWarn: true,
    factory: 0,
    copyRouters: [],

    isOriginalRouter: false,
    slippage: 0,
    warns: [],

    // Copy Trading Params
    isBuySameAmount: false,
    isSellSameAmount: true,
    isBuyOnce: false,
    sellThreshold: 0,

    // Gas Limit
    gasLimitETH: 0
  }
};
const getters = {
  config: (state) => state.config
};
const actions = {
  // eslint-disable-next-line no-empty-pattern
  async getConfig({state}, {action, type, history}) {
    if (!type) {
      type = 'normal';
    }
    // gas: gasLimit, value, gasPrice / (maxFeePerGas, maxPriorityFeePerGas)
    let gasPrice, maxFeePerGas, maxPriorityFeePerGas, gasLimit = 1000000;
    
    if (!history) {
      gasPrice = await Web3.getGasPrice();
      maxFeePerGas = 0;
      maxPriorityFeePerGas = 0;
    } else {
      const data = history.get('data');
      gasPrice = data.transaction.gasPrice;
      maxFeePerGas = data.transaction.maxFeePerGas;
      maxPriorityFeePerGas = data.transaction.maxPriorityFeePerGas;
      if (maxFeePerGas && maxPriorityFeePerGas) {
        gasPrice = 0;
      } else {
        maxFeePerGas = 0;
        maxPriorityFeePerGas = 0;
      }
    }

    if (!maxFeePerGas && !maxPriorityFeePerGas && !gasPrice) {
      gasPrice = await Web3.getGasPrice();
    }

    let gasGWei = parseFloat(state.config.gasGWei), gasMultiplier;
    if (type == 'frontrun') {
      gasMultiplier = parseFloat(state.config[action + 'FastGasMultiplier']);
    } else if (type == 'backrun' && history) {
      gasGWei = 0;
      gasMultiplier = 1;
    } else {
      gasMultiplier = parseFloat(state.config[action + 'GasMultiplier']);
    }

    if (gasGWei) {
      // eslint-disable-next-line no-undef
      gasPrice = BigInt(gasGWei) * BigInt(10 ** 9);
      maxFeePerGas = 0;
      maxPriorityFeePerGas = 0;
    } else if (gasMultiplier != 1) {
      if (gasPrice) {
        // eslint-disable-next-line no-undef
        gasPrice = BigInt(gasPrice) * BigInt(parseInt(gasMultiplier * 100)) / BigInt(100)
      } else {
        // eslint-disable-next-line no-undef
        maxFeePerGas = BigInt(maxFeePerGas) * BigInt(parseInt(gasMultiplier * 100)) / BigInt(100);
        // eslint-disable-next-line no-undef
        maxPriorityFeePerGas = BigInt(maxPriorityFeePerGas) * BigInt(parseInt(gasMultiplier * 100)) / BigInt(100);
      }
    }

    const config = {
      gas: gasLimit
    };

    if (gasPrice) {
      config.gasPrice = Utils.formatBigInt(gasPrice);
    } else {
      config.maxFeePerGas = Utils.formatBigInt(maxFeePerGas);
      config.maxPriorityFeePerGas = Utils.formatBigInt(maxPriorityFeePerGas);
    }
    return config;
  },
};
const mutations = {
  SET (state, [key, value]) {
    state[key] = value;
  }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
