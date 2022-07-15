import Parse from "@/helpers/Parse";
import Web3 from '@/helpers/Web3';

const state = {
  status: [],
  orders: {
    pageSize: 5,
    page: 1,
    data: []
  },
};
const getters = {
  status: (state) => state.status,
  orders: (state) => state.orders,
};
const actions = {
  async fetchStatus({commit}) {
    const statusQuery = Parse.getQuery('Status');
    const source = Web3.getLevel().canUseAccount() ? 'account' : 'wallet';
    statusQuery.equalTo('network', Web3.getNetwork().network);
    statusQuery.equalTo('source', source);
    statusQuery.matches('owner', Web3.address, 'i');
    const status = await statusQuery.find();
    commit('SET', ['status', status]);
  },
  async fetchOrders({state, commit}) {
    const orderQuery = Parse.getQuery('Order');
    const source = Web3.getLevel().canUseAccount() ? 'account' : 'wallet';
    orderQuery.equalTo('network', Web3.getNetwork().network);
    orderQuery.equalTo('source', source);
    orderQuery.matches('owner', Web3.address, 'i');
    orderQuery.skip(state.orders.pageSize * (state.orders.page - 1))
    orderQuery.limit(state.orders.pageSize);
    orderQuery.descending("createdAt");

    const orders = await orderQuery.find();
    commit('SET', ['orders', {
      pageSize: state.orders.pageSize,
      page: state.orders.page,
      data: orders
    }]);
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
