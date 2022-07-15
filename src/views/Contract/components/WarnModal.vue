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
      <div class="modal-body py-3 px-4">
        <div v-if="!isLoaded">
          Loading...
        </div>
        <div v-else>
          <div style="color: black; font-weight: 900; font-size: 20px; margin: 20px;">
            Warning List
          </div>
          <div style="max-height: 500px; overflow-y: auto;">
            <table class="table m-0 w-100">
              <thead>
                <tr>
                  <th></th>
                  <th>Selector</th>
                  <th>Details</th>
                  <!-- <th style="width: 300px!important;">Function</th> -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="selector in signatures" :key="selector.signature">
                  <td>
                    <input class="form-check-input" type="checkbox" v-model="selector.isWarn" aria-label="..." />
                  </td>
                  <td>{{selector.signature}}</td>
                  <td>
                    <template v-if="selector.title == '' || !selector.title">
                      <div class="button-text d-flex justify-content-center align-items-center mt-2">
                        <a @click="open4Byte(selector.signature)" style="width: 120px;" class="btn-theme">Open in 4Byte</a>
                      </div>
                    </template>
                    <template v-else>
                      <span style="color: black; font-weight: 900;">{{selector.title}}</span>
                    </template>
                  </td>
                  <!-- <td>{{selector.signature}}</td> -->
                </tr>
              </tbody>
            </table>
          </div>
          <div class="button-text d-flex justify-content-center align-items-center mt-4 mb-0">
            <a @click="handleUpdate" style="width: 120px;" class="btn-theme">Update</a>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
// @ is an alias to /src
import { mapGetters } from "vuex";
import Modal from '@/components/Modal.vue';
import Vue from 'vue';
import Transaction from '@/helpers/Transaction';
export default {
  name: "WarnModal",
  props: ['contract', 'active'],
  components: {
    Modal
  },
  computed: {
    ...mapGetters({
      config: 'transactions/config'
    }),
  },
  watch: {
    async active() {
      this.isLoaded = false;
      if (this.active) {
        this.signatures = this.contract.get('abi');
        for (let i = 0; i < this.signatures.length; i++) {
          const item = this.signatures[i];
          Vue.set(this.signatures[i], 'isWarn', this.config.warns.includes(item.signature));
          let abi = item.abi;
          if (!abi) {
            if (!Transaction.abis[item.signature]) {
              await Transaction.getAbiFromSelector(item.signature);
            }
            abi = Transaction.abis[item.signature];
          }
          Vue.set(this.signatures[i], 'title', this.formatAbi(abi));
        }
        this.isLoaded = true;
      }
    }
  },
  beforeDestroy() {
  },
  async mounted() {
  },
  methods: {
    handleUpdate() {
      Vue.set(this.config, 'warns', this.signatures.filter(selector => selector.isWarn).map(selector => selector.signature));
      this.handleClose();
    },
    handleClose() {
      this.$emit('close');
    },
    open4Byte(selector) {
      const url = `https://www.4byte.directory/signatures/?bytes4_signature=${selector}`;
      window.open(url);
    },
    formatAbi(abi) {
      if (!abi) {
        return '';
      }
      let params = [];
      for (let param of (abi.inputs || [])) {
        let arg = '';
        if (param.name == '') {
          continue;
        }
        arg = param.type;
        if (param.type != param.name) {
          arg += ` ${param.name}`;
        }
        params.push(arg);
      }
      return `${abi.name}(${params.join(',')})`
    }
  },
  data() {
    return {
      signatures: [],
      isLoaded: false
    };
  },
};
</script>

<style scoped>
td {
  text-align: center;
}
</style>