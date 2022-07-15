<template>
  <Modal :active="active" @close="handleClose">
    <div
        class=""
        id="staticBackdrop1"
        data-mdb-backdrop="static"
        data-mdb-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
        >
        <div class="modal-body py-5 px-4">
          <div class="text-center">
              <p class="m-0 roundp">Your Current Balance</p>
              <h3 class="mt-1 fs20 fs34"><b>{{formatBalance(balance)}}</b></h3>
              <p class="mt-4 roundp" v-html="content"></p>
          </div>
          <!-- <div class="d-flex justify-content-between align-items-center round-s py-3">
            <div>
              <span></span>
              <p>0%</p>
            </div>
            <div>
              <span></span>
              <p>25%</p>
            </div>
            <div>
              <span></span>
              <p>50%</p>
            </div>
            <div>
              <span></span>
              <p>75%</p>
            </div>
            <div>
              <span></span>
              <p>100%</p>
            </div>
          </div> -->
        <div class="form mb-3">
            <input v-model="amount" type="text" class="form-control" placeholder="Amount">
        </div>
        <div class="form mb-3">
            <input v-if="hasTo" v-model="to" type="text" class="form-control" placeholder="To">
        </div>
        <div class="d-flex justify-content-center flex-wrap align-content-center mt-4">
            <div class="col-xl-7 col-6 d-flex text-center">
              <a @click="handleDeposit" class="btn btn-black d-block w-100 ms-2 btn-lg" >{{caption}}</a>
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
export default {
  name: "InformationList",
  props: ['balance', 'content', 'caption', 'hasTo', 'active', 'callback'],
  components: {
    Modal
  },
  computed: {
    ...mapGetters({
    }),
  },
  watch: {
  },
  beforeDestroy() {
  },
  async mounted() {
  },
  methods: {
    formatBalance(balance, decimals) {
      return Utils.formatBalance(balance, decimals);
    },
    handleDeposit() {
      if (this.callback) {
        this.callback(this.amount, this.to);
      } else {
        this.$emit('deposit', this.amount, this.to);
      }
    },
    handleClose() {
      this.$emit('close');
    }
  },
  data() {
    return {
      isDeposit: false,
      amount: 0,
      to: '',
    };
  },
};
</script>

<style scoped>
</style>