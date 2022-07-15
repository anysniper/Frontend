import Vue from 'vue'
import Vuex from 'vuex'

import accounts from './modules/accounts';
import contracts from './modules/contracts';
import positions from './modules/positions';
import histories from './modules/histories';
import watches from './modules/watches';
import information from './modules/information';
import transactions from './modules/transactions';
import targets from './modules/targets';

import { E_LOGIN } from "@/constants/events";
import Observer from '@/helpers/Observer';

Vue.use(Vuex)

const Store = new Vuex.Store({
  modules: {
    accounts,
    contracts,
    positions,
    histories,
    watches,
    information,
    transactions,
    targets
  },
  state: {
    account: null,
    balance: 0
  },
  getters: {
    account: (state) => state.account,
    balance: (state) => state.balance
  },
  actions: {
  },
  mutations: {
    SET (state, [key, value]) {
      state[key] = value;
    }
  }
})

Observer.$on(E_LOGIN, () => {
  Store.dispatch('accounts/fetch');

  Store.dispatch('watches/fetch', 'watch');
  Store.dispatch('watches/fetch', 'live');
  Store.dispatch('watches/fetch', 'past');
})

export default Store;