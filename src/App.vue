<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import Navigation from './components/Navigation.vue';
import Authenticate from './views/Authenticate.vue';
import { useSearchStore } from './store/SearchStore';
import { useDashStore } from './store/DashboardStore';
import { useProfileStore } from './store/ProfileStore';
import { useRouterStore } from './store/RouterStore';
import { useAnnStore } from './store/AnnStore';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { supabase } from './supabase/supabase';
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import { useRequestStore } from './store/RequestStore';
import useErrorHandle from './composables/useErrorHandle';
import { useApplicantStore } from './store/ApplicantStore';
import { useAppStore } from './store/Appstore';

const toast = useToast();
const ShowToast = (
  severity: string,
  summary: string,
  detail: string,
  life = 4000
) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: life,
  });
};

const app_loading = ref<boolean>(true);
const profileStore = useProfileStore();
const logged = ref<boolean>(false);
const { url } = storeToRefs(profileStore);
const { role } = storeToRefs(profileStore);
const { isNotFound } = storeToRefs(useRouterStore());
const router = useRouter();

async function handleLogIn() {
  const profile_first = await useProfileStore().getUserProfileByUserId(
    supabase.auth.user()?.id!
  );
  useProfileStore().setActiveProfile(profile_first?.data!);
  await loadAppData();
  logged.value = true;
}

async function handleLogout(ev: boolean) {
  try {
    let { error } = await supabase.auth.signOut();
    if (error) throw error;
    logged.value = ev;
    router.push({ name: 'Authenticate' });
  } catch (error: any) {
    ShowToast(
      'error',
      'There was a problem along the line...',
      `${error.message}`,
      6000
    );
  }
}

supabase.auth.onAuthStateChange((event: string) => {
  if (event === 'SIGNED_OUT') {
    logged.value = false;
    profileStore.reset();
    useSearchStore().resetRecentSearch();
    useDashStore().reset();
    useAnnStore().reset();
    useRequestStore().reset();
    router.push({ name: 'Authenticate' });
  }
});

// TODO use localStorage to cache vals

const loadAppData = async () => {
  app_loading.value = true;
  let currentSession = supabase.auth.session();

  if (currentSession) {
    let id = supabase.auth.user()?.id!;

    let active_profile = await useProfileStore().getUserProfileByUserId(id);
    useProfileStore().setActiveProfile(active_profile?.data!);

    let [user_profiles, ann, applicants] = await Promise.allSettled([
      useProfileStore().getUserProfiles(),
      useAnnStore().getAnnouncements(),
      !active_profile?.data![0].role
        ? useApplicantStore().getApplicants()
        : useApplicantStore().getApplicantsByUserId(id),
      active_profile?.data![0].role
        ? useRequestStore().getRequestsById(id)
        : useRequestStore().getAllRequests(),
      useDashStore().getSupervisorData(),
      useAppStore().getUserSignIns(),
    ]);
    // @ts-ignore
    useProfileStore().set_UserProfiles(user_profiles?.regualar_users!);
    // @ts-ignore
    useAnnStore().setAnnouncements(ann?.value!.data);
    // @ts-ignore
    useApplicantStore().setApplicants(applicants?.value!.data);
    logged.value = true;
    app_loading.value = false;
    await dailySignIn(role.value);
  } else {
    app_loading.value = false;
    logged.value = false;
    router.push({ name: 'Authenticate' });
  }
};

// TODO ADD SKELETON LOADER TO APL LIST
// TODO scale down everything...its too big

onBeforeMount(async () => {
  loadAppData();
});

// TODO move to appstore
const checkDailySignIn = async () => {
  try {
    const { data, error } = await supabase
      .from('user_sign_ins')
      .select('*')
      .eq('user_id', supabase.auth.user()!.id);

    if (error) throw error;

    const val = data.filter(
      y =>
        useDashStore().fd(new Date(y.created_at)) ===
        useDashStore().fd(new Date())
    );
    return val.length;
  } catch (error: any) {
    console.log(error.message);
  }
};

// TODO move to appstore
const dailySignIn = async (ROLE: boolean) => {
  const currentSession = supabase.auth.session();
  if (currentSession) {
    const ifSignIn = await checkDailySignIn();
    if (!ifSignIn) {
      if (ROLE) {
        try {
          const { data, error } = await supabase.from('user_sign_ins').insert({
            user_id: supabase.auth.user()!.id,
          });

          if (error) throw error;
          return { data, error };
        } catch (error: any) {
          let loading = false;
          console.log(error.message);
          return useErrorHandle(error, loading);
        }
      }
    }
  }
};
</script>

<template>
  <div
    v-if="app_loading"
    class="flex justify-center items-center w-full h-[100vh]"
  >
    <ProgressSpinner strokeWidth="4" animationDuration="1s" />
  </div>

  <div v-else>
    <div
      v-if="logged"
      class="font-Outfit font-[500] antialiased w-full bg-gradient-to-br from-indigo-500 to-purple-500 h-screen flex p-2"
    >
      <Toast />
      <Navigation
        @logout="handleLogout"
        :isNotFound="isNotFound"
        :avatar_url="url"
      />

      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>

    <div class="w-full antialiased h-screen" v-else>
      <router-view>
        <Authenticate @logIn="handleLogIn" />
      </router-view>
    </div>
  </div>
</template>
