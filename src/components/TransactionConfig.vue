<template>
  <!--card-form-->
  <div id="transaction-config-card" class="card cardlabel sticky-top align-top">
    <div class="expander" @click="isExpand = !isExpand">
      <h2>Configuration</h2>
      <font-awesome-icon icon="fa-solid fa-chevron-down" :class="{'icon-rotate': isExpand === true}"/>
    </div>
    <div v-if="isCopyTrading()" class="card-body" :class="{'is-expand': isExpand === true}">
      <div class="d-flex flex-wrap">
        <div class="col-lg-6  pe-lg-3 ">
          <div class="d-flex">
            <div class="" style="margin-right: 8px; margin-top: 3px;">
              <h2 class="m-0">Buy</h2>
            </div>
          </div>
            <div class="d-flex flex-wrap mt-2">
              <div class="col-lg-6 pe-lg-3 col-sm-12 col-12">
                  <div class="">
                    <label class="form-label" >{{getNetwork().currency}} Amount<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208171)"/></label>
                    <input v-model="config.buyAmount" type="text"  class="form-control" placeholder="12" />
                  </div>
              </div>
              <div class="col-lg-6 ps-lg-3 col-sm-12 col-12 mobile-mt">
                <div class="d-flex align-items-center dm">
                  <input v-model="config.isBuyInstant" id="check" class="form-check-input" type="checkbox" value="" aria-label="...">
                  <label class="me-2 m-0 ps-3" for="check">Buy Instant</label>                  
                  <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208167)"/>
                </div>
                <div class="d-flex align-items-center dm mt-1">
                  <input v-model="config.isBuySameAmount" id="check2" class="form-check-input" type="checkbox" value="" aria-label="...">
                  <label class="me-2 m-0 ps-3" for="check2">Same Amount</label>
                  <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208171)"/>
                </div>
                <div class="d-flex align-items-center dm mt-1">
                  <input v-model="config.isBuyOnce" id="check3" class="form-check-input" type="checkbox" value="" aria-label="...">
                  <label class="me-2 m-0 ps-3" for="check3">Buy Once</label>
                  <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208176)"/>
                </div>
              </div>
            </div>
          <div class="d-flex flex-wrap mt-2">
            <div class="col-lg-6 pe-3">
                <div class="">
                  <label class="form-label" >Normal Gas Multiplier<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208167)"/></label>
                  <input v-model="config.buyGasMultiplier" type="text"  class="form-control" placeholder="0">
                </div>
            </div>
            <div class="col-lg-6">
                <div class="">
                  <label class="form-label" >Frontrun Gas Multiplier<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208167)"/></label>
                  <input v-model="config.buyFastGasMultiplier" type="text"  class="form-control" placeholder="1.5">
                </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 mobile-mt">
          <div class="d-flex" style="margin-top: 3px;">
            <h2 class="m-0">Sell</h2>
          </div>
            <div class="d-flex flex-wrap mt-2">
              <div class="col-lg-12 pe-3">
                  <div class="d-flex flex-wrap">
                    <div class="col-lg-6 pe-3">
                        <div class="">
                          <label class="form-label" >Threshold<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208182)"/></label>
                          <input v-model="config.sellThreshold" type="text"  class="form-control" placeholder="0">
                        </div>
                    </div>
                    <div class="col-lg-6 ps-lg-3 col-sm-12 col-12 mobile-mt" >
                      <div class="d-flex align-items-center dm">
                        <input v-model="config.isSellOnWarn" id="checksellinstant" class="form-check-input" type="checkbox" value="" aria-label="...">
                        <label class="me-2 m-0 ps-3" for="checksellinstant">Sell Instant</label>
                        <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208184)"/>
                      </div>
                      <div class="d-flex align-items-center dm mt-3">
                        <input v-model="config.isSellSameAmount" id="checksameamount" class="form-check-input" type="checkbox" value="" aria-label="...">
                        <label class="me-2 m-0 ps-3" for="checksameamount">Same Amount</label>                  
                        <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208193)"/>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap mt-2">
                    <div class="col-lg-6 pe-3">
                        <div class="">
                          <label class="form-label" >Normal Gas Multiplier<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208184)"/></label>
                          <input v-model="config.sellGasMultiplier" type="text"  class="form-control" placeholder="0">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="">
                          <label class="form-label" >Frontrun Gas Multiplier<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208184)"/></label>
                          <input v-model="config.sellFastGasMultiplier" type="text"  class="form-control" placeholder="1.5">
                        </div>
                    </div>
                  </div>
              </div>
            </div>
        </div>

      </div>
    </div>
    <div v-else class="card-body" :class="{'is-expand': isExpand === true}">
      <div class="d-flex flex-wrap">
        <div class="col-lg-6  pe-lg-3 ">
          <div class="d-flex">
            <div class="" style="margin-right: 8px; margin-top: 3px;">
              <h2 class="m-0">Buy</h2>
            </div>
            <div class="col-lg-5 d-flex align-items-center" :style="getLevel().canSnipe() ? '' : 'visibility: hidden;'">
              <label class="form-label"  style="margin-right: 6px!important; margin-top: 6px!important;">On
                <img id="help-buy-on" class="pointer ms-lg-2" src="img/info-card.svg" data-toggle="tooltip" data-placement="bottom" title="Trigger buy on this function" onclick="Intercom('showArticle', 6020973)"/>
              </label>
              <input style="margin-top: 0px;" v-model="config.buyOn" type="text"  class="form-control" placeholder="" />
            </div>
            <a v-if="canWatch" @click="handleWatch" data-mdb-placement="bottom" title="Watch" style="margin-left: 10px;">
              <img v-if="isWatch" style="width: 30px; height: 30px;" class="action-icon" src="img/unobserve.svg"/>
              <img v-else style="width: 30px; height: 30px;" class="action-icon" src="img/observe.svg"/>
              <span v-if="isWatch">Watching...</span>
            </a>
          </div>
            <div class="d-flex flex-wrap mt-2">
              <div class="col-lg-6 pe-lg-3 col-sm-12 col-12">
                  <div class="">
                    <label class="form-label" >{{getNetwork().currency}} Amount<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021003)"/></label>
                    <input v-model="config.buyAmount" type="text"  class="form-control" placeholder="12" />
                  </div>
              </div>
              <div class="col-lg-6 col-sm-12 col-12">
                  <div class="" v-if="!config.isOriginalRouter">
                    <label class="form-label" >Max Percent<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021003)"/></label>
                    <input v-model="config.maxSupply" type="text"  class="form-control" placeholder="0.75" />
                  </div>
              </div>
            </div>
          <div v-if="getLevel().canSnipe()" class="d-flex flex-wrap mt-2">
            <div class="col-lg-6 pe-3">
                <div class="">
                  <label class="form-label" >Normal Gas Multiplier<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021015)"/></label>
                  <input v-model="config.buyGasMultiplier" type="text"  class="form-control" placeholder="0">
                </div>
            </div>
            <div class="col-lg-6">
                <div class="">
                  <label class="form-label" >Gas Limit<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6208153)"/></label>
                  <input v-model="config.gasLimitETH" type="text"  class="form-control" placeholder="1.5">
                </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 mobile-mt">
          <div class="d-flex" style="height: 30px; margin-top: 3px;">
            <h2 class="m-0">Sell</h2>
          </div>
          <div class="d-flex flex-wrap mt-2">
              <div class="col-lg-6 pe-lg-3 col-sm-12 col-12">
                  <div class="">
                    <label class="form-label" >Account’s Percent<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021011)"/></label>
                    <input v-model="config.sellPercent" type="text"  class="form-control"  placeholder="100" />
                  </div>
              </div>
              <div class="col-lg-6 ps-lg-3 col-sm-12 col-12 mobile-mt" v-if="getLevel().canSnipe()">
                <div class="d-flex align-items-center dm">
                  <input v-model="config.isBuyInstant" id="check" class="form-check-input" type="checkbox" value="" aria-label="...">
                  <label class="me-2 m-0 ps-3" for="check">{{config.isBuyInstant ? 'Buy Instant' : 'Blocks: '}}</label>
                  <input v-if="!config.isBuyInstant" v-model="config.blocks" style="width: 30px; height: 30px; margin-top: 0px; margin-left: 5px;" class="form-check-input"/>
                  <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021015)"/>
                </div>
                <div class="d-flex align-items-center dm mt-3">
                  <input v-model="config.isSellOnWarn" id="check2" class="form-check-input" type="checkbox" value="" aria-label="...">
                  <label class="me-2 m-0 ps-3" for="check2">Sell on Warn</label>
                  <img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021020)"/>
                </div>
              </div>
            </div>
            <div v-if="getLevel().canSnipe()" class="d-flex flex-wrap mt-2">
              <div class="col-lg-12 pe-3">
                  <div class="d-flex flex-wrap">
                    <div class="col-lg-6 pe-3">
                        <div class="">
                          <label class="form-label" >Normal Gas Multiplier<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021020)"/></label>
                          <input v-model="config.sellGasMultiplier" type="text"  class="form-control" placeholder="0">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="">
                          <label class="form-label" >Frontrun Gas Multiplier<img class="ms-lg-2 pointer" src="img/info-card.svg" onclick="Intercom('showArticle', 6021020)"/></label>
                          <input v-model="config.sellFastGasMultiplier" type="text"  class="form-control" placeholder="1.5">
                        </div>
                    </div>
                  </div>
              </div>
            </div>
        </div>

      </div>
      
      <hr/>
      <div class="d-flex flex-wrap align-items-center mobile-gap">
        <div class="col-lg-6">
          <div class="d-flex flex-wrap ">
            <div class="col-lg-6">
              <h2 class="m-0">Cancel</h2>
            </div>
            <div class="col-lg-6 d-flex align-items-center">
              <label class="form-label"  style="margin-right: 6px!important; margin-top: 3px!important;">Gas Multiplier</label>
              <input style="margin-top: -5px;" v-model="config.cancelGasMultiplier" type="text"  class="form-control" placeholder="" />
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div v-if="true || getLevel().canSnipe()" class="d-flex flex-wrap pe-3">
            <div class="col-lg-6">
              <div class="button-text d-flex justify-content-center align-items-center" style="margin-top: -4px;">
                <a style="font-size: 12px;" @click="getSelector()" class="btn-theme">Get Selector</a>
                <img class="pointer ms-lg-2" src="img/info-card.svg" onclick="Intercom('showArticle', 6020973)"/>
              </div>
            </div>
            <div class="col-6 d-flex align-items-center">
              <input style="margin-top: -5px;" v-model="selector" type="text"  class="form-control" placeholder="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from "vuex";
import Listener from '@/helpers/Listener';
import Web3 from 'web3';
import Web3Helper from '@/helpers/Web3';

export default {
  name: "TransactionConfig",
  components: {
  },
  computed: {
    ...mapGetters({
      config: 'transactions/config',
      contract: 'contracts/active',
    }),
    canWatch() {
      return (this.contract && this.getLevel().canSnipe()) && !this.getNetwork().cantWatch;
    }
  },
  watch: {
    contract() {
      if (this.isWatch) {
        Listener.stop();
        this.isWatch = false;
      }
    },
  },
  async mounted() {
  },
  beforeDestroy() {
    Listener.stop();
    // TODO: remove socket
  },
  methods: {
    ...mapActions({
    }),
    isCopyTrading() {
      return this.$route.name == 'CopyTrading';
    },
    getLevel() {
      return Web3Helper.getLevel(); 
    },
    getNetwork() {
      return Web3Helper.getNetwork();
    },
    getSelector() {
      if (this.selector.substr(0, 2) != '0x') {
        let func = this.selector;
        func = func.replace(/(\r\n|\n|\r)/gm,"");
        func = func.split('(');
        
        const nameSplits = func[0].split(' ');
        const name = nameSplits[nameSplits.length - 1];

        func = func[1].split(')')[0];
        const params = func.split(',');
        const types = [];
        params.map(param => {
          for (let type of param.split(' ')) {
            if (type != '') {
              types.push(type);
              break;
            }
          }
        })

        func = `${name}(${types.join(',')})`;
        // console.log(func)

        const web3 = new Web3();
        this.selector = web3.eth.abi.encodeFunctionSignature(func);
      }
    },
    async handleWatch() {
      if (!this.isWatch) {
        const details = await Web3Helper.getTokenDetails(this.contract.get('address'));
        
        Listener.listen(
          this.contract.get('address'),
          details.owner
        );
        this.isWatch = true;
      } else {
        Listener.stop();
        this.isWatch = false;
      }
    },
  },
  data() {
    return {
      isWatch: false,
      selector: '',
      isExpand: false,
    };
  },
};
</script>
<style scoped>
.expander {
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.icon-rotate {
  transform: rotate(180deg);
}

.card-body {
  padding: 0px;
  overflow: hidden;
  height: 0px;
}

.is-expand {
  height: auto;
  padding: 1.5rem;
  padding-top: 0px;
  overflow: auto;
}

.mobile-mt {
  margin-top: 0px;  
}

.mobile-gap {
  gap: 0px;
}

@media(max-width:  992px) {
  .mobile-mt {
      margin-top: 12px;
  }
  .mobile-gap {
    gap: 12px;
  }
}

@media(max-width: 768px) {
  .sticky-top {
    position: unset;
  }
}

</style>