<template>
  <div>
    <active-list class="mt-4"/>
    <watch-list />

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
import WatchList from './components/WatchList.vue';
import ActiveList from './components/ActiveList.vue';
import AlertModal from '@/components/AlertModal.vue';

import { mapActions, mapGetters } from "vuex";

export default {
  name: "Home",
  components: {
    WatchList,
    ActiveList,
    AlertModal
  },
  computed: {
    ...mapGetters(["account", "balance"]),
  },
  watch: {
  },
  async mounted() {
    this.setActive(null);

    let shownGasLimitHelper = parseInt(localStorage.getItem('hasShownGasLimitHelper') || 0);
    console.log(shownGasLimitHelper);
    if (isNaN(shownGasLimitHelper)) {
      shownGasLimitHelper = 0;
    }
    if (shownGasLimitHelper < 2) {
      this.alertModalTitle = 'Warning';
      this.alertModalIcon = 'warning';
      this.alertModalActive = true;
      this.alertModalContent = `There is a new setting called Gas Limit on Transaction Configuration panel. You can now set the maximum gas amount that you are willing to spend for Buy/Sell or Copy Trading`;
      this.alertModalBtnOk = 'Ok';
      localStorage.setItem('hasShownGasLimitHelper', shownGasLimitHelper + 1);
    }
  },
  methods: {
    ...mapActions({
      setActive: 'contracts/setActive'
    })
  },
  data() {
    return {
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