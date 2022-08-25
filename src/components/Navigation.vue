<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import 'animate.css';
import { storeToRefs } from 'pinia';
import { _Null } from '../types/types';
// import { useProfileStore } from '../store/profileStore';
// import { useDashStore } from '../store/dashboardStore';

// const { uploading } = storeToRefs(useProfileStore());
// const { role } = storeToRefs(useProfileStore());
interface Props {
  username: string;
  avatar_url: _Null<string>;
  isNotFound: boolean;
}
const props = defineProps<Props>();

const dashboard = ref<object | null>(null);
const contact = ref(null);
// const { version } = storeToRefs(useDashStore());

// const user_role = computed<string>(() => {
//   if (role.value === 'user') {
//     return `font-medium bg-[rgba(255,255,255,.3)] px-2 rounded-lg text-white animate__animated animate__fadeIn text-sm`;
//   } else {
//     return `font-medium bg-[rgba(255,255,255,.3)] px-2 rounded-lg text-white animate__animated relative animate__fadeIn text-sm after:content-['ADMIN'] after:absolute after:px-[0.5rem]  after:bg-red-600 after:outline after:outline-2 after:outline-white after:rounded-full after:text-center after:text-[.6rem] after:text-slate-50 after:font-extrabold after:content-['ADMIN'] after:shadow-xl after:left-1/2 after:translate-x-[-50%] after:bottom-[-120%]`;
//   }
// });

onMounted(() => {
  const navlinks: any = dashboard.value;
  navlinks.childNodes.forEach((link: any) => {
    link.addEventListener('click', () => {
      link.classList.remove('bg-indigo-900');
      link.classList.add('bg-indigo-900');
    });
  });
});
</script>

<template>
  <nav
    v-if="!isNotFound"
    class="flex flex-col w-13 min-h-fit items-center justify-between text-white transition-all ease-linear"
  >
    <div class="flex-col items-center flex max-w-full min-h-4/5 gap-1">
      <div
        class="flex flex-col gap-2 items-center cursor-pointer"
        @click="$router.push({ name: 'ProfilePage' })"
      >
        <section class="flex justify-center items-center">
          <img
            v-if="avatar_url"
            :src="
              avatar_url
                ? avatar_url
                : 'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg'
            "
            class="w-15 rounded-full aspect-square border-2 animate__animated animate__fadeIn"
          />
          <!-- <i
            v-else-if="uploading"
            class="pi pi-spin pi-spinner text-[2rem]"
          ></i> -->
          <img
            v-else
            src="../assets/images/avatar.svg"
            class="w-15 rounded-full aspect-square border-2 animate__animated animate__fadeIn"
          />
        </section>
        <!-- <span :class="user_role">{{ username }}</span> -->
      </div>
      <div
        ref="dashboard"
        class="flex flex-col w-full items-center justify-start gap-7 mt-7 min-h-4/6"
      >
        <router-link
          class="border-none rounded-xl px-6 py-2 transition-all w-full duration-200 cursor-pointer ease-linear hover:bg-indigo-800 tooltip"
          to="/dashboard"
          data-tip="Dashboard"
        >
          <img
            src="../assets/icons/dashboard.png"
            class="mx-auto w-11 aspect-square animate__animated animate__fadeInLeft invert"
          />
        </router-link>

        <router-link
          ref="database"
          class="border-none rounded-xl px-6 py-2 transition-all w-full duration-200 cursor-pointer ease-linear hover:bg-indigo-800 tooltip"
          to="/database"
          data-tip="Database"
        >
          <img
            src="../assets/icons/database.png"
            class="mx-auto w-11 aspect-square animate__animated animate__fadeInLeft invert"
          />
        </router-link>

        <router-link
          ref="contact"
          class="border-none rounded-xl px-6 py-2 transition-all w-full duration-200 cursor-pointer ease-linear hover:bg-indigo-800 tooltip"
          to="/contactUs"
          data-tip="Contact Us"
        >
          <img
            src="../assets/icons/contact.png"
            class="mx-auto w-11 aspect-square animate__animated animate__fadeInLeft invert"
          />
        </router-link>
      </div>
    </div>

    <div class="flex flex-col items-center gap-4">
      <div
        class="transition-all hover:bg-indigo-800 w-[90px] rounded-xl border-none justify-center duration-200 animate__animated animate__fadeIn"
        @click="() => $emit('logout', false)"
      >
        <img
          class="invert px-6 py-2 aspect-auto cursor-pointer ease-linear"
          src="../assets/icons/logout.png"
        />

        <!-- <img src="../assets/icons/world.png" class="company-logo iconpack" />
      <span>EBBYSGOLD</span> -->
      </div>
      <!-- <span class="text-[rgba(255,255,255,0.24)]">V.{{ version }}</span> -->
    </div>
  </nav>
</template>
