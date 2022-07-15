import Parse from "@/helpers/Parse";
// import Config from '@/config';
import Web3 from '@/helpers/Web3';

const state = {
};
const getters = {
};
const actions = {
  // eslint-disable-next-line no-empty-pattern
  async fetch({}, address) {
    const query = Parse.getQuery('History');
    query.equalTo('contract', address);
    query.equalTo('network', Web3.getNetwork().network);
    query.limit(30);
    query.descending("createdAt");
    const histories = await query.find();
    return histories;
  }
};
const mutations = {
  SET (state, [key, value]) {
    state[key] = value;
  }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
