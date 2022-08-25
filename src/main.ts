import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import VCalendar from 'v-calendar';
import ToastService from 'primevue/toastservice';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(VCalendar, {});
app.use(ToastService);
app.use(PrimeVue, { ripple: true });
app.use(router);
app.mount('#app');
