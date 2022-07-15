<template>
  <Modal :active="active" @close="handleCancel">
    <div
      class=""
      id="staticBackdrop4"
      data-mdb-backdrop="static"
      data-mdb-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
      >
      <div class="modal-dialog-centered model-width1">
        <div class="">
            <div class="modal-body px-4">
              <div class="text-center">
                  <h3 class="mt-4 mb- fs20"><b>Trigger functions</b></h3>
                  <p>Select at least one of these functions to copy target's trading behavior.</p>
              </div>
              <!-- <div>
                <table class="table m-0" id="table2">
                  <thead>
                    <tr>
                        <th width="70" style="padding:0px"></th>
                        <th>Function</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="template in templates" :key="template.id">
                        <td class="text-center" style="padding-left:20px; padding-right: 0;">
                          <input class="form-check-input" type="checkbox" aria-label="..." />
                        </td>
                        <td>{{template.get('function')}}</td>
                    </tr>
                  </tbody>
              </table>
              </div> -->
              <div class="d-flex justify-content-between flex-wrap align-content-center mt-4">
                  <div class="col-xl-6 col-6 text-center">
                    <a @click="handleCancel" class="btn btn-outline-black outline-gray d-block me-2"   data-mdb-dismiss="modal">Cancel</a>
                  </div>
                  <div class="col-xl-6 col-6 d-flex text-center">
                    <a @click="handleOk" class="btn btn-black d-block w-100 ms-2" >Save</a>
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
import Modal from '@/components/Modal.vue';
export default {
  name: "ConfirmModal",
  props: {
    callback: {},
    active: {
      type: Boolean
    },
    target: {
      type: Object
    },
    templates: {
      type: Array
    }
  },
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
    handleCancel() {
      this.$emit('cancel');
    },
    handleOk() {
      if (this.callback) {
        this.callback();
      } else {
        this.$emit('ok');
      }
    }
  },
  data() {
    return {
    };
  },
};
</script>

<style scoped>
</style>