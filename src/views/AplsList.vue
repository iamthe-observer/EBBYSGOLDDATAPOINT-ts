<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { _Null } from '../types/types';
import { useApplicantStore } from '../store/ApplicantStore';
import { supabase } from '../supabase/supabase';
import _ from 'lodash';

const { paginated_applicants } = storeToRefs(useApplicantStore());
const { applicants } = storeToRefs(useApplicantStore());
const { applicants_loading } = storeToRefs(useApplicantStore());

const nextBtn = ref<HTMLButtonElement | null>(null);
const prevBtn = ref<HTMLButtonElement | null>(null);
const page_number = ref<number>(0);

onMounted(async () => {
  let id = supabase.auth.user()?.id;
  let paginatedApls = await useApplicantStore().getPaginatedApls(
    page_number.value,
    id!
  );
  useApplicantStore().setPaginatedApplicants(paginatedApls?.data!);
});

function dateOfBirth(dd: _Null<number>, mm: _Null<number>, yy: _Null<number>) {
  return `${dd}/${mm}/${yy}`;
}

const goToPage = _.debounce(async () => {
  let ID = supabase.auth.user()?.id;
  if (paginated_applicants.value?.length == 10) {
    let page_apls = await useApplicantStore().getPaginatedApls(
      page_number.value,
      ID!
    );
    useApplicantStore().setPaginatedApplicants(page_apls?.data!);
  }
}, 500);

const handlePage = (mode: 'next' | 'prev') => {
  if (mode === 'next') {
    page_number.value += 1;
    goToPage();
  } else {
    page_number.value -= 1;
    goToPage();
  }
};

const aplListNumber = (index: number) => {
  if (page_number.value == 0) {
    return index + 1;
  } else {
    return page_number.value * 10 + index + 1;
  }
};

const apl_image = (path: string): string => {
  if (!path)
    return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/avatar.svg`;

  return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${path}`;
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
        <table class="table mx-auto w-full" v-if="applicants!.length > 0">
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
            <tr v-for="(apl, index) in paginated_applicants" :key="index">
              <td>
                <div class="index text-center">
                  {{ aplListNumber(index) }}
                </div>
              </td>
              <td>
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img
                      :src="apl_image(apl.aplImg_path.primePath![0])"
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
          v-if="applicants!.length == 0"
        >
          <span> No Applicants Yet! </span>
        </div>
      </div>
      <div v-if="applicants!.length > 0" class="pagination w-2/5 mx-auto mt-5">
        <div class="btn-group">
          <button @click="handlePage('prev')" ref="prevBtn" class="btn">
            «
          </button>
          <button class="btn">
            Page {{ page_number + 1 }}
            <i class="ml-1 pi pi-spin pi-spinner" v-if="applicants_loading" />
          </button>
          <button @click="handlePage('next')" ref="nextBtn" class="btn">
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
