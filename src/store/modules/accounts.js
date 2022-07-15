import Vue from 'vue';
import Parse from "@/helpers/Parse";
// import Config from '@/config';
import Web3 from '@/helpers/Web3';
import Crypto from '@/helpers/Crypto';
import Utils from '@/helpers/Utils';
import Observer from '@/helpers/Observer';
import {E_NEW_ORDER} from "@/constants/events";

let timer = null;

let balances = {
}

async function logTx(token, contract, to, account, source, txResult, type) {
  // console.log(txResult);
  if (!txResult.status) {
    return;
  }
  let ethAmount = '0';
  let tokenAmount = '0';
  const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

  if (type == 'buy') {
    // eslint-disable-next-line no-undef
    ethAmount = BigInt(txResult.logs[0].data).toString();
    for (let log of txResult.logs) {
      // eslint-disable-next-line no-undef
      if (log.address.toLowerCase() == token.toLowerCase() && log.topics[0].toLowerCase() == transferTopic.toLowerCase()
        // && BigInt(log.topics[2]) == BigInt(account.get('address'))
      ) {
        // eslint-disable-next-line no-undef
        tokenAmount = BigInt(log.data).toString();
        break;
      }
    }
  } else {
    // for (let i = txResult.logs.length - 1; i >= 0; i--) {
    //   const log = txResult.logs[i];
    //   // eslint-disable-next-line no-undef
    //   if (log.address.toLowerCase() == Web3.getWETHAddress().toLowerCase() && log.topics.length == 2 && BigInt(log.topics[1]) == BigInt(to)) {
        // eslint-disable-next-line no-undef
        ethAmount = BigInt(txResult.logs[txResult.logs.length - 1].data).toString();
    //     break;
    //   }
    // }
    for (let log of txResult.logs) {
      // eslint-disable-next-line no-undef
      if (log.address.toLowerCase() == token.toLowerCase() && log.topics[0].toLowerCase() == transferTopic.toLowerCase() && BigInt(log.topics[1]) == BigInt(account.get('address'))) {
        // eslint-disable-next-line no-undef
        tokenAmount = BigInt(log.data).toString();
        break;
      }
    }
  }
  const Order = Parse.getClass('Order');
  const order = new Order();
  order.set('from', account.get('address'));
  order.set('owner', Web3.address);
  order.set('type', type);
  order.set('source', source);
  order.set('network', Web3.getNetwork().network);
  order.set('token0', Web3.getWETHAddress());
  order.set('token1', token);
  order.set('to', to);
  order.set('tx', txResult.transactionHash);
  order.set('ethAmount', ethAmount);
  order.set('token1Amount', tokenAmount);
  order.set('decimals', contract.get('decimals'));

  order.set('gasPrice', txResult.effectiveGasPrice);
  order.set('gasUsed', txResult.gasUsed);
  let gasFee = 0;
  try {
    // eslint-disable-next-line no-undef
    gasFee = (BigInt(txResult.effectiveGasPrice) * BigInt(txResult.gasUsed)).toString();
    
    order.set('gasFee', gasFee);
  // eslint-disable-next-line no-empty
  } catch (e) {
  }
  await order.save();

  // Updating Status
  const statusQuery = Parse.getQuery('Status');
  statusQuery.equalTo('network', Web3.getNetwork().network);
  statusQuery.equalTo('source', source);

  statusQuery.matches('from', account.get('address'), 'i');
  statusQuery.matches('owner', Web3.address, 'i');
  statusQuery.limit(1);
  const statuses = await statusQuery.find();
  let status;
  if (statuses.length > 0) {
    status = statuses[0];
  }
  if (!status) {
    const Status = Parse.getClass('Status');
    status = new Status();
    status.set('network', Web3.getNetwork().network);
    status.set('source', source);
    status.set('from', account.get('address'));
    status.set('owner', Web3.address);
    status.set('ethAmount', '0');
    status.set('gasFee', '0');
    status.set('numTx', 0);
  }
  if (type == 'buy') {
    status.set(
      'ethAmount', 
      // eslint-disable-next-line no-undef
      (BigInt(status.get('ethAmount')) - BigInt(ethAmount)).toString()
    );
  } else {
    status.set(
      'ethAmount', 
      // eslint-disable-next-line no-undef
      (BigInt(status.get('ethAmount')) + BigInt(ethAmount)).toString()
    );
  }
  status.set(
    'gasFee', 
    // eslint-disable-next-line no-undef
    (BigInt(status.get('gasFee')) + BigInt(gasFee)).toString()
  );
  status.increment("numTx");

  await status.save();
  Observer.$emit(E_NEW_ORDER, order);
}

async function getAmountInByPercent(token, account, amountIn) {
  let balance = 0;
  try {
    balance = balances[token][account.get('address')];
  } catch (e) {
    console.log(e);
  }
  // eslint-disable-next-line no-undef
  if (BigInt(balance) == BigInt(0)) {
    const contractHandler = Web3.getTokenContract(token);
    balance = await contractHandler.methods.balanceOf(account.get('address')).call();
    // eslint-disable-next-line no-undef
    if (BigInt(balance) == BigInt(0)) {
      throw new Error('Account balance is 0');
    }
  }
  // eslint-disable-next-line no-undef
  return BigInt(balance) * BigInt(parseInt(amountIn)) / BigInt(100);
}

async function getAmountOut(token, contract, isBuy, amountIn, slippage) {
  slippage = parseFloat(slippage);
  if (slippage == 0 || isNaN(slippage)) {
    return 0;
  }
  let amountOut = 0;
  const path = isBuy ? [
    Web3.getWETHAddress(),
    token
  ] : [
    token,
    Web3.getWETHAddress()
  ]
  try {
    amountOut = await contract.methods.getAmountsOut(amountIn, path).call();
  } catch (e) {
    console.log('Amount out fetch error', e);
    return 0;
  }
  // eslint-disable-next-line no-undef
  amountOut = BigInt(amountOut[1]) / BigInt(100 * 1000) * BigInt(parseInt((100 - slippage) * 1000));
  return Utils.formatBigInt(amountOut);
}

const state = {
  main: null,
  list: []
};
const getters = {
  list: (state) => {
    // TODO: remove main wallet per user choice
    // if (!Web3.getLevel().canSnipe()) {
      return [
        Web3.account,
        ...state.list
      ]
    // }
    // return state.list
  },
  main: (state) => state.main
};
const actions = {
  async fetch({commit, state}) {
    const Account = Parse.getClass('Account');
    let localAccounts = localStorage.getItem(`${Web3.getNetwork().network}-accounts`);
    if (localAccounts) {
      localStorage.setItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`, localAccounts);
      localStorage.removeItem(`${Web3.getNetwork().network}-accounts`);
    } else {
      localAccounts = localStorage.getItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`);
    }
    let accounts = [];
    try {
      const accountsJSON = JSON.parse(localAccounts);
      for (let account of accountsJSON) {
        if (typeof account.address == 'string') {
          accounts.push(new Account(account));
        }
      }
    } catch (e) {
      console.log('account fetch error', e);
    }

    // Account list on Database (ecnrypt / decrypt)

    // const query = Parse.getAccountQuery();
    // query.equalTo('user', Web3.address);
    // query.equalTo('network', Web3.getNetwork().network);
    // query.limit(30);
    // query.ascending("createdAt");
    // const accounts = await query.find();

    const list = [];
    for (let account of accounts) {
      try {
        account.pk = Crypto.decrypt(account.get('privateKey'), Web3.signature);
      } catch (e) {
        console.log('account error');
      }
      if (!account.pk || account.pk == '') {
        account.pk = account.get('privateKey');
      }
      list.push(account);
    }
    commit('SET', ['list', list]);

    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(() => {
      const setBalance = (account) => {
        Web3.getBalance(account.get('address')).then(balance => {
          // eslint-disable-next-line no-undef
          const ethBalance = BigInt(balance).toString();// parseInt(BigInt(balance) * BigInt(10 ** 5) / BigInt(10 ** 18)) / 10 ** 5;
          Vue.set(account, 'balance', ethBalance);
        })
      }

      for (let account of state.list) {
        setBalance(account);
      }
      // TODO: remove main wallet per user choice
      // if (!Web3.getLevel().canSnipe()) {
        setBalance(Web3.account);
      // }
      // if (state.main) {
      //   setBalance(state.main);
      // }
    }, 5000);
  },

  async create({commit, state}, {name, privateKey, isMain}) {
    const wallet = Web3.createAccount();
      
    const Account = Parse.getClass('Account');
    const account = new Account();
    account.set('user', Web3.address);
    account.set('name', name);
    account.set('network', Web3.getNetwork().network);
    let pk;
    if (privateKey != '') {
      const publicKey = Web3.web3.eth.accounts.privateKeyToAccount(privateKey);
      account.set('address', publicKey.address);
      pk = privateKey;
      
    } else {
      account.set('address', wallet.address);
      pk = wallet.privateKey;
    }
    account.pk = pk;
    const encrypted = Crypto.encrypt(pk, Web3.signature);
    account.set('privateKey', encrypted);
    account.set('isMain', isMain);
    // await account.save();

    if (isMain) {
      commit('SET', ['main', account]);
    } else {
      commit('PUSH', ['list', account]);
    }

    localStorage.setItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`, JSON.stringify(state.list.map(account => account.attributes)));
  },

  // eslint-disable-next-line no-empty-pattern
  async edit({state}, {account, fields}) {
    Object.keys(fields).map(key => {
      account.set(key, fields[key]);
    })
    // await account.save();
    localStorage.setItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`, JSON.stringify(state.list.map(account => account.attributes)));
  },

  async delete({commit, state}, account) {
    // await account.destroy();
    if (account.get('isMain')) {
      // commit('SET', ['main', null]);
      return;
    } else {
      commit('SET', ['list', state.list.filter(acc => {
        return acc.get('address').toLowerCase() != account.get('address').toLowerCase();
      })]);
    }
    localStorage.setItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`, JSON.stringify(state.list.map(account => account.attributes)));
  },

  // eslint-disable-next-line no-empty-pattern
  async getEscrowBalance({}, address) {
    return await Web3.getEscrowBalance(address);
  },

  // eslint-disable-next-line no-empty-pattern
  async escrowDeposit({}, amountInEth) {
    const contract = Web3.getEscrowContract();
    await contract.methods.deposit().send({
      // eslint-disable-next-line no-undef
      value: Utils.formatBigInt(BigInt(amountInEth * 10 ** 18)),
      from: Web3.address
    })
  },
  // eslint-disable-next-line no-empty-pattern
  async escrowWithdraw({}, {to, amount}) {
    const contract = Web3.getEscrowContract();
    await contract.methods.withdraw(
      to,
      // eslint-disable-next-line no-undef
      Utils.formatBigInt(BigInt(amount * 10 ** 18))
    ).send({
      from: Web3.address
    });
  },
  // eslint-disable-next-line no-empty-pattern
  async getGasPrice({}) {
    return await Web3.getGasPrice();
  },
  // eslint-disable-next-line no-empty-pattern
  async test({}, {account}) {
    const balance = await Web3.getBalance(account.get('address'));
    // eslint-disable-next-line no-undef
    if (BigInt(balance) < BigInt(0.01 * 10 ** 18)) {
      throw new Error('Insufficient balance');
    }
  },
  // eslint-disable-next-line no-empty-pattern
  async buy({}, {account, factory, contract, router, isOriginalRouter, token, amountIns, maxOuts, config, isCheckTx, slippage}) {
    let to, tx;

    if (isOriginalRouter) {
      to = router;
      const routerContract = Web3.getUniswapV2Contract(router);
      const amountOut = await getAmountOut(token, routerContract, true, amountIns[0], slippage);
      // eslint-disable-next-line no-undef
      if (BigInt(maxOuts[0]) == BigInt(0)) {
        tx = routerContract.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
          amountOut,
          [
            Web3.getWETHAddress(),
            token
          ],
          account.get('address'),
          new Date().getTime()
        )
      } else {
        tx = routerContract.methods.swapETHForExactTokens(
          amountOut,
          [
            Web3.getWETHAddress(),
            token
          ],
          account.get('address'),
          new Date().getTime()
        )
      }
    } else {
      const routerContract = Web3.getAggregatorContract();
      to = Web3.getAggregatorAddress();
      tx = routerContract.methods.multicall(
        Web3.getWETHAddress(),
        token, 
        [account.get('address')], 
        amountIns, 
        maxOuts,
        factory,
        true,
        false,
        []
      );
    }
    if (isCheckTx) {
      const data = tx.encodeABI();
      const gasLimit = await Web3.estimateGasLimit({
        from: account.get('address'),
        to,
        value: amountIns[0],
        data
      })
      // eslint-disable-next-line no-undef
      config.gas = Utils.formatBigInt(BigInt(gasLimit) + BigInt(150000));
    }

    const options = {
      from: account.get('address'),
      to,
      value: amountIns[0],
      ...config
    };

    let source = 'wallet';

    let txResult;

    if (!Web3.getLevel().canSnipe()
    || (Web3.address.toLowerCase() == account.get('address').toLowerCase()
    && !account.pk)) {
      txResult = await tx.send(options);
    } else {
      source = 'account';
      txResult = await Web3.send(tx, account.pk, options)
    }

    logTx(token, contract, to, account, source, txResult, 'buy');
  },
  // eslint-disable-next-line no-empty-pattern
  async sellTest({}, {account, factory, router, isOriginalRouter, token, amountIns, isPercent, slippage}) {
    let to, tx;

    if (isOriginalRouter) {
      to = router;
      const contract = Web3.getUniswapV2Contract(router);
      // eslint-disable-next-line no-undef
      let amountIn = BigInt(amountIns[0]);
      if (isPercent) {
        amountIn = await getAmountInByPercent(token, account, amountIn);
      }
      amountIn = Utils.formatBigInt(amountIn);
      
      const amountOut = await getAmountOut(token, contract, false, amountIn, slippage);

      tx = contract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn,
        amountOut,
        [
          token,
          Web3.getWETHAddress()
        ],
        account.get('address'),
        new Date().getTime()
      )
    } else {
      to = Web3.getAggregatorAddress();
      const contract = Web3.getAggregatorContract();
      tx = contract.methods.multicall(
        token, 
        Web3.getWETHAddress(),
        [account.get('address')], 
        amountIns, 
        [0],
        factory,
        false,
        isPercent,
        []
      )
    }

    const data = tx.encodeABI();
    await Web3.estimateGasLimit({
      from: account.get('address'),
      to,
      value: 0,
      data
    })
  },
  // eslint-disable-next-line no-empty-pattern
  async sell({}, {account, token, contract, factory, router, isOriginalRouter, amountIns, isPercent, config, isCheckTx, slippage}) {
    let to, tx;

    let amountIn = amountIns[0];

    if (isOriginalRouter) {
      to = router;
      const routerContract = Web3.getUniswapV2Contract(router);
      // eslint-disable-next-line no-undef
      amountIn = BigInt(amountIns[0]);
      if (isPercent) {
        amountIn = await getAmountInByPercent(token, account, amountIn);
      }
      amountIn = Utils.formatBigInt(amountIn);      
      const amountOut = await getAmountOut(token, routerContract, false, amountIn, slippage);

      tx = routerContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn,
        amountOut,
        [
          token,
          Web3.getWETHAddress()
        ],
        account.get('address'),
        new Date().getTime()
      )
    } else {
      to = Web3.getAggregatorAddress();
      const routerContract = Web3.getAggregatorContract();
      tx = routerContract.methods.multicall(
        token, 
        Web3.getWETHAddress(),
        [account.get('address')], 
        amountIns, 
        [0],
        factory,
        false,
        isPercent,
        []
      )
    }

    if (isCheckTx) {
      const data = tx.encodeABI();
      const gasLimit = await Web3.estimateGasLimit({
        from: account.get('address'),
        to,
        value: 0,
        data
      })
      // eslint-disable-next-line no-undef
      config.gas = Utils.formatBigInt(BigInt(gasLimit) + BigInt(100000));
    }
    
    const options = {
      from: account.get('address'),
      to,
      value: 0,
      ...config
    };

    let source = 'wallet';
    let txResult;

    if (!Web3.getLevel().canSnipe() 
      || (Web3.address.toLowerCase() == account.get('address').toLowerCase()
          && !account.pk)) {
      txResult = await tx.send(options);
    } else {
      source = 'account';
      txResult = await Web3.send(tx, account.pk, options)
    }

    logTx(token, contract, to, account, source, txResult, 'sell');
  },
  // eslint-disable-next-line no-empty-pattern
  async copy({}, {token, contract, account, to, config, value, input, isBuy}) {
    const options = {
      ...config,
      from: account.get('address'),
      to,
      value,
      data: input,
    };
    // console.log(account.pk);
    const txResult = await Web3.send(null, account.pk, options);
    logTx(token, contract, to, account, 'account', txResult, isBuy ? 'buy' : 'sell');
  },
  // eslint-disable-next-line no-empty-pattern
  async allowance({}, {account, contract, router, isOriginalRouter}) {
    const contractHandler = Web3.getTokenContract(contract.get('address'));
    let addressToAllow = isOriginalRouter ? router : Web3.getRouterV2Address()
    return await contractHandler.methods.allowance(account.get('address'), addressToAllow).call();
  },
  // eslint-disable-next-line no-empty-pattern
  async approve({}, {account, contract, router, isOriginalRouter}) {
    // TODO: check if already approved
    let addressToAllow = isOriginalRouter ? router : Web3.getRouterV2Address()

    const contractHandler = Web3.getTokenContract(contract.get('address'));
    let totalSupply = contract.get('totalSupply');
    // eslint-disable-next-line no-undef
    if (BigInt(totalSupply) == BigInt(0)) {
      // eslint-disable-next-line no-undef
      totalSupply = BigInt(10 ** 18 * 10 ** 18);
    }
    const tx = contractHandler.methods.approve(
      addressToAllow,
      Utils.formatBigInt(totalSupply)
    );
    let gasPrice = await Web3.getGasPrice();
    // eslint-disable-next-line no-undef
    gasPrice = BigInt(gasPrice) * BigInt(150) / BigInt(100);

    const options = {
      from: account.get('address'),
      to: contract.get('address'),
      gas: 100000,
      value: 0,
      gasPrice: Utils.formatBigInt(gasPrice)
    };

    if (!Web3.getLevel().canSnipe() 
      || (Web3.address.toLowerCase() == account.get('address').toLowerCase()
          && !account.pk)
    ) {
      await tx.send(options);
      return;
    }

    await Web3.send(tx, account.pk, options)
  },
  // eslint-disable-next-line no-empty-pattern
  async cancel({}, {account, gasPrice}) {
    await Web3.send(null, account.pk, {
      from: account.get('address'),
      to: account.get('address'),
      value: 0,
      gas: 40000,
      gasPrice
    })
  },
  // eslint-disable-next-line no-empty-pattern
  async deposit({}, {recipients, amounts, totalAmount, isEscrow}) {
    // TODO: call web3 function to deposit
    // const contract = Web3.getEscrowContract();
    const contract = Web3.getAggregatorContract();
    let func = 'multiSendETH';
    amounts = amounts.map(amount => {
      return Utils.formatBigInt(amount * 10 ** 18)
    })
    let params = [recipients, amounts];
    const options = {
      from: Web3.address
    };
    totalAmount = Utils.formatBigInt(totalAmount * 10 ** 18);

    if (isEscrow) {
      func = 'multiWithdrawETH';
      params.push(totalAmount);
    } else {
      options['value'] = totalAmount;
    }
    await contract.methods[func](...params).send(options);
  },

  // eslint-disable-next-line no-empty-pattern
  async withdraw({}, {account, to, amount}) {
    // eslint-disable-next-line no-undef
    const balance = BigInt(await Web3.getBalance(account.get('address')));
    const gasLimit = await Web3.estimateGasLimit({
      from: account.get('address'),
      to,
      value: Utils.formatBigInt(amount * 10 ** 18)
    })
    const gasPrice = await Web3.getGasPrice();
    // eslint-disable-next-line no-undef
    const totalGas = BigInt(gasPrice) * BigInt(gasLimit);
    // eslint-disable-next-line no-undef
    amount = BigInt(amount * 10 ** 18);
    if (balance - totalGas < amount) {
      amount = balance - totalGas;
    }
    await Web3.send(null, account.pk, {
      from: account.get('address'),
      to,
      value: Utils.formatBigInt(amount),
      gas: gasLimit,
      gasPrice
    })
  },
  // eslint-disable-next-line no-empty-pattern
  async getTokenBalance({}, {account, contract}) {
    const token = contract.get('address');
    const balance = await Web3.getTokenBalance(token, account.get('address'));
    if (!balances[token]) {
      balances[token] = {}
    }
    balances[token][account.get('address')] = balance;
    return balance;
  }
};
const mutations = {
  SET (state, [key, value]) {
    state[key] = value;
  },
  PUSH (state, [key, value]) {
    state[key].push(value);
  }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
