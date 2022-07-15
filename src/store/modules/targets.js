import Parse from "@/helpers/Parse";
// import Config from '@/config';
import Web3 from '@/helpers/Web3';
// import Observer from '@/helpers/Observer';
// import {E_NEW_ORDER} from "@/constants/events";

const state = {
  list: [],
  templates: []
};

const getters = {
  list: (state) => {
    return state.list
  },
  templates: state => state.templates
};
const actions = {
  async fetchTemplate({commit}) {
    const query = Parse.getQuery('TargetTemplate');
    query.ascending("createdAt");
    const templates = await query.find();

    commit('SET', ['templates', templates]);
  },
  async fetch({commit}) {
    const query = Parse.getTargetQuery();
    query.matches('user', Web3.address, 'i');
    query.equalTo('network', Web3.getNetwork().network);
    query.limit(30);
    query.ascending("createdAt");
    const list = await query.find();

    commit('SET', ['list', list]);
  },

  async create({commit}, {name, address}) {      
    const Target = Parse.getClass('Target');
    const target = new Target();
    target.set('user', Web3.address);
    target.set('name', name);
    target.set('network', Web3.getNetwork().network);
    target.set('address', address);
    await target.save();
    commit('PUSH', ['list', target]);
  },

  // eslint-disable-next-line no-empty-pattern
  async edit({}, {target, fields}) {
    Object.keys(fields).map(key => {
      target.set(key, fields[key]);
    })
    await target.save();
  },

  async delete({commit, state}, target) {
    await target.destroy();
    commit('SET', ['list', state.list.filter(tar => {
      return tar.id != target.id;
    })]);
  },
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
