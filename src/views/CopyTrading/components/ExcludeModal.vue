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
            Excluded Tokens List <img style="width: 25px; height: 25px; margin-left: 15px; cursor: pointer;" @click="showHelp" 
              class="action-icon bounce" 
              src="img/question.svg"
            />
          </div>
          <div style="max-height: 500px; overflow-y: auto;">
            <table class="table m-0 w-100">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="token in tokens" :key="token.address">
                  
                  <td>{{formatAddress(token.address)}}</td>
                  <td>{{token.name}}</td>
                  <td>
                    <a @click="handleDelete(token)" data-toggle="tooltip" data-placement="bottom" title="Delete" class="me-2" >
                      <!-- Approve -->
                      <img class="action-icon" src="img/Delete.svg">
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="button-text d-flex justify-content-center align-items-center mt-4 mb-0">
            <a @click="handleCreate" style="width: 120px;" class="btn-theme">{{btnCreate}}</a>
            <a @click="handleUpdate" style="width: 120px;" class="btn-theme">{{btnUpdate}}</a>
          </div>
        </div>
      </div>
    </div>
    <input-modal 
      :title="inputModalTitle"
      :active="inputModalActive"
      :btnOk="inputModalBtnOk"
      :btnCancel="inputModalBtnCancel"
      :callback="inputModalCallback"
      :fields="inputModalFields"
      @cancel="inputModalActive=false"
    />
  </Modal>
</template>

<script>
// @ is an alias to /src
import { mapActions, mapGetters } from "vuex";
import Modal from '@/components/Modal.vue';
import Web3 from '@/helpers/Web3';
import Utils from '@/helpers/Utils';
import InputModal from '@/components/InputModal.vue';
export default {
  name: "ExcludeModal",
  props: ['target', 'active'],
  components: {
    Modal,
    InputModal
  },
  computed: {
    ...mapGetters({
    }),
  },
  watch: {
    async active() {
      this.isLoaded = false;
      this.btnUpdate = 'Save';
      if (this.active) {
        this.tokens = this.target.get('excludes') || [];
        this.isLoaded = true;
      }
    }
  },
  beforeDestroy() {
  },
  async mounted() {
  },
  methods: {
    ...mapActions({
      fetchContract: 'contracts/get'
    }),
    showHelp() {
      this.handleClose();
      window.Intercom('showArticle', 6208204);
    },
    handleDelete(token) {
      this.tokens = this.tokens.filter(item => item.address.toLowerCase() != token.address.toLowerCase())
    },
    handleCreate() {
      this.inputModalActive = true;
      this.inputModalBtnOk = 'Create';
      this.inputModalBtnCancel = 'Cancel';
      this.inputModalFields = [
        {
          label: 'Token Address',
          name: 'address',
          model: ``
        }
      ];
      this.inputModalTitle = 'Create excluded token',
      this.inputModalCallback = async () => {
        const address = this.inputModalFields[0].model;
        if (!Web3.isAddress(address)) {
          this.$toast.error(`Invalid address`, {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          return;
        }
        if (this.tokens.filter((token => token.address.toLowerCase() == address.toLowerCase())).length > 0) {
          this.$toast.error(`Token already exists`, {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
          return;
        }
        
        this.inputModalActive = false;
        this.btnCreate = 'Creating...';
        try {
          // TODO: implement creation
          const contract = await this.fetchContract(address);
          this.tokens.push({
            address,
            name: contract.get('name')
          })
          this.$toast("An exclude created successfully", {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
        } catch (e) {
          this.$toast.error(`There was an issue creating an exclude. Please try again`, {
            position: "top-right",
            timeout: 2000,
            closeOnClick: true,
          });
        }
        this.btnCreate = 'Create';
      }
    },
    async handleUpdate() {
      this.target.set('excludes', this.tokens);
      this.btnUpdate = 'Saving...';
      try {
        await this.target.save();
      } catch (e) {
        this.$toast.error(`There was an error. Please try again`, {
          position: "top-right",
          timeout: 2000,
          closeOnClick: true,
        });
        this.btnUpdate = 'Retry';
      }
      this.btnUpdate = 'Save';
      this.handleClose();
    },
    formatAddress(address) {
      return Utils.formatAddress(address);
    },
    handleClose() {
      this.$emit('close');
    },
  },
  data() {
    return {
      tokens: [],
      isLoaded: false,
      btnUpdate: 'Save',
      btnCreate: 'Create',

      // Input Modal
      inputModalFields: [],
      inputModalActive: false,
      inputModalTitle: '',
      inputModalCallback: null,
      inputModalBtnOk: 'Yes',
      inputModalBtnCancel: 'Cancel',
    };
  },
};
</script>

<style scoped>
td {
  text-align: center;
}
</style>