<script setup lang="ts">
import Login from './Login.vue';
import { shallowRef, ref, onBeforeMount, Ref } from 'vue';
import { supabase } from '../supabase/supabase';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { required, email } from '@vuelidate/validators';
import { computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
interface LoginInUser {
  (e: 'logIn', emit: emitLogin): void;
}

interface AdminEmail {
  id: number;
  created_at: Date;
  email: string;
  name: string;
  user_id: string;
}

type UserDetails = {
  email: string;
  password: string;
};

type emitLogin = {
  val: boolean;
  adminLoggedIn: string;
};

const toast = useToast();
const currContent: object = shallowRef(Login);
const emit = defineEmits<LoginInUser>();
const router = useRouter();
const loading = ref<boolean>(false);
const errMsg = ref<string>('');
const adminEmails: Ref<AdminEmail[] | null> = ref(null);
function checkPassword(str: string) {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return re.test(str);
}

onBeforeMount(async () => {
  try {
    let { data, error } = await supabase.from('admin_emails').select('*');
    if (error) throw error;
    adminEmails.value = data;
  } catch (err: object) {
    console.log(err.message);
  }
});

const rules = computed(() => {
  return {
    email: { required, email },
    password: { required },
  };
});

async function loginUser(user: UserDetails) {
  const v$l = useVuelidate(rules, user);
  let val: any = await v$l.value.$validate();
  console.log(val);

  if (!val) {
    v$l.value.$errors.forEach(err => {
      alert(err.$message);
    });
  } else {
    alert('submitted!');
    try {
      let { error } = await supabase.auth.signIn({
        email: user.email,
        password: user.password,
      });
      if (error) throw error;

      const user_email = supabase.auth.user()!.email!;
      const adminLoggedIn = adminEmails.value!.filter(
        user => user_email == user.email
      );
      emit('logIn', {
        val: true,
        adminLoggedIn: adminLoggedIn[0] ? 'admin' : 'user',
      });
      router.push({ name: 'Dashboard' });
      loading.value = false;
      return;
    } catch (err: object) {
      errMsg.value = err.message;
      loading.value = false;
      setTimeout(() => {
        errMsg.value = '';
      }, 4000);
    } finally {
      loading.value = false;
    }
  }
  loading.value = true;
}
</script>

<template>
  <div class="header">
    <div class="inner-header flex"></div>

    <div>
      <svg
        class="waves"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shape-rendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g class="parallax">
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="0"
            fill="rgba(255,255,255,0.7"
          />
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="3"
            fill="rgba(255,255,255,0.5)"
          />
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="5"
            fill="rgba(255,255,255,0.3)"
          />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg>
    </div>
  </div>

  <div class="content flex"></div>

  <div class="absolute inset-0 h-screen">
    <Toast />
    <Transition
      enter-active-class=" animate__animated animate__fadeIn animate__faster"
      leave-active-class="animate__animated animate__fadeOut animate__faster"
      name="custom-classes"
      mode="out-in"
    >
      <component
        class="absolute inset-0"
        @loginUser="loginUser"
        :errMsg="errMsg"
        :loading="loading"
        :is="currContent"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* @import url(//fonts.googleapis.com/css?family=Lato:300:400); */

body {
  margin: 0;
}

h1 {
  font-family: outfit, sans-serif;
  font-weight: 300;
  letter-spacing: 2px;
  font-size: 48px;
}
p {
  font-family: 'Lato', sans-serif;
  letter-spacing: 1px;
  font-size: 14px;
  color: #333333;
}

.header {
  position: relative;
  text-align: center;
  background: linear-gradient(
    60deg,
    rgba(84, 58, 183, 1) 0%,
    rgba(0, 172, 193, 1) 100%
  );
  color: white;
}
.logo {
  width: 50px;
  fill: white;
  padding-right: 15px;
  display: inline-block;
  vertical-align: middle;
}

.inner-header {
  height: 65vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

.flex {
  /*Flexbox for containers*/
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.waves {
  position: relative;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px; /*Fix for safari gap*/
  min-height: 100px;
  max-height: 150px;
}

.content {
  position: relative;
  height: 20vh;
  text-align: center;
  background-color: white;
}

/* Animation */

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}
.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}
@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}
/*Shrinking for mobile*/
@media (max-width: 768px) {
  .waves {
    height: 40px;
    min-height: 40px;
  }
  .content {
    height: 30vh;
  }
  h1 {
    font-size: 24px;
  }
}
</style>
