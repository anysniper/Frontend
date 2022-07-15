import Parse from "@/helpers/Parse";
import Web3 from '@/helpers/Web3';
// import Config from '@/config';

const state = {
};
const getters = {
};
const actions = {
  // eslint-disable-next-line no-empty-pattern
  async fetch({}, contract) {
    const query = Parse.getContractQuery();
    query.equalTo('user', Web3.address);
    query.equalTo('network', Web3.getNetwork().network);
    query.equalTo('contract', contract);
    query.limit(30);
    query.descending("createdAt");
    return await query.find();    
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
