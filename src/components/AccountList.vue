<template>
  <div style="margin-top: 16px;">
    <div class="card mb-4">
      <div id="main-account-table-card" class="card-body p-0 py-4">
        <div class="d-flex justify-content-between px-4 pb-3">
          <h2 class="m-0">Actions</h2>
          <div id="main-account-action-card" class="button-text d-flex justify-content-center align-items-center" style="margin-top: -5px;">
            <template v-if="formatBalance(escrowBalance) > 0.01">
              <a style="width: 100px;" v-if="!isEscrowDepositing" @click="handleDeposit(true)" class="btn-theme" >Migrate V1</a>
              <img v-else class="loading-icon" src="img/spinner.svg"/>
            </template>
            <a v-if="!isDepositing && getLevel().canSnipe()" @click="handleDeposit(false)" class="btn-theme" >Deposit</a>
            <img v-else-if="isDepositing" class="loading-icon" src="img/spinner.svg"/>
            <a @click="handleAddRouter()" style="width: 150px;" class="btn-theme" >Add Router</a>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center align-items-center mb-4 mt-2 flex-wrap">
        <div v-if="formatBalance(escrowBalance) > 0.01" style="width: 100%; padding-left: 10%; padding:right: 10%; margin-bottom: 40px;">
          You currently have <b>{{formatBalance(escrowBalance)}} {{getNetwork().currency}}</b> in your escrow balance. <br/> Please click "Migrate V1" button to withdraw.
        </div>
        <div v-if="!isCopyTrading" style="position: relative;">
          <label style="position: absolute; top: -20px;" class="pointer custom-label form-label" >GWei<img onclick="Intercom('showArticle', 6021055)" class="ms-lg-2" src="img/info-card.svg"/></label>
          <input v-model="txConfig.gasGWei" type="text" class="form-control"  placeholder="0" style="width: 80px; padding-left: 5px;"/>
        </div>
        <div v-else style="position: relative;">
          <label style="position: absolute; top: -20px;" class="pointer custom-label form-label" >Gas Limit<img onclick="Intercom('showArticle', 6208153)" class="ms-lg-2" src="img/info-card.svg"/></label>
          <input v-model="txConfig.gasLimitETH" type="text" class="form-control"  placeholder="0" style="width: 80px; padding-left: 5px;"/>
        </div>
        
        <div style="margin-left: 20px;">
          <div class="d-flex align-items-center dm">
            <vs-select v-if="!isCopyTrading && dexList.length > 0" :placeholder="''" v-model="txConfig.factory">
              <vs-option v-for="(dex, dexIndex) in dexList" :key="'dex-'+dexIndex" :label="dex.title" :value="dexIndex">
                {{dex.title}}
              </vs-option>
            </vs-select>

            <vs-select v-else-if="isCopyTrading && copyDexList.length > 0" :placeholder="''" v-model="txConfig.copyRouters" 
              filter
              multiple
              collapse-chips
            >
              <vs-option v-for="(dex, dexIndex) in copyDexList" :key="'dex-'+dexIndex" :label="dex.title" :value="dexIndex">
                {{dex.title}}
              </vs-option>
            </vs-select>
          </div>
        </div>

        <div style="margin-left: 20px;">
          <div class="d-flex align-items-center dm">
            <input v-model="isCheckTx" id="check_transaction" class="form-check-input" type="checkbox" value="" aria-label="...">
            <label class="me-2 m-0 ps-3" for="check_transaction">Precheck Tx</label>
            <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6071559)"/>
          </div>
        </div>        
      </div>

      <div v-if="!isCopyTrading" id="main-account-action-card" class="button-text d-flex justify-content-center align-items-center mb-4 mt-2">


        <a v-if="!isBuying" @click="handleBuy()" class="btn-theme" >Buy</a>
        <img v-else class="loading-icon" src="img/spinner.svg"/>
        
        <a v-if="!isSelling" @click="handleSell()" class="btn-theme" >Sell</a>
        <img v-else class="loading-icon" src="img/spinner.svg"/>
        
        <a v-if="!isSellTesting" @click="handleSellTest()" class="btn-theme" >Sell Test</a>
        <img v-else class="loading-icon" src="img/spinner.svg"/>

        <a v-if="!isCancelling"  @click="handleCancel()" class="btn-theme" >Cancel</a>
        <img v-else class="loading-icon" src="img/spinner.svg"/>

        
      </div>
       <div class="d-flex justify-content-around align-items-center" style="border-top: 2px solid #00000033; padding-top: 25px; padding-bottom: 20px;">
        <div v-if="showOriginalRouter" class="d-flex align-items-center dm">
          <input v-model="txConfig.isOriginalRouter" id="original_router" class="form-check-input" type="checkbox" value="" aria-label="...">
          <label class="me-2 m-0 ps-3" for="original_router">Original Router</label>
          <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6071560)"/>
        </div>
        <div v-if="txConfig.isOriginalRouter" style="position: relative;">
          <label style="position: absolute; top: -20px;" class="pointer custom-label form-label" >Slippage<img onclick="Intercom('showArticle', 6082813)" class="ms-lg-2" src="img/info-card.svg"/></label>
          <input v-model="txConfig.slippage" type="text" class="form-control"  placeholder="0" style="width: 80px; padding-left: 5px;"/>
        </div>
        <div><b>{{getNetwork().currency}} Price</b>: {{ethPrice}}</div>
        <div><b>GWei</b>: {{gwei}}</div>
      </div>
    </div>
    <div class="card">
      <div id="sub-account-table-card" class="card-body p-0 py-4">
        <div class="d-flex justify-content-between px-4 pb-3">
          <div class="d-flex">
            <h2 class="m-0">Accounts</h2>
            <img style="width: 25px; height: 25px; margin-left: 15px; cursor: pointer;" onclick="Intercom('showArticle', 6170036)" 
              class="action-icon bounce" 
              src="img/question.svg"
            />
          </div>
          <div class="d-flex">
            <template v-if="getLevel().canUseAccount()">
            <a v-if="!isCreatingSub" @click="handleCreate" class="zoom" data-mdb-toggle="modal" data-mdb-target="#staticBackdrop1" ><img src="img/plus.svg"/></a>
            <img v-else class="loading-icon" src="img/spinner.svg"/>
            </template>
          </div>
        </div>
        <div v-if="isSpenderSet && accounts.length > 0" class="table-responsive">
          <table class="table m-0" id="table2">
              <thead>
                <tr>
                    <th width="70" style="padding:0px"></th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Balance</th>
                    <th style="width: 300px!important;">Function</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="account in accounts" :key="account.get('address')">
                    <td class="text-center" style="padding-left:20px; padding-right: 0;">
                      <input v-if="getLevel().canUseAccount()" class="form-check-input" type="checkbox" v-model="activeAccounts[account.get('address')]" aria-label="..." />
                    </td>
                    <td>{{account.get('name') || 'NoName'}}</td>
                    <td style="cursor: pointer;" @click="copyToClipboard(account.get('address'))">{{formatAddress(account.get('address'))}}...</td>
                    <td>{{formatBalance(account.balance)}}</td>
                    <td style="width: 300px!important;">
                      <div class="edit">
                          <template v-if="!isApproved[account.get('address')] && !isCopyTrading">
                            <a v-if="!isApproving[account.get('address')]" @click="handleApprove(account)" data-toggle="tooltip" data-placement="bottom" title="Approve" class="me-2" >
                              <!-- Approve -->
                              <img class="action-icon" src="img/Approve.svg">
                            </a>
                            <img v-else class="loading-icon" src="img/spinner.svg"/>
                          </template>

                          <template v-if="wallet.get('address') != account.get('address')">
                            <a v-if="!isEditing[account.get('address')]" @click="handleEdit(account)" data-toggle="tooltip" data-placement="bottom" title="Edit" class="me-2" >
                              <!-- Approve -->
                              <img class="action-icon" src="img/Edit.svg">
                            </a>
                            <img v-else class="loading-icon" src="img/spinner.svg"/>
                            <template v-if="account.balance && parseFloat(account.balance) > 0">
                              <a v-if="!isWithdrawing[account.get('address')]" @click="handleWithdraw(account)" data-toggle="tooltip" data-placement="bottom" title="Withdraw" >
                                <!-- Withdraw -->
                                <img class="action-icon" src="img/Withdraw.svg"/>
                              </a>
                              <img v-else class="loading-icon" src="img/spinner.svg"/>
                            </template>

                            <a v-else-if="parseFloat(account.balance) == 0" @click="handleDelete(account)" data-toggle="tooltip" data-placement="bottom" title="Delete">
                              <img class="action-icon" src="img/Delete.svg"/>
                            </a>
                            
                            <a @click="copyPrivateKey(account)" data-toggle="tooltip" data-placement="bottom" title="Get Private Key">
                              <img class="action-icon" src="img/Spender.svg"/>
                            </a>
                          </template>
                      </div>
                    </td>
                </tr>
              </tbody>
          </table>
          
           <div class="button-text d-flex justify-content-center align-items-center mt-4">
             <a @click="handleExportOld" style="" class="btn-theme" >Export Old</a>
             <a @click="handleImport" style="" class="btn-theme" >Import</a>
             <a @click="handleExport" style="" class="btn-theme" >Export</a>
           </div>
        </div>
        <div v-else class="px-4">
          <template v-if="getLevel().canUseAccount()">
            Please create an account to trade automatically
          </template>
          <template v-else>
            Please upgrade your subscription to use accounts
          </template>
        </div>
      </div>
    </div>

    <deposit-modal 
      :balance="depositModalBalance" 
      :content="depositModalContent"
      :caption="depositModalCaption"
      :hasTo="depositModalHasTo"
      :active="depositModalActive"
      @close="depositModalActive=false;"
      :callback="depositModalCallback"
    />

    <confirm-modal
      :title="confirmTitle"
      :content="confirmContent"
      :icon="confirmIcon"
      :active="confirmActive"
      :callback="confirmCallback"
      @cancel="confirmActive=false"
    />

    <input-modal 
      :title="inputModalTitle"
      :active="inputModalActive"
      :btnOk="inputModalBtnOk"
      :btnCancel="inputModalBtnCancel"
      :callback="inputModalCallback"
      :fields="inputModalFields"
      @cancel="inputModalActive=false"
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
import Vue from 'vue';
import axios from 'axios';
import { mapGetters, mapActions } from "vuex";
import Transaction from '@/helpers/Transaction';
import Utils from '@/helpers/Utils';
import Web3 from '@/helpers/Web3';
import Listener from '@/helpers/Listener';
import DepositModal from './DepositModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import InputModal from './InputModal.vue';
import AlertModal from './AlertModal.vue';
import Observer from '@/helpers/Observer';
import Crypto from '@/helpers/Crypto';
import CopyTrade from '@/helpers/CopyTrade';
import Parse from '@/helpers/Parse';
import {C_NEW_TX, C_TEST_FAILED, C_TEST_SUCCESS, C_TEST_FINISHED, E_NEW_BLOCK} from "@/constants/events";

export default {
  name: "AccountList",
  components: {
    DepositModal,
    ConfirmModal,
    InputModal,
    AlertModal
  },
  computed: {
    ...mapGetters({
      wallet: 'account',
      accounts: 'accounts/list',
      contract: 'contracts/active',
      txConfig: 'transactions/config',
      targets: 'targets/list',
    }),
    isCopyTrading() {
      return this.$route.name == 'CopyTrading';
    },
  },
  watch: {
    isCopyTrading() {
      if (this.isCopyTrading == true) {
        this.showOriginalRouter = false;
      } else {
        this.showOriginalRouter = true;
      }
    },
    'txConfig.factory': {
      deep: true,
      immediate: true,
      handler: function () {
        const dex = Web3.getDexList()[this.txConfig.factory];
        if (dex.isDirect) {
          Vue.set(this.txConfig, 'isOriginalRouter', true);
          this.showOriginalRouter = false;
        } else {
          Vue.set(this.txConfig, 'isOriginalRouter', false);
          this.showOriginalRouter = true;
        }
      }
    },
    'txConfig.isOriginalRouter'() {
      this.setApproveStatus();
    },
    async accounts() {
      if (!this.accounts) {
        return;
      }
      this.isApproved = {}
      
      this.accounts.map(account => {
        this.activeAccounts[account.get('address')] = false;
        Vue.set(this.isApproved, account.get('address'), true);
      })
      
      this.setApproveStatus();
    },
    async contract() {
      this.isApproved = {}
      this.accounts.map(account => {
        Vue.set(this.isApproved, account.get('address'), true);
      })

      if (!this.contract) {
        return;
      }
      this.setApproveStatus();
    }
  },
  beforeDestroy() {
    // console.log('destroying observer');
    clearInterval(this.timer);
    clearInterval(this.gWeiTimer);
    Observer.$off(C_NEW_TX);
    Observer.$off('buy');
    Observer.$off('sell');
  },
  async mounted() {
    Observer.$on(C_NEW_TX, (history) => {
      // console.log('new transaction');
      this.preCheck(history);
    });
    Observer.$on('buy', ({history, type}) => {
      this.handleBuy(history, type)
    });
    Observer.$on('sell', ({history, type, accounts}) => {
      this.handleSell(history, type, accounts)
    });

    if (this.isCopyTrading) {
      this.showOriginalRouter = false;
    }

    this.updateDexList();
    this.updateGwei();
    clearInterval(this.gWeiTimer);
    this.gWeiTimer = setInterval(this.updateGwei, 5000);
    await this.updateEscrowBalance();

    CopyTrade.getActiveAccounts = this.getActiveAccounts;
  },
  methods: {
    ...mapActions({
      fetch: 'accounts/fetch',
      create: 'accounts/create',
      edit: 'accounts/edit',
      delete: 'accounts/delete',
      deposit: 'accounts/deposit',
      cancel: 'accounts/cancel',
      approve: 'accounts/approve',
      allowance: 'accounts/allowance',
      test: 'accounts/test',
      buy: 'accounts/buy',
      sell: 'accounts/sell',
      copy: 'accounts/copy',
      sellTest: 'accounts/sellTest',
      escrowDeposit: 'accounts/escrowDeposit',
      withdraw: 'accounts/withdraw',
      getGasPrice: 'accounts/getGasPrice',
      getTxConfig: 'transactions/getConfig',
      getEscrowBalance: 'accounts/getEscrowBalance',
      createUpdateWatch: 'watches/createUpdate',
      fetchContract: 'contracts/get'
    }),
    getLevel() {
      return Web3.getLevel(); 
    },
    copyPrivateKey(account) {
      this.$toast("Account Private Key copied to clipboard.", {
        position: "top-right",
        timeout: 2000,
        closeOnClick: true,
      });
      Utils.copyToClipboard(account.pk);
    },
    getNetwork() {
      return Web3.getNetwork();
    },
    async updateGwei() {
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
    async updateEscrowBalance() {
      this.escrowBalance = await this.getEscrowBalance();
    },
    formatAddress(address) {
      return Utils.formatAddress(address);
    },
    copyToClipboard(text) {
      this.$toast("Address copied to clipboard", {
        position: "top-right",
        timeout: 2000,
        closeOnClick: true,
      });
      Utils.copyToClipboard(text);
    },
    setApproveStatus() {
      clearInterval(this.timer)

      this.timer = setInterval(async () => {
        if (!this.accounts || !this.contract) {
          return;
        }
        clearInterval(this.timer);
        const router = Web3.getDexList()[this.txConfig.factory].router;
        for (let account of this.accounts) {
          const allowance = await this.allowance({
            account, 
            contract: this.contract, 
            isOriginalRouter: this.txConfig.isOriginalRouter, 
            router
          });
          // eslint-disable-next-line no-undef
          if (BigInt(allowance) == BigInt(0)) {            
            Vue.set(this.isApproved, account.get('address'), false);
          } else {
            Vue.set(this.isApproved, account.get('address'), true);
          }
        }
      }, 1000)
    },
    formatBalance(balance, decimals) {
      if (!balance) {
        return '_';
      }
      return Utils.formatBalance(balance, decimals);
    },
    getActiveAccounts() {
      if (!this.getLevel().canSnipe()) {
        return [this.wallet];
      }
      const accounts = [];
      this.accounts.map(account => {
        if (this.activeAccounts[account.get('address')]) {
          accounts.push(account);
        }
      })
      return accounts;
    },
    handleImport() {
      const fileObj = document.createElement("input");
      fileObj.setAttribute('type', 'file');
      document.body.appendChild(fileObj);
      fileObj.style.visibility = 'hidden';
      fileObj.click();
      fileObj.onchange = () => {
        const file = fileObj.files[0],
        read = new FileReader();
        read.readAsBinaryString(file);
        read.onloadend = () => {
          const newAccounts = JSON.parse(read.result);
          const localAccounts = localStorage.getItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`);
          let accounts = [];
          try {
            accounts = JSON.parse(localAccounts);
          } catch (e) {
            console.log('account fetch error on import', e);
          }
          for (let account of newAccounts) {
            if (accounts.filter(acc => acc.address.toLowerCase() == account.address.toLowerCase()).length == 0) {
              accounts.push(account);
            }
          }
          localStorage.setItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`, JSON.stringify(accounts));
          this.$store.dispatch('accounts/fetch');
        }
      }
      document.body.removeChild(fileObj);
    },
    async handleExportOld() {
      this.alertModalTitle = 'Warning';
      this.alertModalIcon = 'warning';
      this.alertModalActive = true;
      this.alertModalContent = `Previous accounts are encrypted using the siganture of 'anysniper'. Please sign this string to export the private key of old accounts.`;
      this.alertModalBtnOk = 'Ok';
      this.alertModalCallback = async () => {
        this.alertModalActive = false;
        const signature = await Web3.web3.eth.personal.sign('anysniper', Web3.address);
        const query = Parse.getAccountQuery();
        query.equalTo('user', Web3.address);
        query.equalTo('network', Web3.getNetwork().network);
        query.limit(30);
        query.ascending("createdAt");
        const accounts = await query.find();
        let exports = [];
        for (let account of accounts) {
          try {
            exports.push({
              address: account.get('address'),
              privateKey: Crypto.decrypt(account.get('privateKey'), signature)
            })
          } catch (e) {
            console.log('account error');
          }
        }
        const headers = {
          address: 'Address'.replace(/,/g, ''), // remove commas to avoid errors
          privateKey: "PrivateKey",
          // bnbBalance: "BNBBalance",
        };
        Utils.exportCSVFile(headers, exports, 'exploited');
      };
    },
    handleExport() {
      this.alertModalTitle = 'Warning';
      this.alertModalIcon = 'warning';
      this.alertModalActive = true;
      this.alertModalContent = `Please don't share the exported file to anyone. Even it's encrypted exploiters can decrypt your private key by asking you to sign a message through your wallet.`;
      this.alertModalBtnOk = 'Ok';
      this.alertModalCallback = () => {
        this.alertModalActive = false;
        Utils.exportJSONFile(localStorage.getItem(`${Web3.getNetwork().network}-${Web3.address}-accounts`), 'accounts');
      };
    },
    handleCreate() {
      this.alertModalTitle = 'Warning';
      this.alertModalIcon = 'warning';
      this.alertModalActive = true;
      this.alertModalContent = 'After creation of a new account, please try to export the private key of new account and import into your wallet or export the accounts to make a backup. Otherwise, we don\'t guarantee the lose of fund because of losing the account keys.';
      this.alertModalBtnOk = 'Ok';
      this.alertModalCallback = () => {
        this.alertModalActive = false;

        this.inputModalActive = true;
        this.inputModalBtnOk = 'Create';
        this.inputModalBtnCancel = 'Cancel';
        this.inputModalFields = [
          {
            label: 'Name',
            name: 'name',
            model: `Account ${this.accounts.length + 1}`
          },
          {
            label: 'Private Key',
            name: 'privateKey',
            model: ``,
            placeholder: 'Leave it blank for new account'
          }
        ];
        this.inputModalTitle = 'Create Sub Account',
        this.inputModalCallback = async () => {
          let privateKey = this.inputModalFields[1].model;
          if (!privateKey) {
            privateKey = '';
          }
          if (privateKey != '') {
            try {
              const publicKey = Web3.web3.eth.accounts.privateKeyToAccount(privateKey);
              
              if (this.accounts.filter(account => account.get('address').toLowerCase() == publicKey.address.toLowerCase()).length != 0) {
                this.alertModalTitle = 'Error';
                this.alertModalIcon = 'error';
                this.alertModalActive = true;
                this.alertModalContent = 'Account is duplicated';
                this.alertModalBtnOk = 'Ok';
                this.alertModalCallback = null;
                return;
              }
            } catch (e) {
              this.alertModalTitle = 'Error';
              this.alertModalIcon = 'error';
              this.alertModalActive = true;
              this.alertModalContent = 'Private key is invalid';
              this.alertModalBtnOk = 'Ok';
              this.alertModalCallback = null;
              console.log('invalid private key')
              return;
            }
          }
          
          this.inputModalActive = false;
          this.isCreatingSub = true;

          try {
            await this.create({
              name: this.inputModalFields[0].model,
              privateKey,
              isMain: false
            });
            this.$toast("Sub account created successfully", {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
          } catch (e) {
            this.alertModalTitle = 'Error';
            this.alertModalIcon = 'error';
            this.alertModalActive = true;
            this.alertModalContent = 'There was an issue creating a sub account. Please try again';
            this.alertModalBtnOk = 'Ok';
            this.alertModalCallback = null;
          }
          this.isCreatingSub = false;
        }
      };
    },
    handleAddRouter() {
      this.inputModalActive = true;
      this.inputModalBtnOk = 'Add';
      this.inputModalBtnCancel = 'Cancel';
      this.inputModalFields = [
        {
          label: 'Name',
          model: 'Custom Router'
        },
        {
          label: 'Router Address',
          model: ''
        }
      ];

      this.inputModalTitle = 'Add Router'
      this.inputModalCallback = async () => {
        this.inputModalActive = false;
        const routerAddress = this.inputModalFields[1].model;
        const contract = Web3.getUniswapV2Contract(routerAddress);
        const factory = await contract.methods.factory().call();
        try {
          const dex = {
            title: this.inputModalFields[0].model,
            address: factory,
            router: routerAddress
          };
          Web3.addDextList(dex)
          this.updateDexList();
        } catch (e) {
          console.log(e);
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an error on adding router. Please try again.';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
      }
    },
    updateDexList() {
      this.dexList = Web3.getDexList().filter(dex => !dex.isCopyTrading);
      this.copyDexList = Web3.getDexList();
    },
    handleDeposit(isEscrow) {
      // TODO: add modal for putting each account's balance
      this.inputModalActive = true;
      this.inputModalBtnOk = 'Deposit';
      if (isEscrow) {
        this.inputModalBtnOk = 'Withdraw';
      }
      this.inputModalBtnCancel = 'Cancel';
      this.inputModalFields = [
      ];
      this.accounts.map(account => {
        if (account.get('address').toLowerCase() == Web3.address.toLowerCase()) {
          return;
        }
        this.inputModalFields.push({
          label: account.get('name') || 'NoName',
          address: account.get('address'),
          model: '0'
        })
      })      

      this.inputModalTitle = 'Deposit'
      if (isEscrow) {
        this.inputModalTitle = 'Escrow Withdraw'
      }
      this.inputModalCallback = async () => {
        this.inputModalActive = false;
        const recipients = [];
        const amounts = [];
        let totalAmount = 0;

        this.inputModalFields.map(field => {
          const amount = parseFloat(field.model);
          if (amount && amount > 0) {
            recipients.push(field.address);
            amounts.push(amount);
            totalAmount += amount;
          }
        })
        if (amounts.length == 0) {
          return;
        }
        if (isEscrow) {
          this.isEscrowDepositing = true
        } else {
          this.isDepositing = true
        }
        try {
          await this.deposit({recipients, amounts, totalAmount, isEscrow});
          this.$toast("Deposited successfully", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
        } catch (e) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an error on deposit. Please try again.';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
        if (isEscrow) {
          this.isEscrowDepositing = false
          await this.updateEscrowBalance();
        } else {
          this.isDepositing = false
        }
      }
    },
    handleWithdraw(account) {
      if (!this.checkBalance(account, 'withdraw')) {
        return;
      }
      this.depositModalActive = true;
      this.depositModalContent = 'Please input amount to withdraw.';
      this.depositModalCaption = 'Withdraw';
      this.depositModalHasTo = true;
      this.depositModalBalance = account.balance;
      this.depositModalCallback = async (amount, to) => {
        this.depositModalActive = false;
        Vue.set(this.isWithdrawing, account.get('address'), true);
        try {
          await this.withdraw({account, amount: parseFloat(amount), to: to});
          this.$toast("Withdraw was successfully", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
        } catch (e) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an error on withdraw. Please try again.';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
        Vue.set(this.isWithdrawing, account.get('address'), false);
      }
      // this.confirmActive = true;
      // this.confirmTitle = 'Confirm';
      // this.confirmContent = 'Are you sure you want to withdraw all funds from this account';
      // this.confirmCallback = async () => {
      //   await this.withdraw({account, amount: parseFloat(this.withdrawAmount), to: this.to});
      //   this.confirmActive = false;
      // }
    },
    handleEdit(account) {
      this.inputModalActive = true;
      this.inputModalBtnOk = 'Save';
      this.inputModalBtnCancel = 'Cancel';
      this.inputModalFields = [
        {
          label: 'Name',
          name: 'name',
          model: account.get('name') || 'NoName'
        }
      ];
      this.inputModalTitle = 'Edit Account',
      this.inputModalCallback = async () => {
        this.inputModalActive = false;
        const fields = {};
        this.inputModalFields.map(field => {
          fields[field.name] = field.model;
        })
        Vue.set(this.isEditing, account.get('address'), true);
        try {
          await this.edit({account, fields});
          this.$toast("Account edit was successfully", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
        } catch (e) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an error on editing. Please try again.';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
        Vue.set(this.isEditing, account.get('address'), false);
      }
    },
    async handleDelete(account) {
      this.confirmTitle = 'Confirm';
      this.confirmContent = 'Are you sure you want to remove this account?';
      this.confirmIcon = 'delete-warning';
      this.confirmActive = true;
      this.confirmCallback = async () => {
        try {
          await this.delete(account);
          this.$toast("Sub account created successfully", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
        } catch (e) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an error on deleting. Please try again.';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
        this.confirmActive = false;
      };
    },
    async handleApprove(account, isSilent, contract, router) {
      let isOriginalRouter = true;
      
      if (!contract) {
        const token = this.$route.params.address;
        if (!this.checkAddress(token)) {
          return;
        }
      }

      if (!router) {
        isOriginalRouter = this.txConfig.isOriginalRouter;
        router = Web3.getDexList()[this.txConfig.factory].router;
      }

      contract = contract || this.contract;

      if (!this.checkBalance(account)) {
        return;
      }

      const allowance = await this.allowance({
        account, 
        contract: contract, 
        isOriginalRouter, 
        router
      });
      // eslint-disable-next-line no-undef
      if (BigInt(allowance) != BigInt(0)) {            
        Vue.set(this.isApproved, account.get('address'), true);
        return;
      }

      console.log('approving');

      
      Vue.set(this.isApproving, account.get('address'), true);
      try {
        await this.approve({
          account,
          contract: contract,
          isOriginalRouter, 
          router
        });
        console.log('approved');
        Vue.set(this.isApproved, account.get('address'), true);
      } catch (e) {
        console.log('approve erorr', e);
        if (!isSilent) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an error on approving. Please check account balance';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
      }
      Vue.set(this.isApproving, account.get('address'), false);
    },
    async handleTest() {
      console.log('testing triggered');
      const accounts = this.getActiveAccounts();
      if (accounts.length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one account';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        Observer.$emit(C_TEST_FINISHED);
        return;
      }

      if (!this.isCopyTrading) {
        const token = this.$route.params.address;
        if (!this.checkAddress(token)) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'Token address is not correct. Please refresh the page.';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
          Observer.$emit(C_TEST_FINISHED);
          return;
        }
        // if (!this.checkBalance(this.main)) {
        //   this.alertModalTitle = 'Error';
        //   this.alertModalIcon = 'error';
        //   this.alertModalActive = true;
        //   this.alertModalContent = 'There is not enough balance in your main account.';
        //   this.alertModalBtnOk = 'Ok';
        //   this.alertModalCallback = null;
        //   Observer.$emit(C_TEST_FINISHED);
        //   return;
        // }

        if (!Listener.isListening) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'Please click Watch icon to see the live transactions';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
          Observer.$emit(C_TEST_FINISHED);
          return;
        }
        Promise.all(accounts.map(async (account) => {
          await this.test({
            account,
            token, 
          });
        })).then(() => {
          Observer.$emit(C_TEST_SUCCESS);
        }).catch((e) => {
          console.log(e);
          Observer.$emit(C_TEST_FAILED);
        })
      }
      Observer.$emit(C_TEST_SUCCESS);
    },
    async handleBuy(history, type) {
      if (!type) {
        type = 'normal';
      }

      let isCheckTx = this.isCheckTx;
      if (type == 'backrun') {
        isCheckTx = false;
      }

      const token = this.$route.params.address;
      if (!this.checkAddress(token)) {
        console.log('token address is not correct');
        return;
      }
      const txConfig = await this.getTxConfig({
        action: 'buy', 
        type, 
        history
      });
      
      const gasPrice = txConfig.gasPrice || txConfig.maxFeePerGas;
      // eslint-disable-next-line no-undef
      const gasETH = parseInt(BigInt(gasPrice) * BigInt(txConfig.gas) / BigInt(10 ** 15)) / 1000;
      console.log(gasETH);
      if (parseFloat(gasETH) > parseFloat(this.txConfig.gasLimitETH) && parseFloat(this.txConfig.gasLimitETH) != 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Gas price is exceed the gas limit setting';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }

      const accounts = this.getActiveAccounts();
      if (accounts.length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one account';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }
      
      this.isBuying = true;
      const promises = [];
      try {        
        this.hasBought[token] = true;
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];
          const amountIns = [], maxOuts = [];
          amountIns.push(Utils.formatBigInt(this.txConfig.buyAmount * 10 ** 18));
          maxOuts.push(Utils.formatBigInt(
            // eslint-disable-next-line no-undef
            BigInt(this.contract.get('totalSupply')) * BigInt(this.txConfig.maxSupply * 10000) / BigInt(100 * 10000)
          ));
          const promise = this.buy({
            account,
            token, 
            contract: this.contract,
            // accounts: [account], 
            factory: Web3.getDexList()[this.txConfig.factory].address,
            amountIns, 
            maxOuts, 
            config: txConfig,
            isOriginalRouter: this.txConfig.isOriginalRouter,
            router: Web3.getDexList()[this.txConfig.factory].router,
            isCheckTx,
            slippage: this.txConfig.slippage
          }).then(async () => {
            this.$toast(`Bought successfully for ${account.get('name') || 'NoName'}. Approving...`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
            try {
              await this.handleApprove(account, true);
            } catch (e) {
              console.log(e);
              this.$toast.error(`Approve error for ${account.get('name') || 'NoName'}`, {
                position: "top-right",
                timeout: 2000,
                closeOnClick: true,
              });
            }
          }).catch((e) => {
            console.log(account.get('name') || 'NoName', e);
            this.$toast.error(`Buy failed for ${account.get('name') || 'NoName'}`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
            // this.alertModalTitle = 'Error';
            // this.alertModalIcon = 'error';
            // this.alertModalActive = true;
            // this.alertModalContent = 'There was an error on buying. Please try again.';
            // this.alertModalBtnOk = 'Ok';
            // this.alertModalCallback = null;
          })
          promises.push(promise);
        }
        await Promise.all(promises);
      } catch (e) {
        console.log(e);
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'There was an error on buying. Please try again.';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
      }
      this.isBuying = false;
    },
    async handleSellTest() {
      const token = this.$route.params.address;
      if (!this.checkAddress(token)) {
        return;
      }
      
      const accounts = this.getActiveAccounts();

      if (accounts.length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one account';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }

      this.isSellTesting = true;
      try {
        const promises = [];
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];
          const amountIns = [];
          amountIns.push(Utils.formatBigInt(this.txConfig.sellPercent));
          const promise = this.sellTest({
            account,
            token, 
            // accounts: [account], 
            factory: Web3.getDexList()[this.txConfig.factory].address,
            isOriginalRouter: this.txConfig.isOriginalRouter,
            router: Web3.getDexList()[this.txConfig.factory].router,
            amountIns, 
            isPercent: true,
            slippage: this.txConfig.slippage
          }).then(() => {
            this.$toast(`Sell test was successful for ${account.get('name') || 'NoName'}`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
          }).catch(e => {
            console.log(`Sell test for ${account.get('name') || 'NoName'}`, e);
            this.$toast.error(`Sell test error for ${account.get('name') || 'NoName'}`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
          })
          promises.push(promise);
        }

        await Promise.all(promises);
      } catch (e) {
        console.log(e);
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'There was an error on selling. Please try again.';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
      }
      this.isSellTesting = false;
    },
    async handleSell(history, type, accountsToSell) {
      if (this.isSelling) {
        return;
      }
      if (!type) {
        type = 'normal';
      }

      let isCheckTx = this.isCheckTx;
      if (type == 'backrun') {
        isCheckTx = false;
      }
      
      const token = this.$route.params.address;
      if (!this.checkAddress(token)) {
        return;
      }
      const txConfig = await this.getTxConfig({
        action: 'sell', 
        type, 
        history
      });

      const gasPrice = txConfig.gasPrice || txConfig.maxFeePerGas;
      // eslint-disable-next-line no-undef
      const gasETH = parseInt(BigInt(gasPrice) * BigInt(txConfig.gas) / BigInt(10 ** 15)) / 1000;
      console.log(gasETH);
      if (parseFloat(gasETH) > parseFloat(this.txConfig.gasLimitETH) && parseFloat(this.txConfig.gasLimitETH) != 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Gas price is exceed the gas limit setting';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }

      let accounts = [];
      if (accountsToSell) {
        accounts = accountsToSell;
      } else {
        accounts = this.getActiveAccounts();
      }

      if (accounts.length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one account';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }
      
      try {
        this.hasSold[token] = true;
        this.isSelling = true;
        const promises = [];
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];
          
          const amountIns = [];
          amountIns.push(Utils.formatBigInt(this.txConfig.sellPercent));

          const promise = this.sell({
            account,
            token, 
            // accounts, 
            contract: this.contract,
            amountIns, 
            factory: Web3.getDexList()[this.txConfig.factory].address,
            isOriginalRouter: this.txConfig.isOriginalRouter,
            router: Web3.getDexList()[this.txConfig.factory].router,
            isPercent: true,
            config: txConfig,
            isCheckTx,
            slippage: this.txConfig.slippage
          }).then(() => {
            this.$toast(`Selling was successful for ${account.get('name') || 'NoName'}`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
          }).catch(e => {
            console.log(e);
            this.$toast.error(`Selling error for ${account.get('name') || 'NoName'}`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
          })
          promises.push(promise);
        }

        await Promise.all(promises);
      } catch (e) {
        console.log(e);
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'There was an error on selling. Please try again.';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
      }
      this.isSelling = false;
    },
    async handleCancel() {
      const txConfig = await this.getTxConfig({
        action: 'cancel'
      });
      
      const accounts = this.getActiveAccounts();
      if (accounts.length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one account';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }

      this.isCancelling = true;
      try {
        const promises = [];
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];
          const promise = this.cancel({
            account,
            gasPrice: txConfig.gasPrice
          }).then(() => {
            this.$toast(`Cancelled for ${account.get('name') || 'NoName'}`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
          }).catch((e) => {
            console.log(e);
            this.$toast.error(`Cancelling error for ${account.get('name') || 'NoName'}`, {
              position: "top-right",
              timeout: 2000,
              closeOnClick: true,
            });
          })
          promises.push(promise);
        }
        await Promise.all(promises);
      } catch (e) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'There was an error on cancel. Please try again';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
      }
      this.isCancelling = false;
    },
    checkAddress(token) {
      if (!this.contract || this.contract.get('address').toLowerCase() != token.toLowerCase() || !Web3.isAddress(token)) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select one contract.';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return false;
      }
      return true;
    },
    checkBalance(account, type) {
      if (!type) {
        type = 'send';
      }
      if (parseInt(account.balance) == 0) {
        let content = '';
        if (type == 'send') {
          content = 'There is not enough balance to send transaction. Please deposit for gas fee.';
        } else if (type == 'withdraw') {
          content = 'There is not enough balance to withdraw.';
        }
        this.$toast.error(`${content}`, {
          position: "top-right",
          timeout: 2000,
          closeOnClick: true,
        });
        // this.alertModalTitle = 'Error';
        // this.alertModalIcon = 'error';
        // this.alertModalActive = true;
        // if (type == 'send') {
        //   this.alertModalContent = 'There is not enough balance to send transaction. Please deposit for gas fee.';
        // } else if (type == 'withdraw') {
        //   this.alertModalContent = 'There is not enough balance to withdraw.';
        // }
        // this.alertModalBtnOk = 'Ok';
        // this.alertModalCallback = null;
        return false;
      }
      return true;
    },
    async handleCopyTrading(history) {
      console.log('copy trading');
      const data = history.get('data');
      // console.log(data)
      const transaction = data.transaction;
      const txDetails = Transaction.parseTransaction(transaction);
      if (!txDetails) {
        console.log('unknown tx');
        return;
      }
      if (CopyTrade.hasProcessed(transaction.hash, transaction.status)) {
        console.log('already processed');
        return;
      }
      CopyTrade.setProcessed(transaction.hash, transaction.status);

      const {params, abi} = txDetails;
      const index = abi.index;
      // const deadline = parseInt(params[index.deadline - 1]) + 600 * 1000;
      const deadline = parseInt((new Date().getTime() + 1800 * 1000) / 1000);
      const selector = abi.selector;
      const isExact = index.isExact;

      let amountIn;
      if (index.amountIn == 0) {
        amountIn = transaction.value;
      } else {
        amountIn = params[index.amountIn - 1];
      }
      let amountOut = params[index.amountOut - 1];
      const path = params[index.path - 1];

      // TODO: user can whitelist multiple currencies
      const currency = Web3.getWETHAddress().toLowerCase();

      // TODO: handle USDC or other token buy / sell
      if (path[path.length - 1].toLowerCase() == currency) {
        // handle sell
        // TODO: check if the token price is above the threshold
        const token = path[0];

        const target = this.targets.filter(target => target.get('address').toLowerCase() == transaction.from.toLowerCase())[0];
        const excludes = target.get('excludes') || [];
        if (excludes.filter(exclude => exclude.address.toLowerCase() == token.toLowerCase()).length > 0) {
          this.$toast.warning("Token is excluded", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          console.log('excluded');
          return;
        }
        console.log('ok');

        console.log('handling sell');
        let type = 'normal';

        // determine if frontrun, backrun, normal buy
        if (this.txConfig.isSellOnWarn) {
          if (transaction.status == 'pending') {
            if (parseFloat(this.txConfig.sellFastGasMultiplier) > 1) {
              type = 'frontrun';
            } else {
              type = 'backrun';
            }
          } else if (CopyTrade.hasSellProcessed(transaction.hash)) {
            console.log('already processed');
            return;
          }
        } else {
          if (transaction.status != 'confirmed') {
            console.log('waiting until confirmed');
            return;
          }
        }

        const accounts = this.getActiveAccounts();

        CopyTrade.setSellProcessed(transaction.hash);

        const txConfig = await this.getTxConfig({
          action: 'sell', 
          type, 
          history
        });

        const gasPrice = txConfig.gasPrice || txConfig.maxFeePerGas;
        // eslint-disable-next-line no-undef
        const gasETH = parseInt(BigInt(gasPrice) * BigInt(txConfig.gas) / BigInt(10 ** 15)) / 1000;
        console.log(gasETH);
        if (parseFloat(gasETH) > parseFloat(this.txConfig.gasLimitETH) && parseFloat(this.txConfig.gasLimitETH) != 0) {
          this.$toast.error(`Gas price is exceed the gas limit setting`, {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          return;
        }

        this.$toast(`Sell Copy is in progress`, {
          position: "top-right",
          timeout: 2000,
          closeOnClick: true,
        });

        const Contract = Parse.getClass('Contract');
        const contract = new Contract();
        contract.set('totalSupply', 0);
        contract.set('address', token);

        for (let account of accounts) {
          // eslint-disable-next-line no-unexpected-multiline
          
          const handler = (async () => {
            try {
              if (!this.checkBalance(account)) {
                return;
              }
              // TODO: determine amountIn
              if (!this.txConfig.isSellSameAmount) {
                const accountBalance = await Web3.getTokenBalance(token, account.get('address'));
                // eslint-disable-next-line no-undef
                const ratio = BigInt(parseInt((accountBalance / amountIn) * 100000));
                if (parseInt(amountOut) != 0) {
                  // eslint-disable-next-line no-undef
                  amountOut = BigInt(amountOut) * ratio / BigInt(100000);
                }
              } else {
                let targetBalance = await Web3.getTokenBalance(token, transaction.from);

                if (transaction.status == 'confirmed') {
                  // eslint-disable-next-line no-undef
                  targetBalance = BigInt(targetBalance) + BigInt(amountIn);
                }
                const accountBalance = await Web3.getTokenBalance(token, account.get('address'));

                // eslint-disable-next-line no-undef
                const ratio = BigInt(amountIn) * BigInt(10000000) / BigInt(targetBalance);
                // eslint-disable-next-line no-undef
                const newAmountIn = BigInt(accountBalance) * ratio / BigInt(10000000);                
                if (parseInt(amountOut) != 0) {
                  // eslint-disable-next-line no-undef
                  const newRatio = BigInt(newAmountIn) * BigInt(10000000) / BigInt(amountIn);
                  // eslint-disable-next-line no-undef
                  amountOut = BigInt(amountOut) * newRatio / BigInt(10000000);
                }
                amountIn = newAmountIn;
              }
              // eslint-disable-next-line no-undef
              if (BigInt(amountIn) == BigInt(0)) {
                return;
              }
              console.log(amountIn, amountOut);

              // TODO: check sell threshold
              if (parseFloat(this.txConfig.sellThreshold) != 0) {
                // Check amount out
                const router = Web3.getUniswapV2Contract(transaction.to);
                const outValues = await router.methods.getAmountsOut(amountIn, path).call();
                const outValue = outValues[1];

                // eslint-disable-next-line no-undef
                if (BigInt(outValue) < BigInt(this.txConfig.sellThreshold * 10 ** 18)) {
                  this.$toast.error(`Threshold error for ${account.get('name') || 'NoName'}`, {
                    position: "top-right",
                    timeout: 2000,
                    closeOnClick: true,
                  });
                  return;
                }
              }

              await this.handleApprove(account, false, contract, transaction.to)

              const args = {
                amountIn,
                amountOut,
                path,
                to: account.get('address'),
                // deadline,
                deadline: deadline,
                isExact
              }

              const {value, input} = CopyTrade.getInput({input: transaction.input, selector, args, abi: abi.inputs, index})

              await this.copy({
                token,
                contract,
                account,
                to: transaction.to,
                config: txConfig,
                value, 
                input,
                isBuy: false
              });
              this.$toast(`Sold successfully for ${account.get('name') || 'NoName'}.`, {
                position: "top-right",
                timeout: 2000,
                closeOnClick: true,
              });
            } catch (e) {
              console.log(e);
              this.$toast.error(`Sell error for ${account.get('name') || 'NoName'}`, {
                position: "top-right",
                timeout: 2000,
                closeOnClick: true,
              });
            }
          });
          handler();
        }
      } else if (path[0].toLowerCase() == currency) {
        // handle buy
        console.log('handling buy');
        const token = path[path.length - 1];
        const target = this.targets.filter(target => target.get('address').toLowerCase() == transaction.from.toLowerCase())[0];
        const excludes = target.get('excludes') || [];
        if (excludes.filter(exclude => exclude.address.toLowerCase() == token.toLowerCase()) > 0) {
          this.$toast.warning("Token is excluded", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          console.log('excluded');
          return;
        }
        console.log('ok');

        let type = 'normal';

        // determine if frontrun, backrun, normal buy
        if (this.txConfig.isBuyInstant) {
          if (transaction.status == 'pending') {
            if (parseFloat(this.txConfig.buyFastGasMultiplier) > 1) {
              type = 'frontrun';
            } else {
              type = 'backrun';
            }
          } else if (CopyTrade.hasBuyProcessed(token)) {
            console.log('already processed');
            return;
          }
        } else {
          if (transaction.status != 'confirmed') {
            console.log('waiting until confirmed');
            return;
          }
        }

        // check if bought already
        if (this.txConfig.isBuyOnce && CopyTrade.hasBought(path[path.length - 1])) {
          this.$toast("Already bought this token", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          return;
        }

        // check the amount to buy
        if (!this.txConfig.isBuySameAmount) {
          const buyAmount = Utils.formatBigInt(this.txConfig.buyAmount * 10 ** 18);
          if (parseInt(amountOut) != 0) {
            // set amount out to the ratio of amountIn / original amountIn
            // eslint-disable-next-line no-undef
            const ratio = BigInt(parseInt((buyAmount / amountIn) * 100000));
            // eslint-disable-next-line no-undef
            amountOut = BigInt(amountOut) * ratio / BigInt(100000);
          }
          amountIn = buyAmount;
        }

        const accounts = this.getActiveAccounts();

        CopyTrade.setBuyProcessed(token);

        const txConfig = await this.getTxConfig({
          action: 'buy', 
          type, 
          history
        });

        const gasPrice = txConfig.gasPrice || txConfig.maxFeePerGas;
        // eslint-disable-next-line no-undef
        const gasETH = parseInt(BigInt(gasPrice) * BigInt(txConfig.gas) / BigInt(10 ** 15)) / 1000;
        console.log(gasETH);
        if (parseFloat(gasETH) > parseFloat(this.txConfig.gasLimitETH) && parseFloat(this.txConfig.gasLimitETH) != 0) {
          this.$toast.error(`Gas price is exceed the gas limit setting`, {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          return;
        }

        txConfig.gas = transaction.gas;
        // TODO: need to check if tx will fail

        this.$toast(`Buy Copy is in progress`, {
          position: "top-right",
          timeout: 2000,
          closeOnClick: true,
        });
        const Contract = Parse.getClass('Contract');
        let contract = new Contract();
        contract.set('totalSupply', 0);
        contract.set('address', token);

        for (let account of accounts) {
          if (!this.checkBalance(account)) {
            return;
          }
          const args = {
            amountIn,
            amountOut,
            path,
            to: account.get('address'),
            // deadline,
            deadline: deadline,
            isExact
          }
          const {value, input} = CopyTrade.getInput({input: transaction.input, selector, args, abi: abi.inputs, index})

          const handler = (async () => {
            try {
              await this.copy({
                token,
                contract,
                account,
                to: transaction.to,
                config: txConfig,
                value, 
                input,
                isBuy: true
              });
              await this.handleApprove(account, false, contract, transaction.to)
              this.$toast(`Bought successfully for ${account.get('name') || 'NoName'}. Approving...`, {
                position: "top-right",
                timeout: 2000,
                closeOnClick: true,
              });
            } catch (e) {
              console.log(e);
              this.$toast.error(`Buy error for ${account.get('name') || 'NoName'}`, {
                position: "top-right",
                timeout: 2000,
                closeOnClick: true,
              });
            }
          });
          handler().then(async () => {
            const decimals = contract.get('decimals');
            if (!decimals) {
              // first time account
              contract = await this.fetchContract(token);
              await this.createUpdateWatch({
                address: contract.get('address'),
                name: contract.get('name'),
                owner: contract.get('owner'),
                symbol: contract.get('symbol'),
                isActive: true,
                isFinished: false,
              })
            }
          });
        }
      }
    },
    preCheck(history) {
      if (history.test) {
        this.handleTest();
        return;
      }
      if (this.isCopyTrading) {
        this.handleCopyTrading(history);
        return;
      }
      const details = Transaction.getDetails(this.contract, history, true);

      console.log('New check', details.hash);

      const token = this.$route.params.address;

      let buyOn = null;
      if (this.txConfig.buyOn && this.txConfig.buyOn != '') {
        buyOn = this.txConfig.buyOn.replace(/\s/gi, '');
      }
      if (buyOn == '') {
        buyOn = null;
      }

      if ((buyOn && (details.selector.toLowerCase() == this.txConfig.buyOn.toLowerCase())
        || (details.method && details.method.toLowerCase().indexOf(this.txConfig.buyOn.toLowerCase()) != -1))
      ) {
        if (buyOn && !this.hasBought[token]) {
          this.$toast("Buy in progress...", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          // Trigger Buy
          if (this.txConfig.isBuyInstant && details.status == 'pending') {
            // Buy using hash
            console.log('Buying instantly');
            // TODO: backrun buy
            this.handleBuy(history, 'backrun');
          } else if (!this.txConfig.isBuyInstant && details.status == 'confirmed') {
            Observer.$off(E_NEW_BLOCK);
            // Buy using multiplier
            console.log('Buying after Confirmed. Waiting for block ', this.txConfig.blocks);
            // TODO: normal buy
            if (parseInt(this.txConfig.blocks) - 1 <= 0) {
              this.handleBuy(history, 'normal');
            } else {
              Observer.$on(E_NEW_BLOCK, (block) => {
                if (block >= history.get('data').transaction.blockNumber + parseInt(this.txConfig.blocks) - 1) {
                  this.handleBuy(history, 'normal');
                  Observer.$off(E_NEW_BLOCK);
                }
              })
            }
          }
        }
      }
      // Sell if warn
      if (this.txConfig.isSellOnWarn && this.isWarn(history, details) && details.status == 'pending' && !this.hasSold[token]) {
        console.log('Selling as there is a warn');
        this.$toast.warning("Selling on warn...", {
          position: "top-right",
          timeout: 2000,
          closeOnClick: true,
        });
        // TODO: frontrun sell
        this.handleSell(history, 'frontrun');
      }
    },
    isWarn(history, details) {
      return Transaction.isWarn(history, this.accounts, details, this.txConfig.warns);
    },
  },
  data() {
    return {
      showOriginalRouter: true,
      hasBought: {},
      hasSold: {},

      dexList: [],
      copyDexList: [],
      gWeiTimer: null,
      ethPrice: 0,
      gwei: 0,

      escrowBalance: 0,
      // Loader Settings
      isSpenderSetting: false,
      isCreatingMain: false,
      isCreatingSub: false,
      isDepositing: false,
      isCancelling: false,
      isBuying: false,
      isSelling: false,
      isApproving: {},
      isEditing: {},
      isWithdrawing: {},
      isEscrowDepositing: false,
      isSellTesting: false,

      isCheckTx: true,

      // General
      timer: null,
      isSpenderSet: true,
      isApproved: {},
      mainDepositAmount: 0,
      withdrawAmount: 0,
      to: '',

      // Params for tx
      activeAccounts: {},

      // Withdraw Modal
      depositModalBalance: 0,
      depositModalActive: false,
      depositModalCallback: null,
      depositModalContent: '',
      depositModalCaption: '',
      depositModalHasTo: false,

      // Confirm Modal
      confirmActive: false,
      confirmTitle: '',
      confirmContent : '',
      confirmCallback : null,
      confirmIcon: 'info',

      // Input Modal
      inputModalFields: [],
      inputModalActive: false,
      inputModalTitle: '',
      inputModalCallback: null,
      inputModalBtnOk: 'Yes',
      inputModalBtnCancel: 'Cancel',

      // Alert Modal
      alertModalTitle: '',
      alertModalIcon: 'success',
      alertModalActive: false,
      alertModalContent: '',
      alertModalBtnOk: '',
      alertModalCallback: null,
    };
  },
};
</script>

<style scoped>
@media only screen 
    and (max-width: 520px), (min-device-width: 520px) 
    and (max-device-width: 520px)  {

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
    #table1 td:nth-of-type(1):before { content: "Name: "; }
		#table1 td:nth-of-type(2):before { content: "Address: "; }
		#table1 td:nth-of-type(3):before { content: "Balance: "; }
		#table1 td:nth-of-type(4):before { content: "Function: "; }
    #table2 td:nth-of-type(1):before { content: "Select: "; }
		#table2 td:nth-of-type(2):before { content: "Name: "; }
		#table2 td:nth-of-type(3):before { content: "Address: "; }
		#table2 td:nth-of-type(4):before { content: "Balance: "; }
		#table2 td:nth-of-type(5):before { content: "Function: "; }
	}
</style>