<template>
  <div style="margin-top: 16px;">
    <div class="card">
      <div id="sub-account-table-card" class="card-body p-0 py-4">
        <div class="d-flex justify-content-between px-4 pb-3">
          <h2 class="m-0">Targets</h2>
          <div class="d-flex">
            <!-- <a v-if="!isWatch" style="width: 30px; margin-right: 20px;" @click="handleSimulate" class="zoom">Simulate</a> -->
            <template v-if="getLevel().canCopyTrade()">
            <a v-if="!isWatch" style="width: 30px; margin-right: 20px;" @click="handleWatch" class="zoom"><img src="img/watch.svg"/></a>
            <a v-else style="width: 30px; margin-right: 20px;" @click="handleWatch" class="zoom"><img src="img/unwatch.svg"/></a>
            </template>

            <a v-if="!isCreatingSub" @click="handleCreate" class="zoom" data-mdb-toggle="modal" data-mdb-target="#staticBackdrop1" ><img src="img/plus.svg"/></a>
            <img v-else class="loading-icon" src="img/spinner.svg"/>
          </div>
        </div>
        <div v-if="targets.length > 0" class="table-responsive">
          <table class="table m-0" id="table2">
              <thead>
                <tr>
                    <th width="70" style="padding:0px"></th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Balance</th>
                    <th>Function</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="target in targets" :key="target.id">
                    <td class="text-center" style="padding-left:20px; padding-right: 0;">
                      <input class="form-check-input" type="checkbox" v-model="activeTargets[target.get('address')]" aria-label="..." />
                    </td>
                    <td>{{target.get('name') || 'NoName'}}</td>
                    <td style="cursor: pointer;" @click="copyToClipboard(target.get('address'))">{{formatAddress(target.get('address'))}}...</td>
                    <td>{{formatBalance(target.balance)}}</td>
                    <td>
                      <div class="edit">
                          <a v-if="!isEditing[target.get('address')]" @click="handleEdit(target)" data-toggle="tooltip" data-placement="bottom" title="Edit" class="me-2" >
                            <!-- Approve -->
                            <img class="action-icon" src="img/Edit.svg">
                          </a>
                          <img v-else class="loading-icon" src="img/spinner.svg"/>
                          
                          <a @click="handleDelete(target)" data-toggle="tooltip" data-placement="bottom" title="Delete">
                            <img class="action-icon" src="img/Delete.svg"/>
                          </a>
                          <a @click="handleEditExclude(target)" data-toggle="tooltip" data-placement="bottom" title="Edit Excludes" style="margin-left: 5px;">
                            <img class="action-icon" src="img/exclude.png"/>
                          </a>
                      </div>
                    </td>
                </tr>
              </tbody>
                  
          </table>
          <div v-if="!getLevel().canCopyTrade()" class="p-1 d-flex justify-content-center">
            Please purchase more $SNIPE to use this feature.
          </div>
          <div v-else class="p-4 d-flex justify-content-center">
            You can set exclusion tokens on a per-account basis by clicking the Exclusions icon next to the Delete button. Click Watch to activate CopyTrading.
          </div>
        </div>
        <div v-else class="px-4">
          Please create a target to copy trading
        </div>
      </div>
    </div>

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

    <edit-trigger-modal
      :callback="editTriggerModalCallback"
      :active="editTriggerModalActive"
      :templates="templates"
      :target="editTriggerModalTarget"
      @cancel="editTriggerModalActive=false"
    />
    <ExcludeModal 
      :active="excludeModalActive"
      @close="excludeModalActive=false"
      :target="activeTarget"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import Utils from '@/helpers/Utils';
import Web3 from '@/helpers/Web3';
import ConfirmModal from '@/components/ConfirmModal.vue';
import InputModal from '@/components/InputModal.vue';
import AlertModal from '@/components/AlertModal.vue';
import EditTriggerModal from './EditTriggerModal.vue';

import Listener from '@/helpers/Listener';
import CopyTrade from '@/helpers/CopyTrade';

import Observer from '@/helpers/Observer';
import Parse from '@/helpers/Parse';
import {C_NEW_TX} from "@/constants/events";
import ExcludeModal from './ExcludeModal.vue';

export default {
  name: "TargetList",
  components: {
    ConfirmModal,
    InputModal,
    AlertModal,
    EditTriggerModal,
    ExcludeModal
  },
  computed: {
    ...mapGetters({
      targets: 'targets/list',
      templates: 'targets/templates',
      txConfig: 'transactions/config'
    }),
  },
  watch: {
  },
  beforeDestroy() {
    Listener.stop();
  },
  async mounted() {
    // await this.fetchTemplate();
    await this.fetch();
  },
  methods: {
    ...mapActions({
      fetchTemplate: 'targets/fetchTemplate',
      fetch: 'targets/fetch',
      create: 'targets/create',
      edit: 'targets/edit',
      delete: 'targets/delete',
    }),
    handleSimulate() {
      const isBuy = true;
      const buyData = {
    "timeStamp": "2022-05-11T02:14:35.518Z",
    "categoryCode": "activeAddress",
    "eventCode": "txPool",
    "dappId": "e72e44c7-d688-4e0e-82a1-6ceb410b2992",
    "blockchain": {
        "system": "ethereum",
        "network": "rinkeby"
    },
    "contractCall": {
        "contractType": "multicall",
        "contractAddress": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        "methodName": "multicall",
        "params": {
            "deadline": "1652237008",
            "data": [
                "0x5ae401dc000000000000000000000000000000000000000000000000000000006282af3b00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e4472b43f300000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000000000042bab17e9331f00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000045666d334c90c63b9a9f124609dbbc9cfae3830000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000bed85cf4c249bd5fc187af600d652dd2beefddea00000000000000000000000000000000000000000000000000000000"
            ]
        },
        "subCalls": [
            {
                "data": null,
                "contractType": null
            }
        ]
    },
    "transaction": {
        "status": "pending",
        "monitorId": "Geth_4_D_PROD",
        "monitorVersion": "0.114.3",
        "pendingTimeStamp": "2022-05-11T02:14:35.518Z",
        "pendingBlockNumber": 10655119,
        "hash": "0x5a3cc9e104ee95e3aecb288110bb2bd252cdc04db391d2bf8a189535fa4b84e9",
        "from": "0x0045666d334c90c63b9a9f124609dbbc9cfae383",
        "to": "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
        "value": "1000000000000000",
        "gas": 246362,
        "nonce": 28,
        "blockHash": null,
        "blockNumber": null,
        "v": "0x1",
        "r": "0x66f18ae64c0ff7b3e2a8cec6244f454608a32361e15ffde1bdf4743a4f6be293",
        "s": "0x2627f3b8d6e53b4e36d20a9f21fb6410e1c922c8281535f5802e37ef8e1d05b2",
        "input": "0x5ae401dc000000000000000000000000000000000000000000000000000000006282af3b00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e4472b43f300000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000000000042bab17e9331f00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000045666d334c90c63b9a9f124609dbbc9cfae3830000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000bed85cf4c249bd5fc187af600d652dd2beefddea00000000000000000000000000000000000000000000000000000000",
        "type": 2,
        "maxFeePerGas": "2013555873",
        "maxFeePerGasGwei": 2.01,
        "maxPriorityFeePerGas": "1500000000",
        "maxPriorityFeePerGasGwei": 1.5,
        "transactionIndex": null,
        "asset": "",
        "watchedAddress": "0x8f52b715ac8c4f8f567f9f04d4c6a041a29f2181",
        "direction": "outgoing",
        "counterparty": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
    }
}
      const sellData = {
          "timeStamp": "2022-05-11T00:25:09.453Z",
          "categoryCode": "activeAddress",
          "eventCode": "txPool",
          "dappId": "e72e44c7-d688-4e0e-82a1-6ceb410b2992",
          "blockchain": {
              "system": "ethereum",
              "network": "rinkeby"
          },
          "contractCall": {
              "contractType": "Uniswap V2: Router02",
              "contractAddress": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
              "methodName": "swapExactTokensForETHSupportingFeeOnTransferTokens",
              "params": {
                  "amountIn": "2101881211557745845375620",
                  "amountOutMin": "0",
                  "path": [
                      "0x084406A54bB53a465Bf6bBB2Dc9141A61A64aA17",
                      "0xc778417E063141139Fce010982780140Aa0cD5Ab"
                  ],
                  "to": "0x8F52b715Ac8c4f8f567F9f04d4C6A041a29f2181",
                  "deadline": "1652228966558"
              }
          },
          "transaction": {
              "status": "confirmed",
              "monitorId": "Geth_4_D_PROD",
              "monitorVersion": "0.114.3",
              "pendingTimeStamp": "2022-05-11T00:25:09.453Z",
              "pendingBlockNumber": 10654682,
              "hash": "0x544eb9e27071b32f2e8ba81ab45dad686ecd7dab6d6710b6fda7ac9cf9dd3d677",
              "from": "0x8F52b715Ac8c4f8f567F9f04d4C6A041a29f2181",
              "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
              "value": "0",
              "gas": 553830,
              "nonce": 14,
              "blockHash": null,
              "blockNumber": null,
              "v": "0x1",
              "r": "0x329079901ee490b021f4068d007c6e313d5b54331f9fd9f9cb372c96fb29c83",
              "s": "0x12e3d0134e68b50e909c81e47acf90678b41408619fce1a35339f986395f9ab5",
              "input": "0x791ac94700000000000000000000000000000000000000000001bd17357383d548dc9284000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000008f52b715ac8c4f8f567f9f04d4c6a041a29f218100000000000000000000000000000000000000000000000000000180b085489e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000084406a54bb53a465bf6bbb2dc9141a61a64aa17000000000000000000000000c778417e063141139fce010982780140aa0cd5ab",
              "type": 2,
              "maxFeePerGas": "1007076764",
              "maxFeePerGasGwei": 1.01,
              "maxPriorityFeePerGas": "1007076764",
              "maxPriorityFeePerGasGwei": 1.01,
              "transactionIndex": null,
              "asset": "",
              "watchedAddress": "0x8f52b715ac8c4f8f567f9f04d4c6a041a29f2181",
              "direction": "outgoing",
              "counterparty": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
          }
      };
      let data;
      if (isBuy) {
        data = buyData;
      } else {
        data = sellData;
      }
      const makeid = (length) => {
          var result           = '';
          var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;
          for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 
      charactersLength));
        }
        return result;
      }
      data.transaction.hash = makeid(5);
      const History = Parse.getClass('History');
      const history = new History();
      history.set('data', data);
      history.set('owner', data.transaction.from);
      history.set('status', data.transaction.status);
      history.set('hash', data.transaction.hash);
      history.set('contract', this.contract);
      // await history.save();
      Observer.$emit(C_NEW_TX, history)
    },
    getLevel() {
      return Web3.getLevel(); 
    },
    getNetwork() {
      return Web3.getNetwork();
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
    formatBalance(balance, decimals) {
      if (!balance) {
        return '_';
      }
      return Utils.formatBalance(balance, decimals);
    },
    getActiveTargets() {
      const targets = [];
      this.targets.map(target => {
        if (this.activeTargets[target.get('address')]) {
          targets.push(target);
        }
      })
      return targets;
    },
    handleWatch() {
      const targets = this.getActiveTargets();
      const routerIndexes = this.txConfig.copyRouters;
      const dexList = Web3.getDexList();
      const contracts = routerIndexes.map(index => {
        return dexList[index].router;
      })
      if (targets.length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one target';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }
      if (targets.length > 3) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'You can\'t watch more than 3 targets';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }
      if (contracts.length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one router';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }
      if (CopyTrade.getActiveAccounts().length == 0) {
        this.alertModalTitle = 'Error';
        this.alertModalIcon = 'error';
        this.alertModalActive = true;
        this.alertModalContent = 'Please select at least one account';
        this.alertModalBtnOk = 'Ok';
        this.alertModalCallback = null;
        return;
      }
      // eslint-disable-next-line no-unreachable
      if (!this.isWatch) {
        Listener.listenTargets(
          targets.map(target => target.get('address')),
          contracts
        );
        this.isWatch = true;
      } else {
        Listener.stop();
        this.isWatch = false;
      }
    },
    handleCreate() {
      this.inputModalActive = true;
      this.inputModalBtnOk = 'Create';
      this.inputModalBtnCancel = 'Cancel';
      this.inputModalFields = [
        {
          label: 'Name',
          name: 'name',
          model: `Target ${this.targets.length + 1}`
        },
        {
          label: 'Address',
          name: 'address',
          model: ``
        }
      ];
      this.inputModalTitle = 'Create a target',
      this.inputModalCallback = async () => {
        if (!Web3.isAddress(this.inputModalFields[1].model)) {
          this.$toast.error(`Invalid address`, {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          return;
        }
        
        this.inputModalActive = false;
        this.isCreatingSub = true;
        try {
          await this.create({
            name: this.inputModalFields[0].model,
            address: this.inputModalFields[1].model
          });
          this.$toast("A target created successfully", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
        } catch (e) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an issue creating a target. Please try again';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
        this.isCreatingSub = false;
      }
    },
    handleEditExclude(target) {
      this.activeTarget = target;
      this.excludeModalActive = true;
    },
    handleEditTrigger(target) {
      this.editTriggerModalActive = true;
      this.editTriggerModalTarget = target;
    },
    handleEdit(target) {
      this.inputModalActive = true;
      this.inputModalBtnOk = 'Save';
      this.inputModalBtnCancel = 'Cancel';
      this.inputModalFields = [
        {
          label: 'Name',
          name: 'name',
          model: target.get('name') || 'NoName'
        },
        {
          label: 'Address',
          name: 'address',
          model: target.get('address')
        }
      ];
      this.inputModalTitle = 'Edit target',
      this.inputModalCallback = async () => {
        if (!Web3.isAddress(this.inputModalFields[1].model)) {
          this.$toast.error(`Invalid address`, {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          return;
        }

        this.inputModalActive = false;
        const fields = {};
        this.inputModalFields.map(field => {
          fields[field.name] = field.model;
        })
        Vue.set(this.isEditing, target.get('address'), true);
        try {
          await this.edit({target, fields});
          this.$toast("Target edit was successful", {
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
        Vue.set(this.isEditing, target.get('address'), false);
      }
    },
    async handleDelete(target) {
      this.confirmTitle = 'Confirm';
      this.confirmContent = 'Are you sure you want to remove this target?';
      this.confirmIcon = 'delete-warning';
      this.confirmActive = true;
      this.confirmCallback = async () => {
        try {
          await this.delete(target);
          this.$toast("Target remove successfully", {
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
  },
  data() {
    return {
      isWatch: false,

      excludeModalActive: false,
      activeTarget: null,

      // Loader Settings
      isCreatingSub: false,
      isEditing: {},

      // General
      
      // Params for tx
      activeTargets: {},

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

      // Edit Trigger Modal
      editTriggerModalActive: false,
      editTriggerModalCallback: null,
      editTriggerModalTarget: null,

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