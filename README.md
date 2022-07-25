# AnySniper DApp

This repository contains all the code for running AnySniper DApp which had 500 active users. All the logic codes are in this repository, you can add a custom DEX on src/config.js.

Currently it has Uniswap, Pancakeswap, Sushiswap, Degenswap and some DEX on Crono chain.

Backend is for storing user configrations like contract scanner info, favorite contracts address, copy trading targets etc.

Backend is using Parse Server which is being used by Moralis team. It's good for SPAs.

You can use free backend services like Back4App and there is details about that in Project Setup.

Copy Trading has a minor issue and will be fixed soon. It's basically calculating the amountOut / amountIn.

One or two files have many lines of code which contains almost all the logic for sniping, however we can optimize that and any PR is welcome.

Contract Scanner will not be published but it will be online for the next few months. If you need the scanner code to customize yourself, you can directly contact me.

The Backend code for Back4App will also be published but for now you can just run your Sniping DApp without it using Back4App.

I hope this helps the space for developing new projects in Defi and I am pretty sure this code can be very good to be used as a template or boilerplate for a new project.

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

Backend is used to store user configrations like `Watching Lists`, `Copy Trading Targets`, and `Contracts Information`. All the logic is inside the src/store.

Also need to change `MAINNET_RPC` which is used to fetch the token balance.

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

#### Leave a star on top right if you want to get notification for further updates
