import Parse from "@/helpers/Parse";
import Web3 from '@/helpers/Web3';
// import Config from '@/config';

const state = {
  list: [],
  active: null
};
const getters = {
  list: (state) => state.list,
  active: (state) => state.active
};
const actions = {
  async fetch({commit}) {
    console.log('Getting contracts');
    const query = Parse.getContractQuery();
    query.equalTo('user', Web3.address);
    query.equalTo('network', Web3.getNetwork().network);
    query.limit(30);
    query.descending("createdAt");
    const contracts = await query.find();
    commit('SET', ['list', contracts]);
  },
  async setActive({commit}, contract) {
    commit('SET', ['active', contract]);
  },
  // Get Contract from db or Create if not exists
  async get({dispatch}, address) {
    const contractQuery = Parse.getContractQuery();
    // contractQuery.equalTo('network', Web3.getNetwork().network);
    // contractQuery.equalTo('address', address);
    contractQuery.matches('address', address, 'i');
    contractQuery.ascending("createdAt");
    contractQuery.limit(1);
    const contracts = await contractQuery.find();

    if (contracts.length > 0) {
      if (contracts[0].get('totalSupply')) {
        return contracts[0];
      }
      await contracts[0].destroy();
    }
    return await dispatch('create', address);
  },
  // eslint-disable-next-line no-empty-pattern
  async create({}, address) {
    const details = await Web3.getTokenDetails(address);
    const Contract = Parse.getClass('Contract');
    const contract = new Contract();
    contract.set('owner', details.owner);
    contract.set('network', Web3.getNetwork().network);
    contract.set('address', address);
    contract.set('abi', []);
    contract.set('totalSupply', details.totalSupply);
    contract.set('decimals', details.decimals);
    contract.set('name', details.name);
    contract.set('symbol', details.symbol);
    await contract.save();
    return contract;
  },
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
