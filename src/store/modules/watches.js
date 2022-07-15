import Parse from "@/helpers/Parse";
import Web3 from '@/helpers/Web3';
// import Config from '@/config';

const state = {
  liveList: [],
  pastList: [],
  watchList: []
};

const getters = {
  liveList: (state) => state.liveList,
  pastList: (state) => state.pastList,
  watchList: (state) => state.watchList
};
const actions = {
  async fetch({commit}, type) {
    let key = '';
    const query = Parse.getQuery('Watch');
    query.equalTo('user', Web3.address);
    query.equalTo('network', Web3.getNetwork().network);
    
    if (type == 'live') {
      query.equalTo('isActive', true);
      query.equalTo('isFinished', false);
      key = 'liveList';
    } else if (type == 'past') {
      query.equalTo('isActive', true);
      query.equalTo('isFinished', true);
      key = 'pastList';
    } else {
      query.equalTo('isActive', false);
      key = 'watchList';
    }

    query.limit(30);
    query.descending("createdAt");
    const watches = await query.find();
    commit('SET', [key, watches]);
  },

  // eslint-disable-next-line no-empty-pattern
  async get({}, address) {
    const query = Parse.getQuery('Watch');
    query.equalTo('network', Web3.getNetwork().network);
    query.equalTo('address', address);
    query.limit(1);
    const watches = await query.find();

    if (watches.length > 0) {
      return watches[0];
    }
    return null;
  },

  // eslint-disable-next-line no-empty-pattern
  async delete({commit, state}, {address, type}) {
    const query = Parse.getQuery('Watch');
    query.equalTo('address', address);
    query.equalTo('network', Web3.getNetwork().network);
    query.equalTo('user', Web3.address);
    query.limit(1);
    const watches = await query.find();

    if (watches.length > 0) {
      await watches[0].destroy();
      const key = type + 'List';
      commit('SET', [key, state[key].filter(item => {
        return item.get('address') != address;
      })])
    }
    return true;
  },

  async createUpdate({commit, state}, {address, owner, symbol, name, isActive, isFinished}) {
    const query = Parse.getQuery('Watch');
    query.equalTo('network', Web3.getNetwork().network);
    query.equalTo('address', address);
    query.limit(1);
    const watches = await query.find();

    let watch = null;
    let wasActive = null;
    let wasFinished = null;

    if (watches.length > 0) {
      watch = watches[0];
      wasActive = !!watch.get('isActive');
      wasFinished = !!watch.get('isFinished');
    } else {
      const Watch = Parse.getClass('Watch');
      watch = new Watch();
      watch.set('network', Web3.getNetwork().network);
    }

    if (address) {
      watch.set('address', address);
    }
    if (name) {
      watch.set('name', name);
    }
    if (symbol) {
      watch.set('symbol', symbol);
    }
    if (owner) {
      watch.set('owner', owner);
    }
    watch.set('user', Web3.address);
    if (isActive != undefined) {
      watch.set('isActive', isActive);
    }
    if (isFinished != undefined) {
      watch.set('isFinished', isFinished);
    }
    await watch.save();

    if (wasActive === false) {
      commit('SET', ['watchList', state.watchList.filter(item => {
        return item.id != watch.id;
      })])
    } else if (wasFinished === false) {
      commit('SET', ['liveList', state.liveList.filter(item => {
        return item.id != watch.id;
      })])
    } else {
      commit('SET', ['pastList', state.pastList.filter(item => {
        return item.id != watch.id;
      })])
    }

    if (!watch.get('isActive')) {
      commit('PUSH', ['watchList', watch]);
    } else if (!watch.get('isFinished')) {
      commit('PUSH', ['liveList', watch]);
    } else {
      commit('PUSH', ['pastList', watch]);
    }
    return watch;
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
