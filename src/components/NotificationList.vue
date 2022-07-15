<template>
  <div class="card">
    <div class="card-body p-0 py-4">
      <div class="d-flex justify-content-between align-items-center px-4 pb-3">
        <h2 class="m-0">Recent Actions</h2>
        <div>
          <span style="margin-right: 6px; font-weight: 900; font-size: 14px;">Total PnL: </span>
          <span style="font-weight: 900; font-size: 18px;" :class="profit < 0 ? 'text-danger' : 'text-success'">{{profit}} {{getNetwork().currency}}</span>
        </div>
      </div>
      <div class="table-responsive">
        <div class="p-0 px-4">*Total PnL is currently not accurate as it doesn't calculate the fund refunded for the <b class="pointer" onclick="Intercom('showArticle', 6021003)">Max percent</b> limit of the token.</div>
        <table class="table m-0 align-items-center">
          <thead>
            <tr>
              <th>Token</th>
              <th>{{getNetwork().currency}}</th>
              <!-- <th>Out</th> -->
              <th>Gas</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders.data" :key="order.id">
              <!-- <td><span :class="getType(order) == 'buy' ? 'text-danger' : 'text-success'">{{getType(order)}}</span></td> -->
              <td class="pointer" @click="openOrderDetails(order)">{{formatAddress(order.get('token1'))}}</td>
              <td><span :class="getType(order) == 'buy' ? 'text-danger' : 'text-success'">{{getEthAmount(order)}}</span></td>
              <!-- <td>{{getTokenAmount(order)}}</td> -->
              <td>{{getGas(order)}}</td>
              <td style="white-space: nowrap;">{{getTime(order)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from "vuex";
import Utils from '@/helpers/Utils';
import Web3 from '@/helpers/Web3';
import Observer from '@/helpers/Observer';
import {E_NEW_ORDER} from "@/constants/events";

export default {
  name: "AccountList",
  components: {
  },
  computed: {
    ...mapGetters({
      status: 'information/status',
      orders: 'information/orders',
    }),
    profit() {
      const sum = this.status.reduce((sum, stat) => {
        // eslint-disable-next-line no-undef
        return sum + BigInt(stat.get('ethAmount'))
      // eslint-disable-next-line no-undef
      }, BigInt(0));
      return this.formatBalance(parseInt(sum));
    }
  },
  watch: {
  },
  beforeDestroy() {
    Observer.$off(E_NEW_ORDER);
  },
  async mounted() {
    this.update();
    // eslint-disable-next-line no-unused-vars
    Observer.$on(E_NEW_ORDER, (order) => {
      this.update();
    });
  },
  methods: {
    ...mapActions({
      fetchStatus: 'information/fetchStatus',
      fetchOrders: 'information/fetchOrders'
    }),
    async update() {
      await this.fetchStatus();
      await this.fetchOrders({});
    },
    openOrderDetails(order) {
      window.open(this.getNetwork().explorer + 'tx/' + order.get('tx'));
    },
    formatBalance(balance, decimals) {
      if (!balance) {
        return '_';
      }
      return Utils.formatBalance(balance, decimals);
    },
    getType(order) {
      return order.get('type');
    },
    getEthAmount(order) {
      const prefix = this.getType(order) == 'buy' ? '-' : '';
      return prefix + this.formatBalance(order.get('ethAmount')) + this.getNetwork().currency;
    },
    getTokenAmount(order) {
      return this.formatBalance(order.get('token1Amount'));
    },
    getGas(order) {
      return this.formatBalance(order.get('gasFee')) + this.getNetwork().currency;
    },
    getTime(order) {
      const date = new Date(order.createdAt);
      return date.toLocaleString();
    },
    getNetwork() {
      return Web3.getNetwork();
    },
    formatAddress(address) {
      return Utils.formatAddress(address);
    },
  },
  data() {
    return {
    };
  },
};
</script>

<style scoped>
</style>