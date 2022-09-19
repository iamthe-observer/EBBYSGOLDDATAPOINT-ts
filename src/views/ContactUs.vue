<script setup lang="ts">
import Carousel from 'primevue/carousel';
import { useDashStore } from '../store/DashboardStore';
import { storeToRefs } from 'pinia';
import { useProfileStore } from '../store/ProfileStore';

const { supervisor_info } = storeToRefs(useDashStore());
</script>

<template>
  <div
    class="flex-1 p-3 bg-indigo-100 border-none rounded-3xl max-h-full flex gap-3"
  >
    <div
      class="chamber flex flex-col w-full rounded-3xl p-3 shadow-2xl bg-gray-50 overflow-y-scroll gap-3"
    >
      <div class="mx-auto flex items-center h-[100px]">
        <span
          class="px-4 py-2 text-white text-2xl font-bold rounded-lg bg-indigo-500"
          >Get in Touch with our Supervisors!</span
        >
      </div>

      <div class="h-full mx-auto flex gap-2 items-center">
        <div
          v-for="(info, i) in supervisor_info"
          :key="i"
          class="card min-h-[300px] w-fit bg-gradient-to-br from-purple-300 to-indigo-300 shadow-xl rounded-xl text-white"
        >
          <div class="card-body">
            <div>
              <h4 class="mb-1 font-bold text-[2.0em] text-center">
                {{ info.name }}
              </h4>
              <h6 class="mt-0 mb-3 font-semibold text-center">
                <i class="pi pi-phone"></i> Phone:
                {{ info.phone_number }}
              </h6>
              <h6 class="font-semibold text-center w-full">
                <i class="pi pi-whatsapp"></i> Whatsapp:
                {{ info.whatsapp_number }}
              </h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-select > div {
  padding: 1rem;

  color: white;
  background-color: #2ea169;

  border-radius: 0.3rem;

  text-align: center;
  font-weight: bold;
}

/* Don't forget to hide the original file input! */
.file-select > input[type='file'] {
  display: none;
}
</style>
