<template>
  <Modal :active="active" @close="handleClose">
    <div
      class="overflow-hidden pt-4"
      id="staticBackdrop7"
      data-mdb-backdrop="static"
      data-mdb-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog-centered" style="width: 350px;">
        <div class="modal-content">
          <h2 class="text-center d-block textb mb-0 border-bottom">Take Profit / Stop Loss</h2>

          <div class="modal-body pt-0">
            <div class="d-flex justify-content-between border-bottom py-3">
              <div class="col-lg-6 pstart">
                <p style="width: fit-content;">Entry Price</p>
              </div>
              <div class="col-lg-6 d-flex justify-content-start flex-column align-items-end pend">
                <p><span style="margin-right: 15px;">{{entry}}</span>{{getNetwork().currency}}</p>
              </div>
            </div>

              <div class="d-flex justify-content-between flex-wrap mt-4">
                <div class="col-lg-12 heightpx">
                <div class="d-flex justify-content-between align-items-center h-100 bg-border p-2">
                  <span :style="isTpValid ? '' : 'color: red'">Take Profit</span>
                  <!-- <p class="m-0"> -->
                    <div class="d-flex relative">
                      <input v-model="tp" type="text" class="form-control"  placeholder="0" style="height: 25px; width: 90px; padding-right: 40px;"/>
                      <!-- <span class="pe-1 d-inline-block">0</span> -->
                      <div style="position: absolute; right: 30px;">
                        {{getNetwork().currency}}
                      </div>
                    </div>
                  <!-- </p> -->
                </div>
              </div>
              <div class="text-entire mt-3">
                <p>When <span>Price</span> reaches more than <span>{{parseFloat(tp).toFixed(2)}}</span>, it will trigger sell. Estimated profit will be <span class="usd">{{(parseFloat(tp) - parseFloat(entry)).toFixed(2)}} {{getNetwork().currency}}</span></p>
              </div>
            </div>
            <div class="d-flex justify-content-between flex-wrap mt-4">
              <div class="col-lg-12 heightpx">
                <div class="d-flex justify-content-between align-items-center h-100 bg-border p-2">
                  <span :style="isSlValid ? '' : 'color: red'">Stop Loss</span>
                  <!-- <p class="m-0"> -->
                    <div class="d-flex relative">
                      <input v-model="sl" type="text" class="form-control"  placeholder="0" style="height: 25px; width: 90px; padding-right: 40px;"/>
                      <!-- <span class="pe-1 d-inline-block">0</span> -->
                      <div style="position: absolute; right: 30px;">
                        {{getNetwork().currency}}
                      </div>
                    </div>
                  <!-- </p> -->
                </div>
              </div>
              <div class="text-entire mt-3 mb-3">
                <p>When <span>Price</span> reaches below than <span>{{parseFloat(sl).toFixed(2)}}</span>, it will trigger sell. Estimated lose will be<span class="usd"> {{(parseFloat(entry) - parseFloat(sl)).toFixed(2)}} {{getNetwork().currency}}</span></p>
              </div>
              <!-- <p class="s14">*This setting will apply to the entire position. After closing the porsition, the take-profit and stop-loss will automatically cancel.</p> -->
              <div class="d-flex justify-content-between flex-wrap align-content-center w-100">
                <div class="col-xl-6 col-6 text-center">
                  <a class="btn btn-outline-black d-block me-2 text-capitalize" @click="handleClose" data-mdb-dismiss="modal" style="">Cancel</a>
                </div>
                <div class="col-xl-6 col-6 d-flex text-center">
                  <a class="btn btn-black d-block w-100 ms-2 text-capitalize" @click="handleSave">Confirm</a>
                </div>
              </div>
            </div>  
          </div>        
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
// @ is an alias to /src
import { mapGetters } from "vuex";
import Utils from '@/helpers/Utils';
import Modal from './Modal.vue';
import Web3 from '@/helpers/Web3';
export default {
  name: "TpSlModal",
  props: ['active', 'callback', 'activeAccount', 'positions', 'balances'],
  components: {
    Modal
  },
  computed: {
    ...mapGetters({
    }),
    isTpValid() {
      const tp = parseFloat(this.tp);
      if (isNaN(tp)) {
        return false;
      }
      if (tp == 0) {
        return true;
      }
      return parseFloat(this.tp) > parseFloat(this.entry);
    },
    isSlValid() {
      const sl = parseFloat(this.sl);
      if (isNaN(sl)) {
        return false;
      }
      if (sl == 0) {
        return true;
      }
      return parseFloat(this.sl) < parseFloat(this.entry);
    },
  },
  watch: {
    activeAccount() {
      this.tp = this.positions[this.activeAccount.get('address')].tp;
      this.sl = this.positions[this.activeAccount.get('address')].sl;
      this.entry = this.balances[this.activeAccount.get('address')].eth;
    }
  },
  beforeDestroy() {
  },
  async mounted() {
  },
  methods: {
    getNetwork() {
      return Web3.getNetwork();
    },
    formatBalance(balance, decimals) {
      return Utils.formatBalance(balance, decimals);
    },
    handleSave() {
      if (!this.isTpValid || !this.isSlValid) {
        return;
      }
      if (this.callback) {
        this.callback(this.tp, this.sl);
      }
    },
    handleClose() {
      this.$emit('close');
    }
  },
  data() {
    return {
      tp: 0,
      sl: 0,
      entry: 0
    };
  },
};
</script>

<style scoped>
</style>