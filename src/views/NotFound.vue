<script setup>
import { storeToRefs } from 'pinia';
import { useProfileStore } from '../store/profileStore';
import { onMounted, onBeforeUnmount } from 'vue';

const { isNotFound } = storeToRefs(useProfileStore());
onMounted(() => {
  isNotFound.value = true;
});

onBeforeUnmount(() => {
  isNotFound.value = false;
});
</script>

<template>
  <div
    class="flex-1 p-3 bg-indigo-100 border-none rounded-3xl [max-height:100%] flex gap-3"
  >
    <div
      class="chamber flex-col flex w-full rounded-3xl p-3 shadow-2xl bg-gray-50 overflow-y-scroll gap-3 items-center justify-center"
    >
      <div class="w-[300px] aspect-square">
        <img src="../assets/icons/error.png" class="" />
      </div>
      <span>Page Not Found</span
      ><span
        @click="$router.push('/dashboard')"
        class="text-indigo-400 transition-all duration-500 ease-out cursor-pointer hover:bg-indigo-400 hover:text-white px-3 py-1 rounded-md"
        >Go To Home</span
      >
    </div>
  </div>
</template>
