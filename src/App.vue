<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import { supabase } from './supabase/supabase';
import Navigation from './components/Navigation.vue';
// import Authenticate from './views/Authenticate.vue';
// import { useSearchStore } from './store/searchStore';
// import { useDashStore } from './store/dashboardStore';
// import { useProfileStore } from './store/profileStore';
// import { useAnnStore } from './store/annStore';
// import { useRouteStore } from './store/routerStore';\
import { useAuthStore } from './store/AuthStore';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { supabase } from './supabase/supabase';

type emitLogin = {
  val: boolean;
  adminLoggedIn: string;
};

// const profileStore = useProfileStore();
// const { currRoute } = storeToRefs(useRouteStore());
const logged = ref<boolean>(false);
// const { url } = storeToRefs(profileStore);
// const { role } = storeToRefs(profileStore);
// const { username } = storeToRefs(profileStore);
// const { isNotFound } = storeToRefs(profileStore);
const router = useRouter();
// const pause = milli => new Promise(resolve => setTimeout(resolve, milli));

// async function logIn(ev) {
// logged.value = ev.val;
// profileStore.setRole(ev.adminLoggedIn);
// profileStore.getProfile();
// useDashStore().getContactInfo();
// useAnnStore().getAnn();
//   dailySignIn();
// }

function handleLogIn(ev: emitLogin) {
  // profileStore.setRole(ev.adminLoggedIn);
  // profileStore.getProfile();
  // useDashStore().getContactInfo();
  // useAnnStore().getAnn();
  // dailySignIn();
  logged.value = ev.val;
}
function handleLogout(ev: boolean) {
  useAuthStore().logout();
  logged.value = ev;
}

// async function logout(ev) {
//   try {
//     let { error } = await supabase.auth.signOut();
//     if (error) throw error;
//     logged.value = ev;
//     router.push({ name: 'Authenticate' });
//   } catch (err) {
//     console.log(err.message);
//   }
// }

// supabase.auth.onAuthStateChange(event => {
//   if (event === 'SIGNED_OUT') {
//     logged.value = false;
//     profileStore.reset();
//     useSearchStore().resetRecentSearch();
//     useDashStore().resetApls();
//   }
// });

// onMounted(() => {
//   const currentSession = supabase.auth.session();
//   const currentProfile = JSON.parse(localStorage.getItem('profile'));

//   if (currentSession && currentProfile) {
//     logged.value = true;
//     profileStore.getProfile();
//     router.push({ name: currRoute.value.route });
//   } else {
//     logged.value = false;
//     router.push({ name: 'Authenticate' });
//   }

//   dailySignIn();
// });

// const checkDailySignIn = async () => {
//   try {
//     const { data, error } = await supabase
//       .from('user_sign_ins')
//       .select('*')
//       .eq('user_id', supabase.auth.user().id);

//     if (error) throw error;

//     const val = data.filter(
//       y =>
//         useDashStore().fd(new Date(y.created_at)) ===
//         useDashStore().fd(new Date())
//     );
//     return val.length;
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const dailySignIn = async () => {
//   const currentSession = supabase.auth.session();
//   if (currentSession) {
//     const ifSignIn = await checkDailySignIn();
//     if (!ifSignIn) {
//       if (role.value === 'user') {
//         try {
//           const { data, error } = await supabase.from('user_sign_ins').insert({
//             user_id: supabase.auth.user().id,
//           });

//           if (error) throw error;
//         } catch (error) {
//           console.log(error.message);
//         }
//       }
//     }
//   }
// };
</script>

<template>
  <div
    v-if="logged"
    class="font-Outfit font-[500] antialiased w-full bg-gradient-to-br from-indigo-500 to-purple-500 h-screen flex p-2"
  >
    <!-- <Navigation
      @logout="logout"
      :username="username"
      :isNotFound="isNotFound"
      :avatar_url="url"
    /> -->
    <!-- <router-view v-slot="{ Component }"> -->
    <!-- <component :is="Component" /> -->
    <!-- <router-view /> -->
    <!-- </div> -->

    <!-- <div class="w-full antialiased h-screen" v-else> -->
    <!-- <router-view> -->
    <!-- <Authenticate @logIn="logIn" /> -->
    <!-- </router-view> -->
  </div>
</template>
