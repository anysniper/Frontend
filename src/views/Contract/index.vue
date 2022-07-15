<template>
  <div v-if="contract">
    <div>
      <Details @update="updateWatch" :watch="watch" :contract="contract" class="mt-4"/>
    </div>
    <div>
      <PositionList :contract="contract" class="mt-4"/>
    </div>
    <div v-if="getLevel().canSnipe()" style="margin-top: 30px;">
      <HistoryList :contract="contract"/>
    </div>
  </div>
  <div v-else style="">
    <div class="card mt-4">
      <div class="card-body p-0 p-4" style="font-weight: 900;">
        Loading contract details <img class="loading-icon" src="img/spinner.svg"/>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-json-pretty/lib/styles.css';
import Vue from 'vue';
import HistoryList from './components/HistoryList.vue';
import PositionList from './components/PositionList.vue';
import Details from './components/Details.vue';
import Web3 from '@/helpers/Web3';

import { mapActions, mapGetters } from "vuex";

export default {
  name: "Contract",
  components: {
    HistoryList,
    PositionList,
    Details
  },
  data() {
    return {
      address: '',
      contract: null,
      watch: null
    };
  },
  computed: {
    ...mapGetters({
      txConfig: 'transactions/config',
    })
  },
  watch: {
    async $route() {
      await this.init();
    }
  },
  beforeDestroy() {
    this.setActive(null);
    // TODO: remove socket
  },
  async mounted() {
    await this.init();
  },
  methods: {
    ...mapActions({
      fetchContract: 'contracts/get',
      fetchWatch: 'watches/get',
      setActive: 'contracts/setActive',
    }),
    getLevel() {
      return Web3.getLevel(); 
    },
    async init() {
      this.contract = null;
      this.address = this.$route.params.address;
      this.contract = await this.fetchContract(this.address);
      this.setActive(this.contract);
      this.watch = await this.fetchWatch(this.address);

      const maxSupply = parseFloat(this.contract.get('maxTx'));
      const deadBlock = parseInt(this.contract.get('deadBlocks'));
      const func = this.contract.get('function');

      if (this.getLevel().canSnipe()) {
        if (!isNaN(maxSupply) && maxSupply) {
          Vue.set(this.txConfig, 'maxSupply', maxSupply);
        }

        if (!isNaN(deadBlock) && deadBlock > 0) {
          Vue.set(this.txConfig, 'blocks', deadBlock);
          Vue.set(this.txConfig, 'isBuyInstant', false);
        } else {
          Vue.set(this.txConfig, 'blocks', 1);
          Vue.set(this.txConfig, 'isBuyInstant', true);
        }

        if (func) {
          Vue.set(this.txConfig, 'buyOn', func);
        }
      }
    },
    updateWatch(watch) {
      this.watch = watch;
    }
  },
};
</script>
<style scoped>
</style>