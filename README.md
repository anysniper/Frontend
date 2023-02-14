**WARNING**: links that are related to community are closed and scammers are dealing with it.

If you need any help regarding the code, contact me on telegram https://t.me/oopcoder

To run the sniper locally, see this [Wiki](https://github.com/anysniper/Frontend/wiki/Project-Setup)

Explanations for each component in DApp [here](http://help.anysnipers.com/en/collections/3347092-quick-guide-to-anysniper)

Full Tutorial [here](http://help.anysnipers.com/en/articles/5989339-anysniper-dapp-tutorial)

Public Access https://app.anysnipers.com (You can switch to Rinkeby testnet on your wallet, this is limited version, see the tutorial or run on your local for the full version)

![image](https://user-images.githubusercontent.com/98989620/186775106-ad5d5598-391c-4e43-92d1-16598822fffd.png)

# AnySniper DApp

This repository contains all the code to run AnySniper DApp which had 500 active users. All logic code is in this repository and you can add your custom DEX to src/config.js

There are currently Uniswap, Pancakeswap, Sushiswap, Degenswap and some DEXs on Crono chains.

The backend is intended to store user configurations such as contract scanner information, favorite contract addresses, and copy trading targets.

The backend is using [Parse Server](https://parseplatform.org/)

You can use a free backend service like Back4App, details about this can be found in [here](https://github.com/anysniper/Frontend/wiki/Project-Setup).

There is a minor issue with copy trading and will be fixed soon. It basically calculates amountOut / amountIn.

One or two files have multiple lines of code with almost all the logic for sniping, but you can optimize it and any PRs are welcome.

I hope this will help the space for developing new projects at Defi and I'm sure this code will be nice to use as a template or boilerplate for new projects.

## Project setup
```
npm install
```

Open `src/config.js` and change the Parse urls into your backend's urls.

You can create a free server on https://back4app.com.

Create New App and then get the `applicationId` and `javascriptKey` in `App Settings / Security & Keys`

The final configration would be looking like this

```
  PARSE_APP_ID: 'R0qwhAQIbNmHctk030RjGGlYD9hSTuytv...',
  PARSE_URL: 'https://parseapi.back4app.com',
  PARSE_MASTER_KEY: '',
  PARSE_JS_KEY: '1MT3Ew8i1yQUX4SIvqbDiaggfszvtZ....',  
```

You also need to change `MAINNET_RPC` which is used to fetch the token balance. Create a new project at [Infura](https://infura.io/) and get RPC url.

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
