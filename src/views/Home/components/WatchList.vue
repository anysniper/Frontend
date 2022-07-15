<template>
  <div style="margin-top: 16px;">
    <div class="card mt-4">
      <div class="card-body p-0 py-4">
          <div class="d-flex justify-content-between align-items-center px-4 pb-3">
            <h2 class="m-0">Watched Contracts</h2>
            <!-- <a href="#"><img src="img/dots.svg"/></a> -->
          </div>
          <div class="table-responsive">
            <table v-if="watches.length > 0" class="table m-0 align-items-center">
              <thead>
                <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Owner</th>
                    <th>Symbol</th>
                    <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="watch in watches" :key="watch.id" >
                  <td>{{watch.get('name')}}</td>
                  <td>{{formatAddress(watch.get('address'))}}</td>
                  <td>{{formatAddress(watch.get('owner'))}}</td>
                  <td>{{watch.get('symbol')}}</td>
                  <td>
                    <div class="edit">
                        <a class="me-2" @click="goToDetails(watch)"><img class="action-icon" src="img/view.svg"/></a>
                        <a v-if="!isDeleting[watch.get('address')]" @click.stop="deleteWatch(watch)"><img class="action-icon" src="img/Delete.svg"/></a>
                        <img v-else class="loading-icon" src="img/spinner.svg"/>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else style="margin-left: 25px;">
              There is no watched contract. Please add one by searching contract address
            </div>
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
import ConfirmModal from '@/components/ConfirmModal.vue';
import AlertModal from '@/components/AlertModal.vue';
import Vue from 'vue';

export default {
  name: "WatchList",
  components: {
    ConfirmModal,
    AlertModal
  },
  computed: {
    ...mapGetters({
      watches: 'watches/watchList'
    }),
  },
  watch: {
  },
  async mounted() {
  },
  methods: {
    ...mapActions({
      fetch: 'watches/fetch',
      delete: 'watches/delete'
    }),
    formatAddress(address) {
      return Utils.formatAddress(address);
    },
    deleteWatch(watch) {
      this.confirmTitle = 'Confirm';
      this.confirmContent = 'Are you sure you want to remove this account?';
      this.confirmIcon = 'delete-warning';
      this.confirmActive = true;
      this.confirmCallback = async () => {
        this.confirmActive = false;
        Vue.set(this.isDeleting, watch.get('address'), true);
        try {
          this.delete({
            address: watch.get('address'),
            type: 'watch'
          });
        } catch (e) {
          this.alertModalTitle = 'Error';
          this.alertModalIcon = 'error';
          this.alertModalActive = true;
          this.alertModalContent = 'There was an error on delete. Please try again.';
          this.alertModalBtnOk = 'Ok';
          this.alertModalCallback = null;
        }
        Vue.set(this.isDeleting, watch.get('address'), false);
      };
    },
    goToDetails(watch) {
      this.$router.push({
        name: 'Contract',
        params: {
          address: watch.get('address')
        }
      })
    }
  },
  data() {
    return {
      // Loader
      isDeleting: {},

      // Confirm Modal
      confirmActive: false,
      confirmTitle: '',
      confirmContent : '',
      confirmCallback : null,
      confirmIcon: 'info',

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
</style>