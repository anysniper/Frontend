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
            <div class="modal-body py-5 px-4">
              <div class="text-center">
                  <img :src="`img/${icon}.svg`"/>
                  <h3 class="mt-4 mb- fs20"><b>{{title}}</b></h3>
                  <p>{{content}}</p>
              </div>
              <div class="d-flex justify-content-between flex-wrap align-content-center mt-4">
                  <div class="col-xl-6 col-6 text-center">
                    <a @click="handleCancel" class="btn btn-outline-black outline-gray d-block me-2"   data-mdb-dismiss="modal">{{btnCancel}}</a>
                  </div>
                  <div class="col-xl-6 col-6 d-flex text-center">
                    <a @click="handleOk" class="btn btn-black d-block w-100 ms-2" >{{btnOk}}</a>
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
import Modal from './Modal.vue';
export default {
  name: "ConfirmModal",
  props: {
    callback: {},
    active: {
      type: Boolean
    },
    icon: {
      type: String,
      default: 'info'
    },
    title: {
      type: String
    },
    content: {
      type: String
    },
    btnCancel: {
      type: String,
      default: 'No'
    },
    btnOk: {
      type: String,
      default: 'Yes'
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