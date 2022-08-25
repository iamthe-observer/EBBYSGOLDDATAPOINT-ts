<script setup>
import { reactive } from 'vue';
import 'animate.css';
import gradientButton from '../composables/gradientButton.vue';

const props = defineProps(['loading', 'errMsg']);
const emit = defineEmits(['register', 'registerUser']);

const registerInfo = reactive({
  email: null,
  password: null,
  confirmPassword: null,
});

// TODO be able to update apl pics
</script>

<template>
  <div class="flex justify-start">
    <form
      class="font-Outfit relative bg-[rgba(0,0,0,.15)] flex flex-col min-w-[40%] gap-[50px] p-[40px] h-screen items-center justify-between shadow-xl backdrop-blur-md"
    >
      <div
        class="absolute top-1 left-1 font-Bebas_Neue px-[10px] py-[5px] text-center text-sm text-black bg-white rounded-md"
      >
        <img
          src="../assets/icons/world.png"
          class="w-4 aspect-square inline-block"
        />
        EbbysGold Database Access
      </div>

      <div class="p-[15px] text-center text-white font-bold text-[3rem]">
        <h1>REGISTER</h1>
      </div>

      <div
        class="flex flex-col items-center w-full min-h-[50%] text-center justify-evenly"
      >
        <em class="text-white"
          >Enter <span class="text-purple-500">Information</span> below to
          register for the data point access</em
        >

        <div class="flex flex-col">
          <div class="flex w-full gap-3">
            <div class="max-w-[30px] flex items-center aspect-square">
              <img src="../assets/icons/arroba.png" />
            </div>
            <input
              v-model="registerInfo.email"
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
              v-model="registerInfo.password"
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <div class="flex w-full gap-3">
            <div class="max-w-[30px] flex items-center aspect-square">
              <img src="../assets/icons/password.png" />
            </div>
            <input
              class="text-center font-[1.3rem] rounded-lg h-[40px] px-[15px] py-[10px] transition-all bg-[rgba(0,0,0,.3)] placeholder:text-white duration-300 text-white my-3 hover:bg-purple-500 backdrop-blur-lg focus:bg-purple-500 focus:outline-none"
              v-model="registerInfo.confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
            />
          </div>
        </div>
        <div>
          <span class="errMsg">{{ errMsg }}</span>
        </div>
        <div class="outputs">
          <gradient-button
            class="hover:scale-110"
            @click.prevent="$emit('registerUser', registerInfo)"
          >
            <template #default v-if="!loading">Sign Up</template>
            <template #loading v-if="loading"
              ><i class="pi pi-spin pi-spinner text-[1rem]"></i
            ></template>
          </gradient-button>
        </div>
      </div>
      <div class="flex flex-col">
        <span>Have an account?</span>
        <div
          class="cursor-pointer text-center font-bold text-purple-600 hover:text-indigo-600"
          @click="$emit('register', 'login')"
        >
          Log In Here!
        </div>
      </div>
    </form>
    <div class="w-full flex justify-center items-center">
      <img
        src="../assets/images/undraw_authentication_re_svpt.svg"
        class="w-[15em]"
      />
    </div>
  </div>
</template>
