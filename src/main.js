import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Parse from './helpers/Parse';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSecret, faTimes, faInfo, faForward, faPause, faPlay, faUser, faSmileBeam, faComments, faCheck, faExclamationTriangle, faCheckCircle, faTimesCircle, faArrowLeft, faArrowRight, faArrowUp, faArrowDown, faChevronLeft, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import vClickOutside from 'v-click-outside'

import VueTour from 'vue-tour'

require('vue-tour/dist/vue-tour.css')

Vue.use(VueTour)

import Vuesax from 'vuesax'

import 'vuesax/dist/vuesax.css' //Vuesax styles
Vue.use(Vuesax, {
  // options here
})


import Toast from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";
Vue.use(Toast);



Vue.use(vClickOutside)
library.add(faUserSecret, faTimes, faInfo, faForward, faPause, faPlay, faUser, faSmileBeam, faComments, faCheck, faExclamationTriangle, faCheckCircle, faTimesCircle, faArrowLeft, faArrowRight, faArrowUp, faArrowDown, faChevronLeft, faChevronRight, faChevronDown);

Vue.component('font-awesome-icon', FontAwesomeIcon)

// import Loader from '@/components/Loader';

// Vue.component('loader', Loader);

Parse.init();
import store from './store/index';
import 'vue-json-pretty/lib/styles.css';
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    window.localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
  }
});