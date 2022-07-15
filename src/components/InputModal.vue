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
            <h2 class="text-center d-block textb border-bottom mt-4">{{title}}</h2>
            <div class="modal-body pt-0">
              <div v-for="field in fields" :key="field.name" class="form mb-3 text-left">
                  <label class="mb-2">{{field.label}}</label>
                  <textarea v-if="field.type == 'textarea'" v-model="field.model" class="form-control"></textarea>
                  <input v-else v-model="field.model" type="text" class="form-control" :placeholder="field.placeholder || ''"/>
              </div>
              <div class="d-flex justify-content-between flex-wrap align-content-center mt-2">
                  <div class="col-xl-6 col-6 text-center">
                    <a @click="handleCancel" class="btn btn-outline-black d-block me-2" data-mdb-dismiss="modal">{{btnCancel}}</a>
                  </div>
                  <div class="col-xl-6 col-6 d-flex text-center">
                    <a @click="handleOk" class="btn btn-black d-block w-100 ms-2">{{btnOk}}</a>
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
  name: "InputModal",
  props: {
    callback: {},
    active: {
      type: Boolean
    },
    fields: {
      type: Array
    },
    title: {
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