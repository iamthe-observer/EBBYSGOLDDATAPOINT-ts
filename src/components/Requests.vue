<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { onBeforeMount } from 'vue';
import { useRequestStore } from '../store/RequestStore';
import { supabase } from '../supabase/supabase';

onBeforeMount(() => {
  useRequestStore().getRequestsById(supabase.auth.user()?.id!);
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
        @click="useRequestStore().refresh()"
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
      v-if="useRequestStore().requests.length > 0"
    >
      <div
        v-for="(request, i) of useRequestStore().requests"
        :key="i"
        @click="useRequestStore().handleOpenAplRequest(request)"
        class="cursor-pointer modal-button"
      >
        <div
          class="flex items-center justify-evenly hover:text-purple-500 hover:bg-gray-300 px-4 group rounded-xl py-3"
        >
          <div class="w-full justify-center flex">
            <div :class="useRequestStore().status_class(request.status)">
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
        ><i
          v-if="useRequestStore().requests_loading"
          class="pi pi-spin pi-spinner mr-1"
        />No Requests requested lol...</span
      >
    </div>
    <teleport to="body">
      <Dialog
        :modal="true"
        :visible="useRequestStore().is_request_open"
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
              >{{ useRequestStore().current_request?.modify_apl.pfirstName }}'s
              {{ useRequestStore().current_request?.modify_type.toUpperCase() }}
              Request</span
            >
          </div>
        </template>
        <div class="flex items-center justify-center w-full gap-3 mt-[10px]">
          <div
            class="w-fit max-w-[30%] h-[300px] flex flex-col p-3 justify-center items-center bg-indigo-50 rounded-md gap-3 font-Outfit text-bold"
          >
            <img
              :src="`https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
                useRequestStore().prime_path
              }`"
              class="w-[100px] h-[100px] rounded-lg outline outline-[rgb(255,255,255)] outline-4"
            />
            <p class="font-bold text-center">
              {{ useRequestStore().current_request?.modify_apl.fullName }}
            </p>
            <p class="uppercase">
              {{
                useRequestStore().current_request?.modify_apl.pcontact
                  ? useRequestStore().current_request?.modify_apl.pcontact
                  : 'Contact Not Available'
              }}
            </p>
            <p
              :class="useRequestStore().status_class(useRequestStore().current_request!.status)"
            >
              {{ useRequestStore().current_request?.status }}
            </p>
          </div>
          <div
            class="font-bold flex flex-col max-w-[70%] p-3 rounded-md bg-purple-50 w-full h-[300px]"
          >
            <h3 class="text-center font-bold text-[2em]">
              Reason for Request :
            </h3>
            <div class="p-3 flex-1 w-full h-max bg-white rounded-md uppercase">
              {{ useRequestStore().current_request!.reason_body }}
            </div>
          </div>
        </div>

        <template #footer>
          <div class="w-full">
            <Button
              @click="
                useRequestStore().is_request_open =
                  !useRequestStore().is_request_open
              "
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
