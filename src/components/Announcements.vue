<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, Ref } from 'vue';
import { useAnnStore } from '../store/annStore';
import Toggle from './toggle.vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { Announcement } from '../interfaces/interfaces';
import { _Null } from '../types/types';
import { useDashStore } from '../store/dashboardStore';

const annStore = useAnnStore();
const { ann } = storeToRefs(annStore);
const { loading } = storeToRefs(annStore);
const refreshAnn = ref(0);
const viewAnn = ref(false);
const currentAnn: Ref<_Null<Announcement>> = ref(null);

const todayAnnArr = computed<Announcement[]>(() => {
  return ann.value!.filter(
    y =>
      useDashStore().fd(new Date(y.created_at)) ===
      useDashStore().fd(new Date())
  );
});
onMounted(() => {
  annStore.getAnn();
});

let currentAnnArr = ref<Announcement[] | null>([]);

// let getAnnounArr = computed(() => {
//   return announ[currentAnnArr.value];
// });

const isAnn = computed(() => {
  if (currentAnnArr.value!.length == 0) return false;
  return true;
});

const toggleEvt = (evt: boolean) => {
  if (!evt) {
    currentAnnArr.value = todayAnnArr.value;
  } else {
    currentAnnArr.value = ann.value;
  }
};

const changeDate = (date: Date) => {
  const day = new Date(date).toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return day;
};

const refresh = () => {
  annStore.resetAnn();
  annStore.getAnn();
  refreshAnn.value++;
};

const annStatus_class = (urg: string) => {
  if (urg == 'important') {
    return `text-xs w-[85px] text-center text-red-600 bg-red-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-red-600`;
  } else if (urg == 'high') {
    return `text-xs w-[85px] text-center text-purple-600 bg-purple-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-purple-600`;
  } else {
    return `text-xs w-[85px] text-center text-blue-600 bg-blue-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-blue-600`;
  }
};

const handleOpenAnn = (ann: Announcement, index: number) => {
  viewAnn.value = true;
  currentAnn.value = ann;
};
</script>

<template>
  <div
    class="p-2 mb-3 col-span-2 max-h-[300px] flex flex-col rounded-xl bg-white text-black gap-[5px] shadow-2xl"
  >
    <div class="flex justify-between">
      <h2 class="text-xl font-extrabold">Announcements</h2>
      <div class="min-w-[200px] min-h-[30px] flex gap-3 items-center">
        <Toggle @update="toggleEvt" />
        <i
          class="pi pi-refresh font-bold text-lg mr-2 cursor-pointer"
          @click="refresh"
        />
      </div>
    </div>
    <!-- header -->
    <div
      v-if="isAnn"
      class="flex uppercase justify-evenly text-gray-400 my-3 mb-1 rounded-xl text-center bg-gray-100 py-3"
    >
      <span class="w-full border-r-slate-300 border-transparent border-[2px]"
        >urgency</span
      ><span class="w-full border-r-slate-300 border-transparent border-[2px]"
        >subject</span
      ><span class="w-full">date</span>
    </div>
    <!-- render ann -->
    <div
      class="flex flex-col overflow-y-scroll bg-gray-100 rounded-xl"
      :key="refreshAnn"
    >
      <div
        v-for="(ann, i) in currentAnnArr"
        :key="i"
        @click="handleOpenAnn(ann, i)"
      >
        <div
          class="flex items-center justify-evenly hover:text-purple-500 hover:bg-gray-300 px-4 rounded-xl py-3 group"
        >
          <div class="w-full justify-center">
            <div :class="annStatus_class(ann.urgency)">
              {{ ann.urgency }}
            </div>
          </div>
          <div class="w-full text-center">{{ ann.subject }}</div>
          <div class="w-full text-center">
            {{ changeDate(ann.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!isAnn"
      class="bg-gray-100 flex items-center justify-evenly hover:text-purple-500 hover:bg-gray-300 px-4 font-bold rounded-xl py-3"
    >
      <span>
        <i class="pi pi-spin pi-spinner" v-if="loading" />
        No Announcements Yet</span
      >
    </div>

    <teleport to="body">
      <Dialog
        :modal="true"
        :visible="viewAnn"
        class="font-Outfit"
        :closable="false"
        :draggable="false"
        :style="{ width: '60%' }"
        :maximizable="false"
      >
        <template #header>
          <div class="flex gap-2 relative">
            <span
              class="relative font-bold text-3xl bg-purple-500 px-4 py-2 rounded-full text-white"
              >Announcement</span
            >
          </div>
        </template>
        <div class="flex items-center justify-center w-full gap-3 mt-[10px]">
          <div
            class="font-bold flex flex-col max-w-[70%] p-3 rounded-md bg-purple-50 w-full h-[300px]"
          >
            <h3 class="text-center font-bold text-[2em] uppercase">
              {{ currentAnn!.subject }}
            </h3>
            <div class="p-3 flex-1 w-full h-max bg-white rounded-md uppercase">
              {{ currentAnn!.body }}
            </div>
          </div>
        </div>

        <template #footer>
          <div class="w-full">
            <Button
              @click="viewAnn = !viewAnn"
              icon="pi pi-times"
              label="Close"
              class="p-button-rounded p-button-danger"
            />
          </div>
        </template>
      </Dialog>
    </teleport>
  </div>
</template>
