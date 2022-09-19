<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Card from './Card.vue';
import AvatarGroup from 'primevue/avatargroup';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DataView from 'primevue/dataview';
import { Applicant } from '../interfaces/interfaces';
import UserDailyReportCard from './userDailyReportCard.vue';
import AdminAnn from './AdminAnn.vue';
import { useProfileStore } from '../store/ProfileStore';
import { storeToRefs } from 'pinia';
import { useAppStore } from '../store/Appstore';
import { useApplicantStore } from '../store/ApplicantStore';
import { useRequestStore } from '../store/RequestStore';

type Props = {
  dailyUserApls: Applicant[];
};
const props = defineProps<Props>();
const dash_loading = ref(false);

const { content } = storeToRefs(useAppStore());
const { daily_user_signins } = storeToRefs(useAppStore());
const { user_profiles } = storeToRefs(useProfileStore());
const { daily_service_sales } = storeToRefs(useApplicantStore());
const { total_applicants_number } = storeToRefs(useApplicantStore());
const { requests } = storeToRefs(useRequestStore());
const viewDailyReport = ref(false);

// combination of Users and dailyApls
const daily_data = ref({
  apls: props.dailyUserApls,
});

// all regular users
onMounted(async () => {
  dash_loading.value = true;

  const data = await useProfileStore().getUserProfiles();
  useProfileStore().set_UserProfiles(data?.regular_users!);

  dash_loading.value = false;
});

const pending_requests = computed(() => {
  return requests.value!.filter(req => req.status === 'pending');
});

const total_numOf_users = computed(() => {
  if (!user_profiles.value) return 0;
  return user_profiles.value.length;
});

const userImage = (url: string) => {
  if (!url)
    return 'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg';
  return url;
};
</script>

<template>
  <div class="">
    <!-- head -->
    <div class="flex gap-5">
      <h3 class="font-extrabold text-2xl">Dashboard</h3>

      <div
        @click="
          () => {
            useAppStore().setContent('search');
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

    <div class="grid grid-cols-3 w-full gap-3 mt-5">
      <!-- cards -->
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
        class="mb-3 bg-gradient-to-bl from-red-100 to-red-300"
        :header="'Daily User Sign-Ins'"
      >
        <template #icon>
          <img src="../assets/icons/user-svgrepo-com.svg" class="w-[40px]" />
        </template>
        <template #body>
          <div class="flex flex-col w-full">
            <span class="text-xs">Reviews And Requests</span>
            <span class="text-2xl">{{ pending_requests.length }} pending!</span>
          </div>
        </template>
        <template #openModalIcon>
          <i
            class="pi pi-arrow-up-left text-{1.5em} cursor-pointer self-end hover:translate-y-[-5px] transition-all duration-200 ease-linear"
            @click="$router.push({ name: 'AdminRequests' })"
          ></i>
        </template>
      </Card>

      <Card
        class="mb-3 bg-gradient-to-bl from-purple-100 to-purple-300"
        :header="'Daily User Report'"
      >
        <template #icon>
          <img
            src="../assets/icons/report-svgrepo-com.svg"
            class="w-[40px] font-bold"
          />
        </template>
        <template #body>
          <div class="flex flex-col w-full">
            <span class="text-xs">Daily User Report</span>
            <div class="text-2xl flex justify-between">
              <AvatarGroup>
                <Avatar
                  v-for="(user, i) in user_profiles?.slice(0, 4)"
                  :key="i"
                  shape="circle"
                  :image="userImage(user.avatar_url!)"
                />
                <Avatar
                  v-if="user_profiles?.length! > 4"
                  shape="circle"
                  style="background-color: #9c27b0; color: #ffffff"
                  :label="`+${user_profiles?.length! - 4}`"
                />
              </AvatarGroup>
              <span class="text-2xl"
                >{{ daily_user_signins.length || 0 }}/{{
                  total_numOf_users
                }}
                logins</span
              >
            </div>
          </div>
        </template>
        <template #openModalIcon>
          <i
            class="pi pi-arrow-up-left text-{1.5em} cursor-pointer self-end hover:translate-y-[-5px] transition-all duration-200 ease-linear"
            @click="viewDailyReport = true"
          ></i>
        </template>
      </Card>
    </div>

    <div class="flex flex-col w-full gap-3 mt-8">
      <AdminAnn />
    </div>

    <teleport to="body">
      <Dialog
        :modal="true"
        :visible="viewDailyReport"
        class="font-Outfit"
        :closable="false"
        :draggable="false"
        :style="{ width: '80%' }"
        :maximizable="true"
      >
        <template #header>
          <div class="flex gap-2 relative">
            <span
              class="relative font-bold text-3xl bg-purple-500 px-4 py-2 rounded-full text-white"
            >
              Daily User Report
            </span>
            <span
              class="font-bold absolute text-sm text-center bg-red-500 px-2 py-1 rounded-full text-white flex items-center right-[-45px] top-[-15px] shadow-xl"
              ><i class="pi pi-money-bill mr-1"></i>
              {{ daily_service_sales || 0 }}.00</span
            >
          </div>
        </template>

        <DataView
          v-if="user_profiles?.length! > 0"
          :value="user_profiles || []"
          layout="list"
          class="w-full overflow-hidden"
          :dataKey="'bean'"
        >
          <template #list="slotProps">
            <div
              class="product-list-item min-h-[100px] flex w-full font-Outfit justify-between mb-3 mx-auto group hover:bg-gray-200 rounded-lg p-3 transition-all duration-200 ease-linear bg-gray-100"
            >
              <UserDailyReportCard
                :profile="slotProps.data"
                :apls="props.dailyUserApls!"
              />
            </div>
          </template>
        </DataView>

        <template #footer>
          <div class="w-full">
            <Button
              @click="viewDailyReport = !viewDailyReport"
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
