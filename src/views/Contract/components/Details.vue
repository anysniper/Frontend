<template>
  <div class="card">
    <div class="card-body p-0 py-4">
        <div class="d-flex justify-content-between align-items-center px-4 pb-3">
          <h2 class="m-0">Details</h2>
          
          <div style="position: relative;">
            <a @click="showMenu = !showMenu;"><img src="img/dots.svg"/></a>
            <div v-if="showMenu" v-click-outside="() => {showMenu=false}" class="card" style="position: absolute; right: 0;">
              <div class="card-body" style="padding: 0.5rem 0rem!important;">
                <template v-if="!watch || watch.get('isActive')">
                  <div @click="watchContract" style="padding: 0.5rem 1rem; white-space: nowrap; cursor: pointer;">
                    Move to Watch list
                  </div>
                  <hr style="margin:0"/>
                </template>
                <template v-if="!watch || !watch.get('isActive') || watch.get('isFinished')">
                  <div @click="activateContract" style="padding: 0.5rem 1rem; white-space: nowrap; cursor: pointer;">
                    Move to Live list
                  </div>
                  <hr style="margin:0"/>
                </template>
                <template v-if="!watch || !watch.get('isActive') || !watch.get('isFinished')">
                  <div @click="finishContract" style="padding: 0.5rem 1rem; white-space: nowrap; cursor: pointer;">
                    Move to Past list
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive" style="overflow-x: hidden!important;">
          <table class="table m-0 align-items-center border0 w-100">
              <tbody v-if="getLevel().canSeeDetails()">
                <tr>
                  <th style="">Name:</th>
                  <td style=" text-align:right">{{contract.get('name')}}</td>
                  <th style="">Symbol: </th>
                  <td style="text-align:right">{{contract.get('symbol')}}</td>
                  <th style="">Total Supply:</th>
                  <td style="text-align:right">{{formatTotalSupply(contract.get('totalSupply'))}}</td>
                </tr>
                <tr>
                  <th>Function:</th>
                  <td style="text-align:right">{{contract.get('function') || '_'}}</td>
                  <th>Tax Buy/Sell:</th>
                  <td style="text-align:right">{{contract.get('buyTax') || '_'}}/{{contract.get('sellTax') || '_'}}</td>
                  <th>Dead Blocks:</th>
                  <td style="text-align:right">{{contract.get('deadBlocks') || '_'}}</td>
                </tr>
                <tr>
                  <th>Decimals:</th>
                  <td style="text-align:right">{{contract.get('decimals') || '_'}}</td>
                  <th>Max Tx/Wallet:</th>
                  <td style="text-align:right">{{contract.get('maxTx') || '_'}}/{{contract.get('maxWallet') || '_'}}</td>
                  <th>Owner Balance:</th>
                  <td style="text-align:right">{{ownerBalance}} {{getNetwork().currency}}</td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <th style="">Name:</th>
                  <td style=" text-align:right">{{contract.get('name')}}</td>
                  <th style="">Symbol: </th>
                  <td style="text-align:right">{{contract.get('symbol')}}</td>
                  <th style="">Total Supply:</th>
                  <td style="text-align:right">{{formatTotalSupply(contract.get('totalSupply'))}}</td>
                </tr>
                <tr v-show="false">
                  <th>Function:</th>
                  <td style="text-align:right">{{contract.get('function') || '_'}}</td>
                  <th>Tax Buy/Sell:</th>
                  <td style="text-align:right">{{contract.get('buyTax') || '_'}}/{{contract.get('sellTax') || '_'}}</td>
                  <th>Dead Blocks:</th>
                  <td style="text-align:right">{{contract.get('deadBlocks') || '_'}}</td>
                </tr>
                <tr>
                  <th>Decimals:</th>
                  <td style="text-align:right">{{contract.get('decimals') || '_'}}</td>
                  <th>Tax Buy/Sell:</th>
                  <td style="text-align:right">{{contract.get('buyTax') || '_'}}/{{contract.get('sellTax') || '_'}}</td>
                  <th>Owner Balance:</th>
                  <td style="text-align:right">{{ownerBalance}} {{getNetwork().currency}}</td>
                </tr>
              </tbody>
          </table>
          <div class="button-text d-flex justify-content-center align-items-center mt-2">
            <a @click="openDexTool()" class="btn-theme">Dextools</a>
            <a @click="openContract()" class="btn-theme">Contract</a>
            <a @click="openOwner()" class="btn-theme">Owner</a>
            <a v-if="!isTesting && getLevel().canSnipe()" @click="handleTest()" class="btn-theme">Test</a>
            <img v-else-if="isTesting" class="loading-icon" src="img/spinner.svg"/>
            <a @click="showWarns()" class="btn-theme">Warns</a>
          </div>
        </div>
    </div>
    <alert-modal 
      :title="alertModalTitle"
      :icon="alertModalIcon"
      :active="alertModalActive"
      :content="alertModalContent"
      :btnOk="alertModalBtnOk"
      :callback="alertModalCallback"
      @ok="alertModalActive=false"
    />
    <WarnModal
      :active="warnModalActive"
      @close="warnModalActive=false"
      :contract="contract"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
// import Config from '@/config';
import Observer from '@/helpers/Observer';
import Web3 from '@/helpers/Web3';
import Utils from '@/helpers/Utils';
import Vue from 'vue';
import AlertModal from '@/components/AlertModal.vue';
import WarnModal from './WarnModal.vue';
import {C_NEW_TX, C_TEST_FAILED, C_TEST_SUCCESS, C_TEST_FINISHED} from "@/constants/events";

export default {
  name: "Details",
  props: ['contract', 'watch'],
  components: {
    AlertModal,
    WarnModal
  },
  data() {
    return {
      showMenu: false,
      isTesting: false,

      timer: null,
      ownerBalance: 0,

      warnModalActive: false,

      // Alert Modal
      alertModalTitle: '',
      alertModalIcon: 'success',
      alertModalActive: false,
      alertModalContent: '',
      alertModalBtnOk: '',
      alertModalCallback: null,
    };
  },
  computed: {
    ...mapGetters({
      config: 'transactions/config'
    }),
  },
  watch: {
  },
  beforeDestroy() {
    Observer.$off(C_TEST_FAILED);
    Observer.$off(C_TEST_SUCCESS);
    Observer.$off(C_TEST_FINISHED);
    clearInterval(this.timer);
  },
  async mounted() {
    Vue.set(this.config, 'warns', []);
    Observer.$on(C_TEST_FAILED, () => {
      this.isTesting = false;
      this.alertModalTitle = 'Error';
      this.alertModalIcon = 'error';
      this.alertModalActive = true;
      this.alertModalContent = 'There is an unknown error in your configrations. Please check them again.';
      this.alertModalBtnOk = 'Ok';
      this.alertModalCallback = null;
    });
    Observer.$on(C_TEST_SUCCESS, () => {
      this.isTesting = false;
      this.alertModalTitle = 'Success';
      this.alertModalIcon = 'success';
      this.alertModalActive = true;
      this.alertModalContent = 'Test was successful. You are good to go.';
      this.alertModalBtnOk = 'Ok';
      this.alertModalCallback = null;
    });
    Observer.$on(C_TEST_FINISHED, () => {
      this.isTesting = false;
    });
    this.timer = setInterval(async () => {
      this.ownerBalance = this.formatBalance(await Web3.getBalance(this.contract.get('owner')));
    }, 10000);
  },
  methods: {
    ...mapActions({
      createUpdateWatch: 'watches/createUpdate'
    }),
    showWarns() {
      this.warnModalActive = true;
    },
    getLevel() {
      return Web3.getLevel(); 
    },
    formatBalance(balance, decimals) {
      if (!balance) {
        return '_';
      }
      return Utils.formatBalance(balance, decimals);
    },
    getNetwork() {
      return Web3.getNetwork();
    },
    formatTotalSupply() {
      let decimals = this.contract.get('decimals') || 18;
      let totalSupply = this.contract.get('totalSupply') || 18;
      // eslint-disable-next-line no-undef
      return (BigInt(totalSupply) / BigInt(10 ** decimals)).toString();
    },
    openDexTool() {
      const url = this.getNetwork().dextool + this.contract.get('address');
      window.open(url);
    },
    openContract() {
      const url = this.getNetwork().explorer + 'address/' + this.contract.get('address');
      window.open(url);
    },
    openOwner() {
      const url = this.getNetwork().explorer + 'address/' + this.contract.get('owner');
      window.open(url);
    },
    handleTest() {
      this.isTesting = true;
      Observer.$emit(C_NEW_TX, {test: true});
      setTimeout(() => {
        if (this.isTesting == false) {
          return;
        }
        this.isTesting = false;
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'There is an unknown error in your configrations. Please check them again.';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
      }, 10000);
    },
    // Move to watch list for new contracts
    async watchContract() {
      this.$emit('update', await this.createUpdateWatch({
        address: this.contract.get('address'),
        name: this.contract.get('name'),
        owner: this.contract.get('owner'),
        symbol: this.contract.get('symbol'),
        isActive: false,
        isFinished: false
      }));
    },
    // Move to past list from live list
    async finishContract() {
      this.$emit('update', await this.createUpdateWatch({
        address: this.contract.get('address'),
        name: this.contract.get('name'),
        owner: this.contract.get('owner'),
        symbol: this.contract.get('symbol'),
        isActive: true,
        isFinished: true,
      }))
    },
    // Move to live list
    async activateContract() {
      this.$emit('update', await this.createUpdateWatch({
        address: this.contract.get('address'),
        name: this.contract.get('name'),
        owner: this.contract.get('owner'),
        symbol: this.contract.get('symbol'),
        isActive: true,
        isFinished: false,
      }))
    }
  },
};
</script>
<style scoped>
.action-icon {
  width: 30px;
  height: 30px;
}

@media only screen 
    and (max-width: 767px), (min-device-width: 767px) 
    and (max-device-width: 767px)  {

		/* Force table to not be like tables anymore */
		table, thead, tbody, th, td, tr {
			display: block;
		}

		/* Hide table headers (but not display: none;, for accessibility) */
		thead tr {
			position: absolute;
			top: -9999px;
			left: -9999px;
		}

    tr {
      margin: 0 0 1rem 0;
    }
      
    /* tr:nth-child(odd) {
      background: #ccc;
    } */
    
		td {
			/* Behave  like a "row" */
			border: none;
			border-bottom: 1px solid #eee;
			position: relative;
			padding-left: 50%;
      width: 100% !important;
		}

		td:before {
			/* Now like a table header */
			position: absolute;
			/* Top/left values mimic padding */
			top: 50%;
			left: 24px;
			padding-right: 10px;
			white-space: nowrap;
      transform: translate(0px, -50%);
      color: #444444;
		}

		/*
		Label the data
    You could also use a data-* attribute and content for this. That way "bloats" the HTML, this way means you need to keep HTML and CSS in sync. Lea Verou has a clever way to handle with text-shadow.
		*/
    tr:nth-of-type(1) td:nth-of-type(1):before { content: "Name: "; }
		tr:nth-of-type(1) td:nth-of-type(2):before { content: "Symbol: "; }
		tr:nth-of-type(1) td:nth-of-type(3):before { content: "Total Supply: "; }
		tr:nth-of-type(2) td:nth-of-type(1):before { content: "Function: "; }
    tr:nth-of-type(2) td:nth-of-type(2):before { content: "Tax Buy/Sell: "; }
		tr:nth-of-type(2) td:nth-of-type(3):before { content: "Dead Blocks: "; }
		tr:nth-of-type(3) td:nth-of-type(1):before { content: "Decimals: "; }
		tr:nth-of-type(3) td:nth-of-type(2):before { content: "Max Tx/Wallet: "; }
		tr:nth-of-type(3) td:nth-of-type(3):before { content: "Owner Balance: "; }
    th {
      display: none;
    }
	}
</style>