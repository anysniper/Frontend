<template>
  <header class="py-4 bg-white">
    <div class="container d-flex justify-content-lg-between align-items-center flex-wrap">
      <div class="col-xl-6 col-12">
        <div class="d-flex align-items-center justify-content-lg-start justify-content-center">
          <div class="col-xl-6" style="margin-right: 30px;">
            <div class="logo">
          <a ><img src="img/logo.svg"/></a>
          </div>
          </div>
          <div class="col-xl-6">
            <ul class="list-unstyled d-flex align-items-center m-0 ms-lg-0 ms-3">
              <li>
                <router-link to="/">
                  <a class="text-dark" >
                    Home
                  </a>
                </router-link>
              </li>
              <li>
                <router-link to="/copytrading">
                  <a class="text-dark" style="white-space: nowrap;" >
                    Copy Trading
                  </a>
                </router-link>
              </li>
              <!-- <li><a class="text-dark" >Dashboard</a></li> -->
            </ul>
          </div>
        </div>
      </div>
      <div class="col-xl-6 col-12 mt-lg-0 mt-3">
        <div class="connect-wallet d-flex justify-content-lg-end justify-content-center align-items-center">
          <!-- <img src="img/info-circle.svg"> -->
          <div class="wallet ms-4">
            <div class="dropdown">
              <!-- <a id="dropdownMenuButton"
                v-if="!account" @click="connect"
                data-mdb-toggle="dropdown"
                aria-expanded="false" class="btn-infos" >
                CONNECT WALLET
              </a> -->
              <div v-if="account" class="d-flex align-items-center flex-wrap justify-content-center">
                <img style="width: 25px; height: 25px; margin-right: 15px; cursor: pointer;" onclick="Intercom('showArticle', 5989339)" class="action-icon" src="img/question.svg"/>
                <div v-if="showSearch" class="d-flex" style="position: relative;">
                  <input id="contract-address-search" style="height: 35px; padding-right: 30px;" v-model="contract" type="text"  class="form-control" placeholder="Contract Address">
                  <a style="position: absolute; top: 5px; right: 5px;" @click="watch" data-mdb-placement="bottom" title="Delete">
                    <img style="width: 25px; height: 25px;" class="action-icon" src="img/search.svg"/>
                  </a>
                </div>
                <div class="d-flex align-items-center mobile-mt" style="margin-left: 16px;border-radius: 15px; overflow: hidden; color: #7e7e7e; font-weight: 900;">
                  <!-- <div class="d-flex align-items-center justify-content-center;" style="line-height: 1;background: #e5e5e5; padding: 10px 20px;">{{balance}} ETH</div> -->
                  <div class="d-flex align-items-center justify-content-center;" style="line-height: 1;background: #e5e5e5; padding: 10px 20px;">{{getNetwork().title}}</div>
                  <div @click="copyToClipboard(account.get('address'))" class="d-flex align-items-center justify-content-center;" style="line-height: 1;background: #13d5fe; padding: 10px 20px;cursor: pointer; color: white;">{{formatAddress(account.get('address'))}}</div>
                </div>
                <!-- Address: {{account.get('address')}}, 
                Balance: {{balance}} -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-tour name="myTour" :steps="steps"></v-tour>
  </header>
</template>

<script>
import Web3 from '@/helpers/Web3';
import Utils from '@/helpers/Utils';
import Observer from '@/helpers/Observer';
import {E_CHAIN_CHANGED} from '@/constants/events';
import { mapGetters } from "vuex";

export default {
  name: 'Navbar',
  components: {
  },
  data() {
    return {
      contract: '',
      steps: [
        {
          target: '#contract-address-search',  // We're using document.querySelector() under the hood
          header: {
            title: 'Watch contracts',
          },
          content: `Type your contract address here to watch the live transactions`
        },
        {
          target: '#escrow-card',  // We're using document.querySelector() under the hood
          header: {
            title: 'Escrow Information',
          },
          content: `This card contains information about your balance. All your funds are stored in the escrow smart contract. You can deposit and withdraw at any time you want`
        },
        {
          target: '#main-account-table-card',  // We're using document.querySelector() under the hood
          header: {
            title: 'Main wallet',
          },
          content: `This is the main wallet to trigger any transactions like Buy / Sell. You have to deposit some ETH to pay gas fee. 0.3ETH is just the enough amount for sending any transactions`
        },
        {
          target: '#main-account-action-card',  // We're using document.querySelector() under the hood
          header: {
            title: 'Main wallet actions',
          },
          content: `You can send transactions using these buttons, It will call escrow contract's function to buy or sell. The gas fee is paid by main account. You can deposit to this main account by clicking the Deposit button`
        },
        {
          target: '#sub-account-table-card',  // We're using document.querySelector() under the hood
          header: {
            title: 'Sub wallets to store tokens',
          },
          content: `These are sub accounts that will store the tokens you buy. You have to deposit to this account for approving the tokens for selling later. All the ETH from selling tokens will be saved in your escrow account and you can withdraw anytime.`
        },
        {
          target: '#transaction-config-card',  // We're using document.querySelector() under the hood
          header: {
            title: 'Transaction configration',
          },
          content: `This is the main configration panel for each transaction you make. It has settings like ETH amount to buy a token or max percent of total supply, selling on warn etc. This also has helpful function called Get Selector which converts function names to bytecode. This bytecode will be used to make exact purchase upon owner action like add liquidity or open trading`
        },
        {
          target: '#active-contracts-card',  // We're using document.querySelector() under the hood
          header: {
            title: 'Active Contracts',
          },
          content: `This is the active contracts that you have your positions or traded in the past.`
        }
      ]

    }
  },
  computed: {
    ...mapGetters(["account", "balance"]),
    showSearch() {
      const token = this.$route.params.address;
      if (Web3.isAddress(token)) {
        return false;
      }
      return true;
    }
  },
  mounted() {
    Observer.$on(E_CHAIN_CHANGED, () => {
      this.$forceUpdate();
    });
  },
  methods: {
    getNetwork() {
      return Web3.getNetwork();
    },
    copyToClipboard(text) {
      this.$toast("Address copied to clipboard", {
        position: "top-right",
        timeout: 2000,
        closeOnClick: true,
      });
      Utils.copyToClipboard(text);
    },
    startTutor() {
      // this.$router.push({name: 'Home', query: {product_tour_id: '316670'}})
      this.$tours['myTour'].start()
    },
    formatAddress(address) {
      return Utils.formatAddress(address);
    },
    async connect() {
      await Web3.init();
    },
    watch() {
      if (!Web3.isAddress(this.contract)) {
        return;
      }
      this.$router.push({
        name: 'Contract',
        params: {
          address: this.contract
        }
      })
    }
  }
}
</script>

<style scoped>
.mobile-mt {
  margin-top: 0px;
}

@media(max-width: 530px) {
  .mobile-mt {
    margin-top: 12px;
  }
}
</style>