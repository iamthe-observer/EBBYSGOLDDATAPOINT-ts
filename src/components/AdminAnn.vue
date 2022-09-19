<script setup lang="ts">
import { ref, computed, Ref, watchEffect, onMounted } from 'vue';
import { useAnnStore } from '../store/AnnStore';
import Toggle from './toggle.vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ToggleButton from 'primevue/togglebutton';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { Announcement } from '../interfaces/interfaces';
import { _Null } from '../types/types';
import { useDashStore } from '../store/DashboardStore';

const toast = useToast();
const annStore = useAnnStore();
const { announcements } = storeToRefs(annStore);
const { announcements_loading } = storeToRefs(annStore);
const refreshAnn = ref(0);
const viewAnn = ref(false);
const currentAnn: Ref<_Null<Announcement>> = ref(null);
const urgency = ref<boolean>(false);
const subjbody = ref<boolean>(false);

const todayAnnArr = computed<Announcement[]>(() => {
  return announcements.value!.filter(
    y =>
      useDashStore().fd(new Date(y.created_at)) ===
      useDashStore().fd(new Date())
  );
});

onMounted(() => {
  annStore.getAnnouncements();
});

let currentAnnArr = ref<Announcement[] | null>(todayAnnArr.value);

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
    currentAnnArr.value = announcements.value;
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

const refresh = async () => {
  annStore.reset();
  const ann = await annStore.getAnnouncements();
  annStore.setAnnouncements(ann?.data!);
  refreshAnn.value++;
};

const annStatus_class = (urg: 'high' | 'low') => {
  if (urg == 'high') {
    return `text-xs w-[85px] text-center text-purple-600 bg-purple-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-purple-600`;
  } else {
    return `text-xs w-[85px] text-center text-blue-600 bg-blue-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-blue-600`;
  }
};

const handleOpenAnn = (ann: Announcement) => {
  viewAnn.value = true;
  currentAnn.value = ann;
};

const showInputAnnSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Announcement Sent',
    detail: '',
    life: 4000,
  });
};
const showInputAnnError = () => {
  toast.add({
    severity: 'error',
    summary: 'Enter Subject!',
    detail: '',
    life: 2000,
  });
};

const subject = ref<_Null<string>>(null);
const body = ref<string | number | string[] | undefined>(undefined);
const inputLoading = ref<boolean>();

async function inputAnn() {
  inputLoading.value = true;
  if (subject.value) {
    await useAnnStore().inputAnnouncement([
      {
        subject: subject.value,
        body: body.value,
        urgency: urgency.value ? 'high' : 'low',
      },
    ]);
    inputLoading.value = false;
    subjbody.value = false;
    subject.value = '';
    body.value = '';
    showInputAnnSuccess();
  } else {
    showInputAnnError();
    subjbody.value = false;
    inputLoading.value = false;
  }
  return;
}
</script>

<template>
  <div
    class="p-2 mb-3 col-span-2 max-h-[600px] flex flex-col rounded-xl bg-white text-black gap-[5px] shadow-2xl"
  >
    <Toast />
    <div class="flex justify-between">
      <h2 class="text-xl font-extrabold">Announcements</h2>
      <div
        class="min-w-[200px] min-h-[30px] flex gap-3 items-center justify-end"
      >
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
      class="flex flex-col overflow-y-scroll max-h-[200px] bg-gray-100 rounded-xl"
      :key="refreshAnn"
    >
      <div
        v-for="(ann, i) in currentAnnArr"
        :key="i"
        @click="handleOpenAnn(ann)"
      >
        <div
          class="flex items-center justify-evenly hover:text-purple-500 hover:bg-gray-300 px-4 rounded-xl py-3 group"
        >
          <div class="w-full justify-center">
            <div :class="annStatus_class(ann.urgency ? 'high' : 'low')">
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
        <i class="pi pi-spin pi-spinner" v-if="announcements_loading" />
        No Announcements Yet</span
      >
    </div>
    <hr class="w-full mt-3 mb-2 bg-zinc-300" />

    <h2 class="text-xl font-extrabold">Give An Announcement</h2>

    <div class="flex gap-2 font-bold rounded-xl">
      <!-- subject -->
      <ToggleButton
        v-model="urgency"
        onLabel="High"
        offLabel="Low"
        onIcon="pi pi-caret-up"
        offIcon="pi pi-caret-down"
        class="self-start"
      />
      <input
        v-if="!subjbody"
        v-model="subject"
        type="text"
        class="w-full text-center rounded-xl font-Outfit p-2 bg-[rgb(240,240,240)] focus:outline focus:outline-2 focus:outline-zinc-300 text-lg"
        placeholder="SUBJECT"
      />
      <Button
        @click="subjbody = true"
        v-if="!subjbody"
        label="Next"
        class="bg-indigo-500 self-start"
        icon="pi pi-check"
      />
      <!-- body -->
      <textarea
        v-if="subjbody"
        v-model="body"
        type="text"
        class="w-full text-center rounded-xl font-Outfit p-2 bg-[rgb(240,240,240)] focus:outline focus:outline-2 focus:outline-zinc-300 text-xl"
        placeholder="BODY"
      ></textarea>
      <Button
        v-if="subjbody"
        label="Send"
        @click="inputAnn()"
        class="bg-indigo-500 self-start"
        icon="pi pi-save"
        :loading="inputLoading"
      />
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
              {{ currentAnn?.body }}
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
