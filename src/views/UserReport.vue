<script setup lang="ts">
import ImgView from '../components/imgView.vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../store/userStore';
import { onBeforeMount, ref, ComputedRef, watchEffect } from 'vue';
import { computed } from '@vue/reactivity';
import { Applicant } from '../interfaces/interfaces';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import Card from '../components/Card.vue';
import { supabase } from '../supabase/supabase';

const { curr_userData } = storeToRefs(useUserStore());
const route = useRoute();
const user_id: ComputedRef<any> = computed(() => route.params.id);
const allUserApls = ref<Applicant[]>();

const load_allUserApls = async () => {
  try {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('user_id', user_id.value);
    if (error) throw error;
    allUserApls.value = data;
  } catch (error: any) {}
};
// console.log(curr_userData.value?.apls);

const loading = ref<boolean>(false);

onBeforeMount(async () => {
  await load_allUserApls();
  console.log(allUserApls.value);
});

const userImage = computed((): string => {
  if (curr_userData.value?.profile.avatar_path) {
    return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${curr_userData.value?.profile.avatar_path}`;
  } else {
    return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/avatar.svg`;
  }
});

const total_daily$ = computed<number>(() => {
  let val = curr_userData.value?.apls!.map(apl => {
    return apl.totalPayment;
  });
  return val!.reduce(function (p, n) {
    return p + n;
  });
});
</script>

<template>
  <div
    class="flex-1 p-5 bg-indigo-100 border-none rounded-3xl [max-height:100%] flex gap-3"
  >
    <div
      class="flex flex-col gap-[30px] min-w-full flex-1 min-h-full bg-gray-50 overflow-y-scroll rounded-2xl p-[20px]"
    >
      <div class="flex gap-3 flex-col">
        <div class="flex flex-col justify-between"></div>
        <!-- head -->
        <div
          class="flex flex-col rounded-xl w-full gap-[15px] items-center bg-gradient-to-bl text-white from-indigo-300 to-purple-300 shadow-2xl p-3 max-w-full"
        >
          <div
            class="w-full bg-white rounded-xl text-center text-black py-2 text-lg font-extrabold tracking-[1.5em]"
          >
            EMPLOYEE SUMMARY
          </div>
        </div>

        <!-- image and quick info -->
        <div class="flex justify-between items-center">
          <ImgView :url="curr_userData?.profile.avatar_url!" />
          <div class="grid col-1 min-w-full h-full">
            <Card
              class="mb-3 bg-gradient-to-bl from-indigo-100 to-indigo-300"
              :header="'Total Applicants Today'"
            >
              <template #icon>
                <img src="../assets/icons/calendar.png" class="w-[40px]" />
              </template>
              <template #body>
                <div class="flex flex-col w-full">
                  <span class="text-xs">Total Applicants Today</span>
                  <!-- <span class="text-2xl">{{ total_user$ || 0 }}</span> -->
                  <span class="text-2xl">{{ total_daily$ }}</span>
                </div>
              </template>
            </Card>
            <Card></Card>
            <Card></Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
