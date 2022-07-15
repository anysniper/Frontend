<template>
  <div class="card">
    <div id="active-contracts-card" class="card-body p-0 py-4">
        <div class="d-flex justify-content-between align-items-center px-4 pb-3">
          <h2 class="m-0">Active Contracts</h2>
          <!-- Tabs navs -->
          <div class="tabs-btn">
              <ul class="nav nav-tabs mb-3" id="ex1" role="tablist">
                <li class="nav-item" role="presentation">
                    <a
                      class="nav-link text-capitalize"
                      :class="tab == 'live' ? 'active' : ''"
                      id="ex1-tab-1"
                      data-mdb-toggle="tab"
                      @click="switchTab('live')"
                      role="tab"
                      aria-controls="ex1-tabs-1"
                      aria-selected="true"
                      >Live</a
                      >
                </li>
                <li class="nav-item" role="presentation">
                    <a
                      class="nav-link text-capitalize"
                      :class="tab == 'past' ? 'active' : ''"
                      id="ex1-tab-2"
                      data-mdb-toggle="tab"
                      @click="switchTab('past')"
                      role="tab"
                      aria-controls="ex1-tabs-2"
                      aria-selected="false"
                      >Past</a
                      >
                </li>
              </ul>
          </div>
        </div>
        <!-- Tabs navs -->
        <!-- Tabs content -->
        <div class="tab-content" id="ex1-content">
          <div
              class="tab-pane fade show active"
              id="ex1-tabs-1"
              role="tabpanel"
              aria-labelledby="ex1-tab-1"
              >
              <div class="table-responsive">
                <table v-if="watches.length > 0" class="table m-0 align-items-center">
                  <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Owner</th>
                        <th>Symbol</th>
                        <!-- <th>Price (24h)</th> -->
                        <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="watch in watches" :key="watch.id" >
                      <td>{{watch.get('name')}}</td>
                      <td>{{formatAddress(watch.get('address'))}}</td>
                      <td>{{formatAddress(watch.get('owner'))}}</td>
                      <td>{{watch.get('symbol')}}</td>
                      <!-- <td><span class="text-success">$1500 (+200%)</span></td> -->
                      <td>
                        <div class="edit">
                            <a class="me-2" @click="goToDetails(watch)"><img class="action-icon" src="img/view.svg"/></a>
                            <a @click.stop="deleteWatch(watch)"><img class="action-icon" src="img/Delete.svg"/></a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else style="margin-left: 25px;">
                  There is no active contract. Please add one by searching contract address
                </div>
              </div>
          </div>
        </div>
        <!-- Tabs content -->
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from "vuex";
import Utils from '@/helpers/Utils';

export default {
  name: "ActiveList",
  components: {
  },
  computed: {
    ...mapGetters({
      liveList: 'watches/liveList',
      pastList: 'watches/pastList'
    }),
    watches() {
      return this[this.tab + 'List'];
    }
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
      this.delete({
        address: watch.get('address'),
        type: this.tab
      });
    },
    goToDetails(watch) {
      this.$router.push({
        name: 'Contract',
        params: {
          address: watch.get('address')
        }
      })
    },
    switchTab(tab) {
      this.tab = tab;
    }
  },
  data() {
    return {
      tab: 'live'
    };
  },
};
</script>

<style scoped>
</style>