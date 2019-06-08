import Vue from 'vue'
import App from './App.vue'
import router from './router'
import iView from 'iview'
import 'iview/dist/styles/iview.css';

Vue.config.productionTip = false

Vue.use(iView);

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
