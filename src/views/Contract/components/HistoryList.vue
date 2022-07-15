<template>
  <div class="card">
    <div class="card-body p-4">
      <div class="d-flex justify-content-between">
        <h2>Transactions</h2>
        <div v-if="contract" style="width: 100px; margin-top: -10px;" class="button-text d-flex justify-content-center align-items-center">
          <a class="w-100 btn-theme btn-w ms-0" @click="setAbi()">Set ABI</a>
        </div>
      </div>
      <div v-for="history in histories" :key="history.id"  class="border4 mt-5">
          <div class="d-flex border amenu align-items-center justify-content-between flex-wrap">
            <a class="btn-full" :style="'background:' + getNonceColor(history)">Nonce: {{history.get('data').transaction.nonce}}</a>
            <p class="pe-1">From: {{formatAddress(history.get('data').transaction.from)}}</p>
            <div class="border-end h100p"></div>
            <p class="pe-1">To: {{formatAddress(history.get('data').transaction.to)}}</p>
            <!-- <div class="border-end h100p"></div> -->
            <div v-if="!hasNoFunctions" :style="getTransactionDetails(history).status != 'pending' ? 'visibility: hidden!important;' : ''" class="button-text d-flex justify-content-center align-items-center">
                <a class="btn-theme btn-w ms-0" @click="handleBuy(history)">Buy</a>
                <a class="btn-theme btn-w ms-2" @click="handleSell(history)">Sell</a>
            </div>
          </div>
          <div class="d-flex p-3 pb-0 flex-wrap">
            <span class="me-3">Method :</span>
            <a class="border-theme" >{{getTransactionDetails(history).method ? getTransactionDetails(history).method : getTransactionDetails(history).selector}}</a>
            <span v-if="isWarn(history, getTransactionDetails(history))"><b class="text-danger ms-3">WARN</b></span>
            <p class="m-0 ms-3">Time: {{getTime(history)}}</p>
          </div>
          <div class="code-select p-3 pt-0">
            <VueJsonPretty :path="'res'" :data="getTransactionDetails(history)" style="max-width: 800px; overflow-x: auto;"/>
          </div>
      </div>
    </div>

    <input-modal 
      :title="inputModalTitle"
      :active="inputModalActive"
      :btnOk="inputModalBtnOk"
      :btnCancel="inputModalBtnCancel"
      :callback="inputModalCallback"
      :fields="inputModalFields"
      @cancel="inputModalActive=false"
    />
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import Transaction from '@/helpers/Transaction';
import { mapGetters, mapActions } from "vuex";
import Observer from '@/helpers/Observer';
import Utils from '@/helpers/Utils';
import {C_NEW_TX} from "@/constants/events";
import InputModal from '@/components/InputModal.vue';
import Web3 from '@/helpers/Web3';

export default {
  name: "HistoryList",
  props: ['contract', 'hasNoFunctions'],
  components: {
    VueJsonPretty,
    InputModal
  },
  data() {
    return {
      histories: [],
      colors: {},

      // Input Modal
      inputModalFields: [],
      inputModalActive: false,
      inputModalTitle: '',
      inputModalCallback: null,
      inputModalBtnOk: 'Yes',
      inputModalBtnCancel: 'Cancel',
    };
  },
  computed: {
    ...mapGetters({
      accounts: 'accounts/list',
      txConfig: 'transactions/config'
    }),
  },
  watch: {
  },
  beforeDestroy() {
    Observer.$off(C_NEW_TX, this.handleNewTx);
  },
  async mounted() {
    Observer.$on(C_NEW_TX, this.handleNewTx)
    if (this.contract) {
      this.histories = await this.fetch(this.contract.get('address'));
    }
  },
  methods: {
    ...mapActions({
      fetch: 'histories/fetch',
    }),
    setAbi() {
      console.log(Web3.getAbi(this.contract.get('address')));
      this.inputModalActive = true;
      this.inputModalBtnOk = 'Ok';
      this.inputModalBtnCancel = 'Cancel';
      this.inputModalFields = [
        {
          label: 'ABI',
          model: JSON.stringify(Web3.getAbi(this.contract.get('address'))),
          type: 'textarea'
        }
      ];

      this.inputModalTitle = 'Set ABI',
      this.inputModalActive = true;
      this.inputModalCallback = async () => {
        this.inputModalActive = false;
        Web3.setAbi(this.contract.get('address'), JSON.parse(this.inputModalFields[0].model));
      }
    },
    handleNewTx(history) {
      if (history.test) {
        return;
      }
      this.histories.unshift(history);
    },
    formatAddress(address) {
      return Utils.formatAddress(address);
    },
    handleBuy(history) {
      Observer.$emit('buy', {
        history,
        type: 'backrun'
      });
    },
    handleSell(history) {
      Observer.$emit('sell', {
        history,
        type: 'frontrun'
      });
    },
    getTime(history) {
      const date = new Date(history.get('data').timeStamp);
      return date.toLocaleString();
    },
    getNonceColor(history) {
      const nonce = history.get('data').transaction.nonce;
      if (!this.colors[nonce]) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        this.colors[nonce] = `rgb(${r}, ${g}, ${b});`;
      }
      return this.colors[nonce];
    },
    isWarn(history, details) {
      return Transaction.isWarn(history, this.accounts, details, this.txConfig.warns);
    },
    getTransactionDetails(history) {
      return Transaction.getDetails(this.contract, history);
    }
  },
};
</script>
<style scoped>
</style>