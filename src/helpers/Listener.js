import Config from '../config';
import Observer from "./Observer";
import Parse from './Parse';
import Web3 from './Web3';

import {C_NEW_TX} from "../constants/events";

function uuidv4() {
  return 'Cn-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xyn]/g, function(c) {
    if (c=='n') {
        return Math.random() * 9 | 0;
    }
    var r = Math.random() * 16 | 1, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class Socket {
  constructor() {
    this.webSocket = null;
    this.socketClosed = true;
    this.firstMessageArrived = false;
    this.callback = null;
  }

  setCallback(callback) {
    this.callback = callback;
  }

  init(config, abi) {
    if (this.close()) {
      // if not closed, then callback handler will call this func again
      // return;
    }
    this.firstMessageArrived = false;
    this.webSocket = new WebSocket("wss://api.blocknative.com/v0");
    this.socketClosed = false;

    this.webSocket.onmessage = (event) => {
      if (!this.firstMessageArrived) {
        // Communicating for protocol init
        this.firstMessageArrived = true;
        let condition = {
          "appName": 'Onboard',
          "appVersion": '1.34.1',
          "blockchain": {
            "system": "ethereum",
            "network": Web3.getNetwork().network
          },
          "categoryCode": "configs",
          "config": {
            // "scope": router,
            // "filters": filters,
            "watchAddress": true,
            ...config
          },
          "dappId": Config.SOCKET_DAPP_ID,
          "eventCode": "put",
          "timeStamp": new Date().toISOString(),
          "version": '3.5.0',
        }
        if (abi) {
          condition['config']['abi'] = abi;
        }
        setTimeout(() => {
          this.webSocket.send(JSON.stringify(condition));
        }, 1000);
        return;
      }

      let data = JSON.parse(event.data);

      if (!data.event || !data.event.transaction) {
        return;
      }

      data = data.event;

      // if ( data.transaction.status != 'txStuck' || data.transaction.status != 'stuck') {
      //   data.transaction.status = 'pending';
      // }

      if (
        data.transaction.status != 'pending' 
        && data.transaction.status != 'confirmed'
        && data.transaction.status != 'failed'
      ) {
        return;
      }
      
      this.callback(data);
    }

    this.webSocket.onclose = () => {
      console.log('The connection has been closed and reconnecting');
      this.socketClosed = true;
      this.init();
    };

    this.webSocket.onerror = () => {
      console.log('The connection faced an error and reconnecting');
      this.init();
    }

    this.webSocket.onopen = () => {
      this.webSocket.send(JSON.stringify({
        "appName": 'Onboard',
        "appVersion": '3.5.0',
        "blockchain": {
          "system": "ethereum",
          "network": Web3.getNetwork().network
        },
        "categoryCode": "initialize",
        "connectionId": uuidv4(),
        "dappId": Config.SOCKET_DAPP_ID,
        "eventCode": "checkDappId",
        "timeStamp": new Date().toISOString(),
        "version": '3.5.0',
      }));
    };
  }

  close() {
    if (this.webSocket) {
      this.webSocket.onclose = () => {};
      this.webSocket.close();
      this.webSocket = null;
      return true;
    }
    return false;
  }
}

class Listener {
  constructor() {
    this.contract = null;
    this.owner = null;
    this.abi = null;
    this.isListening = false;
    this.sockets = [];
  }

  stop() {
    if (this.sockets.length > 0) {
      for (let socket of this.sockets) {
        socket.close();
      }
      this.sockets = [];
    }
    this.isListening = false;
  }

  async listenTargets(addresses, contracts) {
    this.stop();
    this.isListening = true;
    this.sockets = addresses.map((address) => {
      const socket = new Socket();
      const config = {
        "scope": address,
        "filters": [
          // {
          //   "_join": "OR",
          //   "terms": addresses.map((address) => {
          //     return {
          //       'from': address
          //     }
          //   })
          // },
          {
            "_join": "OR",
            "terms": contracts.map((contract) => {
              return {
                'to': contract
              }
            })
          }
        ],
        // "watchAddress": true
      }
      socket.setCallback(async (data) => {
        const History = Parse.getClass('History');
        const history = new History();
        history.set('data', data);
        history.set('owner', data.transaction.from);
        history.set('status', data.transaction.status);
        history.set('hash', data.transaction.hash);
        history.set('contract', this.contract);
        // await history.save();
        Observer.$emit(C_NEW_TX, history)
      });
      socket.init(config);
      return socket;
    })
  }

  async listen(address, owner) {
    this.stop();
    this.sockets = [
      new Socket()
    ];
    this.isListening = true;
    
    // abi can be null
    this.contract = address;
    this.owner = owner;
    
    const config = {
      "scope": this.owner,
      "filters": [
        {
          "_join": "OR",
          "terms": [
            {
              "from": this.owner
            },
            {
              "to": this.contract
            }
          ]
        }
      ],
      "watchAddress": true
    }
    this.sockets[0].setCallback(async (data) => {
      const History = Parse.getClass('History');
      const history = new History();
      history.set('data', data);
      history.set('owner', this.owner);
      history.set('status', data.transaction.status);
      history.set('hash', data.transaction.hash);
      history.set('contract', this.contract);
      // await history.save();
      Observer.$emit(C_NEW_TX, history)
    });
    this.sockets[0].init(config);
  }
  
}

export default new Listener();