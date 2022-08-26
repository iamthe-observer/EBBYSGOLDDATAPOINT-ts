<!-- <script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ProgressSpinner from 'primevue/progressspinner';
import ImgView from '../components/imgView.vue';

const route = useRoute();
const UserData:ComputedRef<{}> = computed(() => JSON.parse(route.params.data));
const loading = ref(false);

onMounted(() => {});
</script>

<template>
  <div
    class="flex-1 p-5 bg-indigo-100 border-none rounded-3xl [max-height:100%] flex gap-3"
  >
    <div v-if="loading" class="flex justify-center items-center w-full">
      <ProgressSpinner strokeWidth="4" animationDuration="1s" />
    </div>
    <div
      v-else
      class="flex flex-col gap-[30px] min-w-full flex-1 min-h-full bg-gray-50 overflow-y-scroll rounded-2xl p-[20px]"
    >
      <div class="flex gap-3">
        <div class="flex flex-col justify-between">
          <ImgView
            class="my-0"
            :url="
              UserData.avatar_path
                ? `avatars/${UserData.avatar_path}`
                : `avatars/avatar.svg`
            "
          />
          <span class="text-center font-bold text-xl"
            >@{{ UserData.username }}</span
          >
        </div>
        <div
          class="flex flex-col rounded-xl w-full gap-[15px] items-center bg-gradient-to-bl text-white from-indigo-300 to-purple-300 shadow-2xl p-3 max-w-full"
        >
          <div
            class="w-full bg-white rounded-xl text-center text-black py-2 font-bold tracking-[1.5em]"
          >
            TOTAL SUMMARY
          </div>
          <div class="flex justify-evenly w-full min-h-max self-center">
            <div class="flex flex-col text-center border-left-2 border-white">
              <span class="font-bold text-2xl">23</span>
              <span class="">Applicants</span>
            </div>
            <div class="flex flex-col text-center border-left-2 border-white">
              <span class="font-bold text-2xl">22</span>
              <span class="">Accounts</span>
            </div>
            <div class="flex flex-col text-center border-left-2 border-white">
              <span class="font-bold text-2xl">21</span>
              <span class="">Review Requests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> -->
