import Web3 from "web3";
import Vue from 'vue';
import WalletConnectProvider from "@walletconnect/web3-provider";
const { formatBytes32String, parseBytes32String } = require("ethers/lib/utils");

import Web3Modal from "web3modal";

import Parse from './Parse';
import Observer from "./Observer";
import store from "../store/index";
import {E_ACCOUNT_CHANGED, E_LOGIN, E_REJECT_SIGN, E_NEW_BLOCK, E_CHAIN_CHANGED} from "../constants/events";
import Config from "../config";
import Utils from "./Utils";

import ABI from "../constants/abi";

class Web3Helper {
  constructor() {
    this.web3 = null;
    this.account = {};
    this.address = null;
    this.balance = 0;
    this.timer = null;
    this.provider = null;
    this.subscription = null;
    this.chainId = null;
    this.sniperBalance = Utils.formatBigInt(0);
    this.sniperEthValue = Utils.formatBigInt(0);

    this.contracts = {};
    this.abis = {};
  }

  createAccount() {
    return this.web3.eth.accounts.create();
  }

  getLevel() {
    const whitelists = [
    ];

    const copyTradingWhitelists = [
    ];
    
    const funcs = {};
    funcs.isWhitelisted = () => whitelists.map(address => address.toLowerCase()).includes(this.address.toLowerCase());
    funcs.isCopyTradingWhitelisted = () => copyTradingWhitelists.map(address => address.toLowerCase()).includes(this.address.toLowerCase());
    
    funcs.canSnipe = () => {
      if (funcs.isWhitelisted()) {
        return true;
      }
      // eslint-disable-next-line no-undef
      if (BigInt(this.sniperEthValue) >= BigInt(Config.MIN_SNIPER_VALUE * 10 ** 18)) {
        return true;
      }
      return false;
    }

    funcs.canCopyTrade = () => {
      if (funcs.isCopyTradingWhitelisted()) {
        return true;
      }
      // eslint-disable-next-line no-undef
      if (BigInt(this.sniperEthValue) >= BigInt(Config.MIN_SNIPER_VALUE_FOR_COPY_TRADING * 10 ** 18)) {
        return true;
      }
      return false;
    }

    funcs.canUseAccount = () => {
      if (funcs.canSnipe()) {
        return true;
      }
      return false;
    }

    funcs.canSeeDetails = () => {
      if (funcs.isWhitelisted()) {
        return true;
      }
      // eslint-disable-next-line no-undef
      if (BigInt(this.sniperBalance) >= BigInt(Config.MIN_DETAILS_SNIPER_AMOUNT * 10 ** 18)) {
        return true;
      }
      return false;
    }

    funcs.canWatch = () => {
      if (funcs.canSnipe()) {
        return true;
      }
      return false;
    }

    funcs.canSetTpSl = () => {
      if (funcs.canSnipe()) {
        return true;
      }
      return false;
    }
    return funcs;
  }

  isAdmin() {
    const whitelist = [
    ];
    try {
      return this.address.toLowerCase() == Config.ADMIN.toLowerCase()
      || whitelist.map(address => address.toLowerCase()).includes(this.address.toLowerCase());
    } catch (e) {
      return false;
    }
  }

  async init() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: Config.INFURA_ID, // required
          rpc: {
            [Config.CHAIN_ID]: Config.RPC_URL
          },
        },
      }    
    };

    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions // required
    });

    const provider = await web3Modal.connect();

    this.provider = provider;
    this.web3 = new Web3(provider);

    this.initObserver();
    
    const accounts = await this.web3.eth.getAccounts();

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
      // console.log('Account changed', accounts);
      Observer.$emit(E_ACCOUNT_CHANGED, accounts);
    });
    
    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId) => {
      // console.log('Chain Changed', chainId);
      // eslint-disable-next-line no-undef
      // if (BigInt(chainId) != BigInt(Config.CHAIN_ID)) {
      //   this.switchNetwork();
      // }

      window.location.reload();
      this.chainId = parseInt(chainId);
      Observer.$emit(E_CHAIN_CHANGED, accounts);
    });
    
    // Subscribe to provider connection
    provider.on("connect", (info) => {
      console.log('Chain Connected', info.chainId);
    });
    
    // Subscribe to provider disconnection
    provider.on("disconnect", (error) => {
      console.log('Wallet Disconnected', error.code, error.message);
    });

    Observer.$emit(E_ACCOUNT_CHANGED, accounts);
  }

  async switchNetwork() {
    // eslint-disable-next-line no-undef
    const chainId = '0x' + BigInt(Config.CHAIN_ID).toString(16);
    if (this.isNetworkRequest) {
      return;
    }
    this.isNetworkRequest = true;
    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      // console.log('Switch Network Error', switchError);
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId,
              // chainName: Config.CHAIN_NAME,
              // nativeCurrency: {
              //   name: 'Snipe Network',
              //   symbol: 'SN',
              //   decimals: 18
              // },
              // blockExplorerUrls: ['https://explorer.anysnipers.com'],
              // rpcUrls: [Config.RPC_URL],
            }],
          });
        } catch (addError) {
          // handle "add" error
          // console.log('Add Network Error', addError);
        }
      }
      // handle other "switch" errors
    }
    this.isNetworkRequest = false;
  }

  initObserver() {
    Observer.$off(E_ACCOUNT_CHANGED);

    Observer.$on(E_ACCOUNT_CHANGED, async (accounts) => {
      this.address = accounts[0];
      this.chainId = parseInt(await this.web3.eth.net.getId())

      try {
        const signature = await this.web3.eth.personal.sign('anysniper_dapp', accounts[0]);
        this.signature = signature;
      } catch (e) {
        console.log(e);
        Observer.$emit(E_REJECT_SIGN);
        return;
      }

      this.balance = 0;
      await this.initAccount();
    })

  }

  initTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const handler = () => {
      this.updateBalance();
    };
    handler();
    // TODO: call setInterval if needed to update balance
    // this.timer = setInterval(handler, 5000);
  }

  async initAccount() {
    // localStorage.clear();
    // remove local storage for wallet connection issue
    localStorage.removeItem('Parse/sniper/currentUser');
    localStorage.removeItem('Parse/sniper/installationId');
    Parse.init(true);
    // console.log('Init Account', this.address);
    const User = Parse.getUserClass();
    const query = Parse.getQuery(User);
    query.equalTo('address', this.address.toLowerCase());
    let user = await query.find();
    if (user.length == 0) {
      user = new User({
        address: this.address.toLowerCase(),
        username: this.address.toLowerCase(),
        password: Config.PARSE_DEFAULT_PASSWORD
      });
      await user.save();
    } else {
      user = user[0];
    }

    // Subscribe to new blocks, used for buyOn setting
    this.web3.eth.clearSubscriptions();
    this.subscription = this.web3.eth.subscribe('newBlockHeaders', function(error, result){
      if (!error) {
        Observer.$emit(E_NEW_BLOCK, result.number);
        return;
      }
      console.error(error);
    })
    .on("connected", function(subscriptionId){
      console.log('connected', subscriptionId);
    })
    .on("data", function(blockHeader){
      console.log('block data', blockHeader);
    })
    .on("error", console.error);
    
    // unsubscribes the subscription
    this.subscription.unsubscribe(function(error, success){
      if (success) {
        console.log('Successfully unsubscribed!');
      }
    });  

    // Moved from E_LOGIN
    this.account = user;
    this.address = user.get('address');
    this.balance = 0;

    await Parse.getUserClass().logIn(this.address, Config.PARSE_DEFAULT_PASSWORD);

    store.commit('SET', ['account', user]);
    user.set('name', 'Wallet');
    Vue.set(user, 'balance', 0);
    this.initTimer();

    Observer.$emit(E_LOGIN, user);
  }

  bytes32(str) {
    return formatBytes32String(str);
  }

  parseBytes32(bytes) {
    return parseBytes32String(bytes);
  }

  isAddress(address) {
    return this.web3.utils.isAddress(address);
  }

  getNetwork() {
    const networks = {
      1: {
        network: 'main',
        title: 'ETH',
        currency: 'ETH',
        explorer: 'https://etherscan.io/',
        dextool: 'https://www.dextools.io/app/ether/pair-explorer/'
      },
      4: {
        network: 'rinkeby',
        title: 'RINKEBY',
        currency: 'ETH',
        explorer: 'https://rinkeby.etherscan.io/',
        dextool: 'https://www.dextools.io/app/ether/pair-explorer/'
      },
      56: {
        network: 'bsc-main',
        title: 'BSC',
        currency: 'BNB',
        explorer: 'https://bscscan.com/',
        dextool: 'https://www.dextools.io/app/bsc/pair-explorer/'
      },
      25: {
        network: null,
        cantWatch: true,
        title: 'CRO',
        currency: 'CRO',
        explorer: 'https://cronos.org/explorer',
        dextool: 'https://dexscreener.com/cronos/'
      }
    }
    // console.log(this.chainId);
    return networks[this.chainId];
  }

  async getBalance(address) {
    return this.web3.eth.getBalance(address);
  }

  async getTokenBalance(token, address) {
    const contractHandler = this.getTokenContract(token);
    const balance = await contractHandler.methods.balanceOf(address).call();
    return balance;
  }

  async getSniperBalance() {
    // const web3 = new Web3(new Web3.providers.HttpProvider(Config.MAINNET_RPC));
    const sniper = new this.web3.eth.Contract(ABI.TokenABI, Config.SNIPER_ADDRESS);
    const balance = await sniper.methods.balanceOf(this.address).call();
    
    if (balance == 0) {
      return [0, 0];
    }
    const router = new this.web3.eth.Contract(ABI.UniswapRouterABI, Config.MAINNET_UNI_ROUTER_ADDRESS);
    const amountOut = await router.methods.getAmountsOut(balance, [
      Config.SNIPER_ADDRESS,
      Config.MAINNET_WETH_ADDRESS
    ]).call()
    return [balance, amountOut[1]];
  }

  async getEscrowBalance(address) {
    if (!address) {
      address = this.address;
    }
    const contract = this.getEscrowContract();
    try {
      return await contract.methods.balanceOf(address).call();
    } catch (e) {
      return 0;
    }
  }

  async updateBalance() {
    // Uncomment this if you want to trigger auto switch network

    // const chainId = await this.web3.eth.net.getId()
    // eslint-disable-next-line no-undef
    // if (BigInt(chainId) != BigInt(Config.CHAIN_ID)) {
    //   await this.switchNetwork();
    //   console.log('network switch');
    //   return;
    // }

    // const tokenContract = this.getTokenContract();
    const balance = await this.web3.eth.getBalance(this.address);
    // const balance = await tokenContract.methods.balanceOf(this.address).call();
    this.balance = balance;
    store.commit('SET', ['balance', Utils.formatBalance(balance)]);
  }

  sign(address, nonce) {
    const message = this.web3.eth.accounts.hashMessage(`I am signing my one-time nonce: ${nonce}`);
    return this.web3.eth.sign(message, address);
  }

  getAbi(address) {
    return this.abis[address];
  }

  setAbi(address, abi) {
    return this.abis[address] = abi;
  }

  getTokenContract(address) {
    if (!address) {
      address = Config.SNIPER_ADDRESS;
    }
    return new this.web3.eth.Contract(ABI.TokenABI, address);
  }

  addDexList(dex) {
    const network = this.getNetwork();
    Config[`${network.title}_DEX_LIST`].push(dex);
  }

  getDexList() {
    const network = this.getNetwork();
    return Config[`${network.title}_DEX_LIST`];
  }

  getWETHAddress() {
    const network = this.getNetwork();
    return Config[`${network.title}_WETH_ADDRESS`];
  }

  getAggregatorAddress() {
    const network = this.getNetwork();
    return Config[`${network.title}_AGGREGATOR_ADDRESS`];
  }

  getEscrowAddress() {
    const network = this.getNetwork();
    return Config[`${network.title}_ESCROW_ADDRESS`];
  }

  getRouterAddress() {
    const network = this.getNetwork();
    return Config[`${network.title}_ROUTER_ADDRESS`];
  }

  getRouterV2Address() {
    const network = this.getNetwork();
    return Config[`${network.title}_ROUTER_V2_ADDRESS`];
  }

  getEscrowContract() {
    return new this.web3.eth.Contract(ABI.EscrowABI, this.getEscrowAddress());
  }

  getUniswapV2Contract(address) {
    return new this.web3.eth.Contract(ABI.UniswapRouterABI, address);
  }

  getAggregatorContract() {
    return new this.web3.eth.Contract(ABI.AggregatorABI, this.getAggregatorAddress());
  }

  getRouterV2Contract() {
    return new this.web3.eth.Contract(ABI.RouterV2ABI, this.getRouterV2Address());
  }

  getRouterContract() {
    return new this.web3.eth.Contract(ABI.RouterABI, this.getRouterAddress());
  }

  async decimals(address) {
    if (!address) {
      address = Config.SNIPER_ADDRESS;
    }
    const tokenContract = this.getTokenContract();
    return parseInt(await tokenContract.methods.decimals().call());
  }

  async getTokenDetails(address) {
    // console.log('getting contract details');
    const contract = this.getTokenContract(address);
    // console.log('contract', contract);
    if (this.contracts[address]) {
      return this.contracts[address];
    }

    const result = {};
    try {
      console.log('owner')
      result.owner = await contract.methods.owner().call();
      console.log(result.owner);
    } catch (e) {
      console.log(e);
    }
    try {
      console.log('total supply')
      result.totalSupply = await contract.methods.totalSupply().call();
      console.log(result.totalSupply);
    } catch (e) {
      console.log(e);
    }
    try {
      console.log('decimals')
      result.decimals = await contract.methods.decimals().call();
      console.log(result.decimals);
    } catch (e) {
      console.log(e);
    }
    try {
      console.log('name');
      result.name = await contract.methods.name().call();
      console.log(result.name);
    } catch (e) {
      console.log(e);
    }
    try {
      console.log('symbol');
      result.symbol = await contract.methods.symbol().call();
      console.log(result.symbol);
    } catch (e) {
      console.log(e);
    }
    this.contracts[address] = result;
    return result;
  }

  async getGasPrice() {
    return await this.web3.eth.getGasPrice();
  }

  async estimateGasLimit(option) {
    // from, to, data, value
    return await this.web3.eth.estimateGas(option)
  }

  async send(transaction, privateKey, options) {
    // from, to, gas: gasLimit, value, gasPrice / (maxFeePerGas, maxPriorityFeePerGas)
    if (transaction) {
      options.data = transaction.encodeABI();
    }
    let signedTx;
    if (privateKey) {
      signedTx = await this.web3.eth.accounts.signTransaction(options, privateKey);
    } else {
      // console.log('from', options);
      return await this.web3.eth.sendTransaction(options);
    }

    const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    result.hash = result.blockHash;
    return result;    
  }

  callAfterBlocks(startBlock, numBlocks, callback) {
    if (numBlocks == 0) {
      callback(true);
      return;
    }

    console.log(startBlock, numBlocks, callback);

    var subscription = this.web3.eth.subscribe('newBlockHeaders', function(error){
      if (!error) {
        return;
      }

      // this.web3.eth.clearSubscriptions();
      console.error(error);
    })
    .on("connected", function(subscriptionId){
      console.log('connected');
        console.log(subscriptionId);
    })
    .on("data", function(blockHeader){
      console.log('block data', blockHeader);
    })
    .on("error", console.error);
    
    // unsubscribes the subscription
    subscription.unsubscribe(function(error, success){
      if (success) {
        console.log('Successfully unsubscribed!');
      }
    });  
  }
}

const helper = new Web3Helper();
// helper.init();
export default helper;