<template>
  <div class="card mb-4">
    <div id="escrow-card" class="card-body p-0 py-4">
        <div class="d-flex justify-content-between align-items-center px-4">
          <h2 class="m-0">Information</h2>
          <!-- <a ><img src="img/dots.svg"/></a> -->
        </div>
        <div class="d-flex flex-wrap p-4 d-flex pb-0 pt-0 mobile-p">
          <div class="d-flex flex-column-reverse w-100">
              <div class="card2 col-lg-12 col-sm-12 col-12 p-2 d-flex bg-theme6 flex-column mt-3 p-3 pt-4">
                <div class="d-flex justify-content-between w-100  flex-wrap">
                    <div class="col-xl-6 d-flex align-items-center">
                      <div class="cristal me-3 d-flex flex-column" style="position: relative;">
                          <img style="width: 56px; height: 56px;" :src="'img/'+getIcon()+'.svg'">
                      </div>
                      <div class="cristal-text" style="flex-grow: 1;">
                          <p class="m-0"><b>Escrow</b></p>
                          <div class="d-flex">
                            <div class="col-xl-12">
                              <p class="m-0 crystal-text-small">W{{getNetwork().currency}} BALANCE</p>
                              <div class="gray-span mt-2">
                                <span>{{formatBalance(escrowBalance)}}</span>
                              </div>
                            </div>
                            <!-- <div class="col-xl-6">
                              <p class="m-0 crystal-text-small">GWei</p>
                              <div class="gray-span mt-2">
                                <span>{{formatBalance(escrowBalance)}}</span>
                              </div>
                            </div>-->
                          </div>
                      </div>
                    </div>
                    <div class="col-xl-6 d-flex flex-column justify-content-center align-items-center">
                      <div class="bg-image-1" style="z-index: 1111">
                          <img class="img-fluid" :src="'img/'+getIcon()+'.svg'"/>
                      </div>
                      <div @click="handleDeposit" class="button-text mb-2" style="z-index: 11111">
                        <a v-if="!isDepositing" class="btn-theme text-capitalize" >Deposit</a>
                        <img v-else class="loading-icon" src="img/spinner.svg"/>
                      </div>
                      <div @click="handleWithdraw" class="button-text" style="z-index: 11111">
                        <a class="btn-theme text-capitalize" >Withdraw</a>
                      </div>
                    </div>
                </div>
                <div class="d-flex justify-content-around align-items-center" style="border-top: 2px solid #00000033; padding-top: 10px;">
                  <div><b>{{getNetwork().currency}} Price</b>: {{ethPrice}}</div>
                  <div><b>GWei</b>: {{gwei}}</div>
                </div>
              </div>
          </div>
        </div>
    </div>
    <DepositModal 
      :balance="depositModalBalance" 
      :content="'Please input amount to ' + (isDeposit ? 'deposit' : 'withdraw.')"
      :caption="isDeposit ? 'Deposit' : 'Withdraw'"
      :hasTo="!isDeposit"
      :active="depositModalActive"
      @close="depositModalActive=false;"
      :callback="depositModalCallback"
    />

    <alert-modal 
      :title="alertModalTitle"
      :icon="alertModalIcon"
      :active="alertModalActive"
      :content="alertModalContent"
      :btnOk="alertModalBtnOk"
      :callback="alertModalCallback"
      @ok="alertModalActive=false"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from "vuex";
import Utils from '@/helpers/Utils';
import Web3 from '@/helpers/Web3';
import DepositModal from './DepositModal.vue';
import AlertModal from './AlertModal.vue';
import axios from 'axios';

export default {
  name: "InformationList",
  components: {
    DepositModal,
    AlertModal
  },
  computed: {
    ...mapGetters({
      balance: 'balance'
    }),
  },
  watch: {
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  async mounted() {
    this.update();
    this.timer = setInterval(this.update, 3000);
  },
  methods: {
    ...mapActions({
      getEscrowBalance: 'accounts/getEscrowBalance',
      escrowDeposit: 'accounts/escrowDeposit',
      escrowWithdraw: 'accounts/escrowWithdraw',
    }),
    getIcon() {
      const network = Web3.getNetwork();
      return network.currency.toLowerCase();
    },
    getNetwork() {
      return Web3.getNetwork();
    },
    async update() {
      this.escrowBalance = await this.getEscrowBalance();
      const gasPrice = await Web3.getGasPrice();
      // eslint-disable-next-line no-undef
      this.gwei = parseInt(BigInt(gasPrice) / BigInt(10 ** 9));

      const currency = this.getNetwork().currency;
      await axios.get(
        `https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=USD`
      )
      .then(async response => {
        this.ethPrice = response.data.USD;
      });
        
    },
    formatBalance(balance, decimals) {
      return Utils.formatBalance(balance, decimals);
    },
    async executeDeposit(amount, to) {
      this.isDepositing = true;
      try {
        if (parseFloat(amount) == 0) {
          throw new Error('zero amount');
        }
        if (!this.isDeposit && (!to || to == '')) {
          throw new Error('missing to');
        }
        if (this.isDeposit) {
          await this.escrowDeposit(amount);
        } else {
          await this.escrowWithdraw({
            to, 
            amount
          });
        }
        this.depositModalActive = false;
      } catch (e) {
        console.log(e);
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        if (e.message == 'zero amount') {
          this.alertModalContent = 'Amount needs to be more than 0';
        } else if (e.message == 'missing to') {
          this.alertModalContent = 'To address is required to withdraw';
        } else {
          this.alertModalContent = `There was an issue during the ${this.isDeposit ? 'deposit' : 'withdraw'}. Please try again`;
        }
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
      }
      this.isDepositing = false;
    },
    handleDeposit() {
      this.depositModalActive = true;
      this.depositModalBalance = Web3.balance;
      this.isDeposit = true;
      this.depositModalCallback = async (amount, to) => {
        await this.executeDeposit(amount, to);
      };
    },
    handleWithdraw() {
      this.depositModalActive = true;
      this.depositModalBalance = this.escrowBalance;
      this.isDeposit = false;
      this.depositModalCallback = async (amount, to) => {
        await this.executeDeposit(amount, to);
      };
    }
  },
  data() {
    return {
      escrowBalance: 0,
      timer: null,
      isDepositing: false,
      isDeposit: false,
      depositModalActive: false,
      depositModalBalance: 0,
      depositModalCallback: null,
      // Alert Modal
      alertModalTitle: '',
      alertModalIcon: 'success',
      alertModalActive: false,
      alertModalContent: '',
      alertModalBtnOk: '',
      alertModalCallback: null,

      ethPrice: 0,
      gwei: 0
    };
  },
};
</script>

<style scoped>
@media(max-width: 450px) {
  .bg-theme6 {
    padding: 10px !important;
  } 
}

@media(max-width: 420px) {
  .mobile-p {
    padding: 8px !important;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
}

.crystal-text-small {
    font-size: 14px !important;
    color: #C4C4C4 !important;
    text-transform: uppercase !important;
}
</style>