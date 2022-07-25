import ABI from '@/constants/abi';

const config = {
  API_BASE_URL: 'http://localhost:8001', // API not used

  // TODO: change backend's endpoints
  PARSE_APP_ID: 'standalone',
  PARSE_URL: 'http://localhost:9000/standalone',
  PARSE_LIVE_QUERY_URL: 'ws://localhost:1338',
  PARSE_MASTER_KEY: 'master',
  PARSE_JS_KEY: '',
  // User's default password
  PARSE_DEFAULT_PASSWORD: 'password',

  ADMIN: '0x0000',

  CHAIN_ID: 1, // 1: eth mainnet, 4: rinkeby, 1337: localhost, 5777: ganache, 56: BSC
  // CHAIN_NAME: 'Ethereum Mainnet',
  // RPC_URL: '',

  // Socket configrations
  NETWORK: 'main', // bsc-main, rinkeby, main
  
  SOCKET_DAPP_ID: 'e72e44c7-d688-4e0e-82a1-6ceb410b2992',

  // Threshold
  MIN_SNIPER_VALUE: 0,
  MIN_SNIPER_VALUE_FOR_COPY_TRADING: 0,
  MIN_DETAILS_SNIPER_AMOUNT: 0,

  SNIPER_ADDRESS: '0xb8fb35e3406e597e5f86d4f3c0e3063a6fab71a5',

  MAINNET_RPC: 'https://mainnet.infura.io/v3/',
  MAINNET_UNI_ROUTER_ADDRESS: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
  MAINNET_WETH_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',

  // For V1 Escros contracts (not used)
  ETH_ESCROW_ADDRESS: '0x89d7c52b999DE0f2D862eD944203BFA0526AE973', // Main
  RINKEBY_ESCROW_ADDRESS: '0x3e4dEaB798b75FB19E3305cf2DDc83032940A24c', // Test
  BSC_ESCROW_ADDRESS: '0xf965f1995A6CC011524F8762d811F64f1045777E', // BSC

  // For V1 Router contracts (not used)
  ETH_ROUTER_ADDRESS: '0xf05dab17B820063Ca143303641adD237C3cA9d32',
  RINKEBY_ROUTER_ADDRESS: '0xAAa83841d5a6Ea44E90Cd534d2e470005e4633c3',
  BSC_ROUTER_ADDRESS: '0x9d1a0E3492F16Ad58E744071e41483495537e488',

  // For Aggregator
  ETH_AGGREGATOR_ADDRESS: '0x0Ff5F706A99BE785B35dF6788ED698290ab56ac0', // Main
  RINKEBY_AGGREGATOR_ADDRESS: '0xf2Ca019454C5e0dcdcBD8e3539CcfCF00850e148', // Test
  BSC_AGGREGATOR_ADDRESS: '0x328c0Ac24544fbF031080E470A7037d66F57013b', // BSC
  CRO_AGGREGATOR_ADDRESS: '', // CRO

  // V2 Router
  ETH_ROUTER_V2_ADDRESS: '0xd82E803289b22DAa6EAE106764AF92C88de7bc78',
  RINKEBY_ROUTER_V2_ADDRESS: '0x39a70EDaC9413F4A71ea9c682b2c62095b165A7b',
  BSC_ROUTER_V2_ADDRESS: '0xa7c94265eeC99B43C17BAC5Cd04d24641F73c934',
  CRO_ROUTER_V2_ADDRESS: '',

  ETH_WETH_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  RINKEBY_WETH_ADDRESS: '0xc778417e063141139fce010982780140aa0cd5ab',
  BSC_WETH_ADDRESS: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  CRO_WETH_ADDRESS: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',

  ETH_DEX_LIST: [
    {
      title: 'UniSwapV2',
      address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // factory
      router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      abi: ABI.UniswapRouterABI
    },
    {
      title: 'UniSwapV3',
      address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
      router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
      isCopyTrading: true,
    },
    {
      title: 'SushiSwap',
      address: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
      router: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
      abi: ABI.UniswapRouterABI
    },
    {
      title: 'DegenSwap',
      address: '0x5c515455efb90308689579993c11a84fc41229c0',
      router: '0x4bf3E2287D4CeD7796bFaB364C0401DFcE4a4f7F',
      isDirect: true, // indicates if can't buy through our router
      abi: ABI.UniswapRouterABI
    }
  ],
  CRO_DEX_LIST: [
    {
      title: 'MMF Swap',
      address: '0xd590cc180601aecd6eeadd9b7f2b7611519544f4',
      router: '0x145677fc4d9b8f19b5d56d1820c48e0443049a30',
      isDirect: true // indicates if can't buy through our router
    }
  ],
  RINKEBY_DEX_LIST: [
    {
      title: 'Uniswap',
      address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
      router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      abi: ABI.UniswapRouterABI
    },
    {
      title: 'UniSwapV3',
      address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
      router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
      isCopyTrading: true,
    },
  ],
  BSC_DEX_LIST: [
    {
      title: 'PancakeSwap',
      address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      router: '0x10ED43C718714eb63d5aA57B78B54704E256024E'
    }
  ],

  IS_TEST: false,

  load() {
    try {
      const localConfig = JSON.parse(localStorage.getItem(`backend_configs`));
      this.PARSE_APP_ID = localConfig.APP_ID;
      this.PARSE_URL = localConfig.URL;
      this.PARSE_MASTER_KEY = localConfig.MASTER_KEY;
      this.PARSE_JS_KEY = localConfig.JS_KEY;
    // eslint-disable-next-line no-empty
    } catch (e) {}
  },

  save() {
    try {
      const config = {
        APP_ID: this.PARSE_APP_ID,
        URL: this.PARSE_URL,
        MASTER_KEY: this.PARSE_MASTER_KEY,
        JS_KEY: this.PARSE_JS_KEY
      }
      localStorage.setItem('backend_configs', JSON.stringify(config));
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

config.load();

export default config;