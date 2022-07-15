<template>
  <div>
    <target-list />
    <history-list :hasNoFunctions="true" style="margin-top: 16px;" />
  </div>
</template>

<script>
import TargetList from './components/TargetList.vue';
import HistoryList from '../Contract/components/HistoryList.vue';
import { mapGetters } from 'vuex';
import Vue from 'vue';

export default {
  name: 'CopyTrading',
  components: {
    TargetList,
    HistoryList
  },
  computed: {
    ...mapGetters({
      txConfig: 'transactions/config',
    })
  },
  mounted() {
    Vue.set(this.txConfig, 'gasGWei', 0)
  },
}
</script>
