<template>
  <div class="card">
    <div class="card-body p-0 py-4">
        <div class="d-flex justify-content-between align-items-center px-4 pb-3">
          <h2 class="m-0">Positions</h2>
        </div>
        <div class="table-responsive">
          <table class="table m-0 align-items-center border0 w-100">
              <tbody v-if="getLevel().canUseAccount()">
                <tr v-for="account in accounts" :key="account.id">
                  <th style="width: 50px;">Name:</th>
                  <td style="width: 50px; text-align:left">{{account.get('name')}}</td>
                  <th>Balance:</th>
                  <td style="text-align:left; font-weight: 900;">{{getBalance(account)}} / {{getEthValue(account)}} {{getNetwork().currency}}</td>
                  <th>TP/SL:</th>
                  <td style="text-align:left">
                    {{getTp(account)}} / {{getSl(account)}}
                    <a v-if="getLevel().canSetTpSl()" @click="handleEditTpSl(account)" data-mdb-placement="bottom" title="Edit" class="me-2" style="margin-left: 10px;" >
                      <!-- Approve -->
                      <img class="action-icon" src="img/Edit.svg">
                    </a>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <th>Balance:</th>
                  <td style="text-align:left; font-weight: 900;">{{getBalance(wallet)}}</td>
                  <th>{{getNetwork().currency}} Value:</th>
                  <td style="text-align:left; font-weight: 900;">{{getEthValue(wallet)}} {{getNetwork().currency}}</td>
                  <th>TP/SL:</th>
                  <td style="text-align:left">
                    {{getTp(wallet)}} / {{getSl(wallet)}}
                    <a @click="handleEditTpSl(wallet)" data-mdb-placement="bottom" title="Edit" class="me-2" style="margin-left: 10px;" >
                      <!-- Approve -->
                      <img class="action-icon" src="img/Edit.svg">
                    </a>
                  </td>
                </tr>
              </tbody>
          </table>
        </div>
    </div>
    <TpSlModal
      :active="tpSlModalActive"
      :balances="balances"
      :positions="positions"
      :activeAccount="tpSlActiveAccount"
      @close="tpSlModalActive=false;"
      :callback="tpSlModalCallback"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Utils from '@/helpers/Utils';
import Web3 from '@/helpers/Web3';
import TpSlModal from '@/components/TpSlModal.vue';
import Vue from 'vue';
import Observer from '@/helpers/Observer';

export default {
  name: "HistoryList",
  props: ['contract'],
  components: {
    TpSlModal
  },
  data() {
    return {
      positions: {},
      balances: {},
      timer: null,

      // Tp Sl Modal
      tpSlActiveAccount: null,
      tpSlModalActive: false,
      tpSlModalCallback: null,
      tpSlEntry: 0
    };
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  computed: {
    ...mapGetters({
      wallet: 'account',
      accounts: 'accounts/list',
      txConfig: 'transactions/config'
    })
  },
  watch: {
  },
  async mounted() {
    this.positions = {};
    // const positions = await this.fetch(this.contract.get('address'));
    // Better indexing
    for (let account of this.accounts) {
      this.positions[account.get('address')] = {
        tp: 0,
        sl: 0
      };
    }
    this.timer = setInterval(this.fetchBalances, 5000);
  },
  methods: {
    ...mapActions({
      fetch: 'positions/fetch',
      getTokenBalance: 'accounts/getTokenBalance',
    }),
    getLevel() {
      return Web3.getLevel(); 
    },
    getNetwork() {
      return Web3.getNetwork();
    },
    async fetchBalances() {
      if (!this.accounts) {
        return;
      }
      
      const dex = Web3.getDexList()[this.txConfig.factory];
      
      const accountsToSell = [];
      for (let account of this.accounts) {
        const balance = await this.getTokenBalance({account, contract: this.contract})
        let amountOut;
        // eslint-disable-next-line no-undef
        if (BigInt(balance) == BigInt(0)) {
          amountOut = 0;
        } else {
          if (this.txConfig.isOriginalRouter) {
            const routerHandler = Web3.getUniswapV2Contract(dex.router);
            const amountsOut = await routerHandler.methods.getAmountsOut(
              balance,
              [
                this.contract.get('address'),
                Web3.getWETHAddress()
              ]
            ).call();
            amountOut = amountsOut[1];
          } else {
            const routerHandler = Web3.getRouterV2Contract();
            amountOut = await routerHandler.methods.getAmountOut(
              dex.address,
              this.contract.get('address'), 
              Web3.getWETHAddress(),
              balance
            ).call();
          }
        }
        const accountBalance = {
          eth: Utils.formatBalance(amountOut),
          token: Utils.formatBalance(balance, this.contract.get('decimals'))
        };
        Vue.set(
          this.balances, 
          account.get('address'),
          accountBalance
        );
        const position = this.positions[account.get('address')];
        let isSelling = false;
        if (!isNaN(parseFloat(position.tp))) {
          if (parseFloat(position.tp) > 0 && parseFloat(accountBalance.eth) > 0 && parseFloat(accountBalance.eth) > parseFloat(position.tp)) {
            // sell for profit
            accountsToSell.push(account);
            isSelling = true;
          }
        }
        if (!isNaN(parseFloat(position.sl))) {
          if (parseFloat(position.sl) > 0 && parseFloat(accountBalance.eth) > 0  && parseFloat(accountBalance.eth) < parseFloat(position.sl)) {
            // sell for profit
            if (!isSelling) {
              accountsToSell.push(account);
            }
          }
        }
      }
      if (accountsToSell.length > 0) {
        Observer.$emit('sell', {
          history: null,
          type: 'normal',
          accounts: accountsToSell
        });
      }
    },
    getBalance(account) {
      const balance = this.balances[account.get('address')];
      if (!balance) {
        return '_';
      }
      return this.balances[account.get('address')].token;
    },
    getEthValue(account) {
      const balance = this.balances[account.get('address')];
      if (!balance) {
        return '_';
      }
      return this.balances[account.get('address')].eth;
    },
    getTp(account) {
      const position = this.positions[account.get('address')];
      if (!position || position.tp == 0) {
        return '_';
      }
      return position.tp;
    },
    getSl(account) {
      const position = this.positions[account.get('address')];
      if (!position || position.sl == 0) {
        return '_';
      }
      return position.sl;
    },
    handleEditTpSl(account) {
      this.tpSlActiveAccount = account;
      this.tpSlModalActive = true;
      this.tpSlModalCallback = (tp, sl) => {
        this.positions[account.get('address')].tp = tp;
        this.positions[account.get('address')].sl = sl;
        this.tpSlModalActive = false;
      }
    }
  },
};
</script>
<style scoped>

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
    td:nth-of-type(1):before { content: "Name: "; }
		td:nth-of-type(2):before { content: "Balance: "; }
		td:nth-of-type(3):before { content: "TP/SL: "; }
		td:nth-of-type(4):before { content: "Function: "; }

    th {
      display: none;
    }
	}
</style>