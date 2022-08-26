<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useRequestStore } from '../store/requestStore';
import { onMounted } from 'vue';

const store = useRequestStore();

onMounted(() => {
  store.getRequests();
});
</script>

<template>
  <div
    class="p-2 mb-3 col-span-2 max-h-[300px] flex flex-col rounded-xl bg-white text-black gap-[5px] shadow-2xl"
  >
    <div class="flex justify-between">
      <h2 class="text-xl font-extrabold">Review Requests</h2>
      <i
        class="pi pi-refresh font-bold text-lg mr-2 cursor-pointer"
        @click="store.refresh()"
      />
    </div>
    <div
      class="flex uppercase justify-evenly text-gray-400 my-3 mb-1 rounded-xl text-center bg-gray-100 py-3"
    >
      <span class="w-full border-r-slate-300 border-transparent border-[2px]"
        >status</span
      ><span class="w-full border-r-slate-300 border-transparent border-[2px]"
        >name</span
      ><span class="w-full">type</span>
    </div>

    <div
      class="overflow-y-scroll rounded-xl bg-gray-100"
      v-if="store.isRequest"
    >
      <div
        v-for="(request, i) of store.requests"
        :key="i"
        @click="store.handleOpenAplRequest(request)"
        class="cursor-pointer modal-button"
      >
        <div
          class="flex items-center justify-evenly hover:text-purple-500 hover:bg-gray-300 px-4 group rounded-xl py-3"
        >
          <div class="w-full justify-center flex">
            <div :class="store.statusClass(request.status)">
              {{ request.status }}
            </div>
          </div>
          <div
            class="w-full text-center text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {{ request.modify_apl.fullName }}
          </div>
          <div class="w-full text-center uppercase font-bold">
            {{ request.modify_type }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-gray-100 flex items-center justify-evenly hover:text-purple-500 hover:bg-gray-300 px-4 font-bold rounded-xl py-3"
    >
      <span
        ><i v-if="store.loading" class="pi pi-spin pi-spinner" />No
        Requests</span
      >
    </div>
    <teleport to="body">
      <Dialog
        :modal="true"
        :visible="store.isRequestOpen"
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
              >{{ store.currentRequest?.modify_apl.pfirstName }}'s
              {{ store.currentRequest?.modify_type.toUpperCase() }}
              Request</span
            >
          </div>
        </template>
        <div class="flex items-center justify-center w-full gap-3 mt-[10px]">
          <div
            class="w-fit max-w-[30%] h-[300px] flex flex-col p-3 justify-center items-center bg-indigo-50 rounded-md gap-3 font-Outfit text-bold"
          >
            <img
              :src="store.aplImg?.toString()"
              class="w-[100px] h-[100px] rounded-lg outline outline-[rgb(255,255,255)] outline-4"
            />
            <p class="font-bold text-center">
              {{ store.currentRequest?.modify_apl.fullName }}
            </p>
            <p class="uppercase">
              {{
                store.currentRequest?.modify_apl.pcontact
                  ? store.currentRequest?.modify_apl.pcontact
                  : 'Contact Not Available'
              }}
            </p>
            <p :class="store.statusClass(store.currentRequest!.status)">
              {{ store.currentRequest?.status }}
            </p>
          </div>
          <div
            class="font-bold flex flex-col max-w-[70%] p-3 rounded-md bg-purple-50 w-full h-[300px]"
          >
            <h3 class="text-center font-bold text-[2em]">
              Reason for Request :
            </h3>
            <div class="p-3 flex-1 w-full h-max bg-white rounded-md uppercase">
              {{ store.currentRequest!.reason_body }}
            </div>
          </div>
        </div>

        <template #footer>
          <div class="w-full">
            <Button
              @click="store.isRequestOpen = !store.isRequestOpen"
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
