<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDashStore } from '../store/dashboardStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { _Null } from '../types/types';

const { dashboard } = storeToRefs(useDashStore());
const { loading } = storeToRefs(useDashStore());

const nextBtn = ref<HTMLButtonElement | null>(null);
const prevBtn = ref<HTMLButtonElement | null>(null);
const pageNumber = ref<number>(0);

// TODO figure out how to debounce with page loading

// function debounce(cb, delay = 500) {
//   let timeout;
//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       cb.apply(this, args);
//     }, delay);
//   };
// }

onMounted(() => {
  useDashStore().paginateApls(pageNumber.value);
});

function dateOfBirth(dd: _Null<number>, mm: _Null<number>, yy: _Null<number>) {
  return `${dd}/${mm}/${yy}`;
}

const apls = computed(() => {
  return dashboard.value.apls;
});

const paginatedApls = computed(() => {
  return dashboard.value.paginatedApls;
});

const handlePage = async (mode: 'add' | 'sub') => {
  if (mode == 'add') {
    if (paginatedApls.value!.length == 10) {
      pageNumber.value += 1;
      await useDashStore().paginateApls(pageNumber.value);
    }
  } else {
    if (pageNumber.value !== 0) {
      pageNumber.value -= 1;
      await useDashStore().paginateApls(pageNumber.value);
    }
  }
};

const aplListNumber = (index: number) => {
  if (pageNumber.value == 0) {
    return index + 1;
  } else {
    return pageNumber.value * 10 + index + 1;
  }
};
</script>

<template>
  <div
    class="flex-1 p-3 bg-indigo-100 border-none rounded-3xl max-h-full flex gap-3"
  >
    <div
      class="chamber flex flex-col w-full rounded-3xl p-3 shadow-2xl bg-gray-50 overflow-y-scroll gap-3"
    >
      <div class="w-full">
        <h1
          class="text-center text-[2em] mb-5 bg-indigo-500 text-white rounded-lg font-bold"
        >
          Applicants List
        </h1>
        <table class="table mx-auto w-full" v-if="apls!.length > 0">
          <!-- head -->
          <thead>
            <tr>
              <th class="text-lg">#</th>
              <th class="text-lg">Avatar</th>
              <th class="text-lg">Name</th>
              <th class="text-lg">Phone Number</th>
              <th class="text-lg">Confirmation Code</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(apl, index) in paginatedApls" :key="index">
              <td>
                <div class="index text-center">
                  {{ aplListNumber(index) }}
                </div>
              </td>
              <td>
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img
                      :src="`https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${apl.aplImg_path.primePath![0]}`"
                      alt="Primary Apl Image"
                    />
                  </div>
                </div>
              </td>
              <td>
                <div class="flex items-center space-x-3">
                  <div>
                    <div class="font-bold">{{ apl.fullName }}</div>
                    <div class="text-sm opacity-50">
                      {{
                        dateOfBirth(apl.pdob_day, apl.pdob_month, apl.pdob_year)
                      }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                {{ apl.pcontact }}
                <br />
                <span class="badge badge-ghost badge-sm">{{
                  apl.passportAvail
                    ? 'Passport Available'
                    : 'Passport Unavailable'
                }}</span>
              </td>
              <td>
                {{
                  apl.pconf_code
                    ? apl.pconf_code
                    : 'Confirmation Code Unavailable'
                }}
              </td>
              <th>
                <Button
                  class="p-button-rounded bg-purple-500 self-center"
                  icon="pi
                        pi-search"
                  @click="
                    $router.push({
                      name: 'AplDetails',
                      params: { id: apl.apl_id },
                    })
                  "
                />
              </th>
            </tr>
          </tbody>
        </table>
        <div
          class="w-full min-h-full grid place-items-center font-bold text-[2.5em]"
          v-if="apls!.length == 0"
        >
          <span> No Applicants Yet! </span>
        </div>
      </div>
      <div v-if="apls!.length > 0" class="pagination w-2/5 mx-auto mt-5">
        <div class="btn-group">
          <button @click="handlePage('sub')" ref="prevBtn" class="btn">
            «
          </button>
          <button class="btn">
            Page {{ pageNumber + 1 }}
            <i class="ml-1 pi pi-spin pi-spinner" v-if="loading" />
          </button>
          <button @click="handlePage('add')" ref="nextBtn" class="btn">
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
