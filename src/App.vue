<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import Navigation from './components/Navigation.vue';
import Authenticate from './views/Authenticate.vue';
import { useSearchStore } from './store/searchStore';
import { useDashStore } from './store/dashboardStore';
import { useProfileStore } from './store/profileStore';
import { useAnnStore } from './store/annStore';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { supabase } from './supabase/supabase';
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';

const appLoading = ref<boolean>(true);

type emitLogin = {
  val: boolean;
  adminLoggedIn: string;
};

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

const profileStore = useProfileStore();
// const { currRoute } = storeToRefs(useRouteStore());
const logged = ref<boolean>(false);
const { url } = storeToRefs(profileStore);
const { role } = storeToRefs(profileStore);
const { username } = storeToRefs(profileStore);
const { isNotFound } = storeToRefs(profileStore);
const router = useRouter();

async function handleLogIn(ev: emitLogin) {
  await profileStore.getProfile();
  profileStore.setRole(ev.adminLoggedIn);
  await useDashStore().getContactInfo();
  await useAnnStore().getAnn();
  await dailySignIn();
  logged.value = ev.val;
}

async function logout() {
  let { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { error };
}

async function handleLogout(ev: boolean) {
  try {
    const { error } = await logout();
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

supabase.auth.onAuthStateChange(event => {
  if (event === 'SIGNED_OUT') {
    logged.value = false;
    profileStore.reset();
    useSearchStore().resetRecentSearch();
    useDashStore().resetApls();
    router.push({ name: 'Authenticate' });
  }
});

async function checkForAdmin() {
  appLoading.value = true;
  try {
    let { data, error } = await supabase.from('admin_emails').select('*');
    if (error) throw error;

    const user_email = supabase.auth.user()!.email!;
    const adminLoggedIn = data!.filter(user => user_email == user.email);

    profileStore.setRole(adminLoggedIn[0] ? 'admin' : 'user');
    appLoading.value = false;
  } catch (err: any) {
    console.log(err.message);
    appLoading.value = false;
  }
}

onBeforeMount(async () => {
  const currentSession = supabase.auth.session();

  if (currentSession) {
    logged.value = true;
    const profile = await profileStore.getProfile();
    router.push({ name: 'Dashboard' });
  } else {
    logged.value = false;
    router.push({ name: 'Authenticate' });
  }

  await checkForAdmin();
  dailySignIn();
});

// TODO admin dash appears before user dash
// TODO requests still load everything

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

const dailySignIn = async () => {
  const currentSession = supabase.auth.session();
  if (currentSession) {
    const ifSignIn = await checkDailySignIn();
    if (!ifSignIn) {
      if (role.value) {
        try {
          const { data, error } = await supabase.from('user_sign_ins').insert({
            user_id: supabase.auth.user()!.id,
          });

          if (error) throw error;
        } catch (error: any) {
          console.log(error.message);
        }
      }
    }
  }
};
</script>

<template>
  <div
    v-if="appLoading"
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
        :username="username"
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
