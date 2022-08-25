<script setup lang="ts">
import { reactive } from 'vue';
import 'animate.css';
import GradientButton from '../components/gradientButton.vue';

interface Props {
  loading: boolean;
  errMsg: string;
}
interface Emits {
  (e: 'login'): void;
  (e: 'loginUser', userInfo: UserInfo): void;
}
interface UserInfo {
  email: string | null | undefined;
  password: string | null | undefined;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const userInfo = reactive<UserInfo>({
  email: null,
  password: null,
});

const handleLogin = (): void => {
  emit('loginUser', userInfo);
};
</script>

<template>
  <div class="flex justify-start">
    <form
      class="font-Outfit relative bg-[rgba(0,0,0,.15)] flex flex-col min-w-[40%] gap-[50px] p-[40px] h-full items-center justify-between shadow-xl backdrop-blur-md"
    >
      <div
        class="absolute top-1 left-1 font-Outfit px-[10px] py-[5px] text-center text-sm text-black bg-white rounded-md"
      >
        <img
          src="../assets/icons/world.png"
          class="w-4 aspect-square inline-block"
        />
        EbbysGold Database Access
      </div>

      <div class="p-[15px] text-center text-white font-bold text-[3rem]">
        <h1>WELCOME!</h1>
      </div>

      <div
        class="flex flex-col items-center w-full min-h-[50%] text-center p-3 justify-evenly"
      >
        <em class="text-white"
          >Enter <span class="text-purple-500">Credentials</span> below to log
          into the data point access</em
        >

        <div class="flex flex-col">
          <div class="flex w-full gap-3">
            <div class="max-w-[30px] flex items-center aspect-square">
              <img src="../assets/icons/arroba.png" />
            </div>
            <input
              v-model="userInfo.email"
              class="text-center font-[1.3rem] rounded-lg h-[40px] px-[15px] py-[10px] transition-all bg-[rgba(0,0,0,.3)] placeholder:text-white duration-300 text-white my-3 hover:bg-purple-500 backdrop-blur-lg focus:bg-purple-500 focus:outline-none"
              type="email"
              placeholder="Email"
              required
            />
          </div>

          <div class="flex w-full gap-3">
            <div class="max-w-[30px] flex items-center aspect-square">
              <img src="../assets/icons/key.png" />
            </div>
            <input
              class="text-center font-[1.3rem] rounded-lg h-[40px] px-[15px] py-[10px] transition-all bg-[rgba(0,0,0,.3)] placeholder:text-white duration-300 text-white my-3 hover:bg-purple-500 backdrop-blur-lg focus:bg-purple-500 focus:outline-none"
              v-model="userInfo.password"
              type="password"
              autocomplete="on"
              placeholder="Password"
              required
            />
          </div>
        </div>
        <div>
          <span class="errMsg">{{ errMsg }}</span>
        </div>
        <gradient-button class="hover:scale-110" @click.prevent="handleLogin()">
          <template #default v-if="!loading">LOGIN</template>
          <template #loading v-if="loading"
            ><i class="pi pi-spin pi-spinner text-[1rem]"></i
          ></template>
        </gradient-button>
      </div>
    </form>
    <div class="w-full flex justify-center items-center">
      <img src="../assets/images/undraw_login.svg" class="w-[30em]" />
    </div>
  </div>
</template>

<!-- TODO LEARN SQL BRO!!! -->
