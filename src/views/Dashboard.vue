<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from 'vue';
import { useProfileStore } from '../store/profileStore';
import { useAppStore } from '../store/Appstore';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import DataView from 'primevue/dataview';
import { storeToRefs } from 'pinia';
import Chip from 'primevue/chip';
import { useApplicantStore } from '../store/ApplicantStore';
import AdminDashComp from '../components/AdminDashComp.vue';
import { supabase } from '../supabase/supabase';
import { useRequestStore } from '../store/RequestStore';

const Announcements = defineAsyncComponent(
  () => import('../components/Announcements.vue')
);
const Requests = defineAsyncComponent(
  () => import('../components/Requests.vue')
);
const Card = defineAsyncComponent(() => import('../components/Card.vue'));
let { content } = storeToRefs(useAppStore());
const { active_profile } = storeToRefs(useProfileStore());
const { role } = storeToRefs(useProfileStore());
const { total_applicants_number } = storeToRefs(useApplicantStore());
const { daily_service_sales } = storeToRefs(useApplicantStore());
const { daily_user_applicants } = storeToRefs(useApplicantStore());
const display = ref(false);

const attrs = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
]);

const image = (path: string) => {
  if (!path) {
    return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/avatar.svg`;
  } else {
    return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${path}`;
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
      <div class="flex w-full gap-3" v-if="role">
        <div id="left" class="Main w-full">
          <div class="flex gap-5">
            <h3 class="font-extrabold text-2xl">Dashboard</h3>

            <div
              @click="
                () => {
                  content! = 'search';
                  $router.push('/database');
                }
              "
              class="flex items-center justify-between py-1 px-3 w-[min(60%,130px)] bg-indigo-50 shadow-lg transition-all ease-in duration-200 hover:translate-y-[-.2em] group hover:bg-indigo-200 rounded-full self-center cursor-pointer outline outline-4 hover:outline-indigo-300 outline-indigo-100 group"
            >
              <img
                src="../assets/icons/magnifying-glass.png"
                class="flex-shrink w-[20px] group-hover:invert transition-all ease-in duration-200"
              />
              <span
                class="text-slate-300 text-sm group-hover:text-slate-50 transition-all ease-in duration-200"
                >Search</span
              >
            </div>
          </div>

          <div
            class="px-4 flex items-center w-full relative bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-2xl h-[6em] mb-6 my-6"
          >
            <div class="flex flex-col min-w-[55%] text-white">
              <span class="text-sm font-normal text-white"
                >Welcome
                {{ active_profile ? active_profile.username : 'user' }}!</span
              >
              <span class="text-2xl text-indigo-100"
                >Check your daily announcements!</span
              >
            </div>

            <img
              src="../assets/images/undraw_work_time_re_hdyv.svg"
              class="w-[140px] absolute bottom-[0px] right-3"
            />
          </div>
          <div class="infoComp flex flex-col gap-4">
            <Suspense>
              <template #default>
                <Announcements class="chamber" />
              </template>
              <template #fallback>
                <Skeleton height="6rem" />
              </template>
            </Suspense>
            <Suspense>
              <template #default>
                <Requests />
              </template>
              <template #fallback>
                <Skeleton height="6rem" />
              </template>
            </Suspense>
          </div>
        </div>

        <div id="right" class="min-w-[30%]">
          <v-calendar
            :attributes="attrs"
            ref="calendar"
            title-position="left"
            trim-weeks
            color="indigo"
            class="min-w-full shadow-xl mt-8 mb-4"
          />
          <Card
            class="mb-3 bg-gradient-to-bl from-cyan-100 to-cyan-300"
            :header="'Total of Completed Applicants'"
          >
            <template #icon>
              <img src="../assets/icons/all.png" class="w-[40px]" />
            </template>
            <template #body>
              <div class="flex flex-col w-full">
                <span class="text-xs">Total of Completed Applicants</span>
                <span class="text-2xl">{{ total_applicants_number || 0 }}</span>
              </div>
            </template>
            <template #openModalIcon>
              <i
                class="pi pi-arrow-up-left text-{1.5em} cursor-pointer self-end hover:translate-y-[-5px] transition-all duration-200 ease-linear"
                @click="$router.push({ name: 'AplsList' })"
              ></i>
            </template>
          </Card>

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
                <span class="text-2xl">{{
                  daily_user_applicants?.length || 0
                }}</span>
              </div>
            </template>
          </Card>

          <Card class="mb-3 bg-gradient-to-bl from-purple-100 to-purple-300">
            <template #icon>
              <img
                src="../assets/icons/cedi.png"
                class="w-[40px] aspect-square"
              />
            </template>
            <template #body>
              <div class="flex flex-col w-full">
                <span class="text-xs">Service Sales Today</span>
                <span class="text-2xl">{{ daily_service_sales || 0 }}.00</span>
              </div>
            </template>
            <template #openModalIcon>
              <i
                class="pi pi-arrow-up-left text-{1.5em} cursor-pointer self-end hover:translate-y-[-5px] transition-all duration-200 ease-linear"
                @click="display = !display"
              ></i>
            </template>
            <template #modal>
              <Dialog
                :visible="display"
                :modal="true"
                class="font-Outfit"
                :closable="false"
                :style="{ width: '60%' }"
                :draggable="false"
                :maximizable="daily_user_applicants?.length != 0"
                contentClass="pt-[24px]"
              >
                <template #header>
                  <div class="flex gap-2 relative">
                    <span
                      class="relative font-bold text-3xl bg-purple-500 px-4 py-2 rounded-full text-white"
                    >
                      Service Sales Today</span
                    >
                    <span
                      class="font-bold absolute text-sm text-center bg-red-500 px-2 py-1 rounded-full text-white flex items-center right-[-45px] top-[-15px] shadow-xl"
                      ><i class="pi pi-money-bill mr-1"></i>
                      {{ daily_service_sales || 0 }}.00</span
                    >
                  </div>
                </template>
                <div class="flex justify-center">
                  <span
                    class="text-center font-semibold"
                    v-if="daily_user_applicants?.length == 0"
                    >No Applied Applicants Today!</span
                  >
                  <DataView
                    v-if="daily_user_applicants?.length! > 0"
                    :value="daily_user_applicants"
                    layout="list"
                    class="w-full mx-4"
                    :data-key="'data'"
                  >
                    <template #list="slotProps">
                      <div
                        class="product-list-item min-h-[100px] flex w-full font-Outfit justify-between mb-3 group hover:bg-gray-200 rounded-lg p-3 transition-all duration-200 ease-linear"
                      >
                        <div class="flex gap-3">
                          <img
                            :src="
                              image(slotProps.data.aplImg_path.primePath[0])
                            "
                            class="w-[100px] h-[100px] rounded-lg"
                          />
                          <div
                            class="product-list-detail flex flex-col justify-between"
                          >
                            <div class="product-name text-xl font-bold">
                              {{ slotProps.data.fullName }}
                            </div>
                            <div class="product-description text-md">
                              {{ slotProps.data.pcontact }}
                            </div>
                            <div class="grid w-full grid-cols-3 gap-3 mt-2">
                              <Chip
                                v-if="slotProps.data.slastName"
                                label="Has Spouse"
                                :image="
                                  image(slotProps.data.aplImg_path.secPath[0])
                                "
                                class="mr-2 mb-2 group-hover:text-white group-hover:bg-gray-400 transition-all duration-200 ease-linear font-Outfit"
                              />
                              <Chip
                                v-if="slotProps.data.wards.length > 0"
                                label="Has Ward(s)"
                                icon="pi pi-user"
                                class="mr-2 mb-2 group-hover:text-white group-hover:bg-gray-400 transition-all duration-200 ease-linear font-Outfit"
                              />
                              <Chip
                                :label="`${slotProps.data.totalPayment}.00`"
                                icon="pi pi-money-bill"
                                class="mr-2 mb-2 group-hover:text-white group-hover:bg-gray-400 transition-all duration-200 ease-linear font-Outfit"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          class="p-button-rounded bg-purple-500 self-center"
                          icon="pi
				    pi-search"
                          @click="
                            $router.push({
                              name: 'AplDetails',
                              params: { id: slotProps.data.apl_id },
                            })
                          "
                        />
                      </div>
                    </template>
                  </DataView>
                </div>
                <template #footer>
                  <div class="w-full">
                    <Button
                      @click="display = !display"
                      icon="pi pi-times"
                      label="Close"
                      class="p-button-rounded p-button-danger"
                    />
                  </div>
                </template>
              </Dialog>
            </template>
          </Card>
        </div>
      </div>
      <AdminDashComp :dailyUserApls="daily_user_applicants!" v-else />
      <div class="w-full h-[30px]"></div>
    </div>
  </div>
</template>
