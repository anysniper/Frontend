import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home/index.vue'
import CopyTrading from '@/views/CopyTrading/index.vue'
import Contract from '@/views/Contract/index.vue';
// import store from '../store';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/contract/:address?',
    name: 'Contract',
    component: Contract,
  },

  // Copy Trading
  {
    path: '/copytrading',
    name: 'CopyTrading',
    component: CopyTrading
  },
]

const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  // console.log('ROUTER MIDDLEWARE', store.state.account);
  // if (to.name !== 'Home' && !isAuthenticated) next({ name: 'Login' })
  // else next()
  next();
})

export default router
