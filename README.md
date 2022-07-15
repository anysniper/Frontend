# AnySniper

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
