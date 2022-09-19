<script setup lang="ts">
import { computed, onMounted } from 'vue';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import { useDashStore } from '../store/DashboardStore';
import { storeToRefs } from 'pinia';
import { Applicant, ProfileData } from '../interfaces/interfaces';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { useAppStore } from '../store/Appstore';
import { useProfileStore } from '../store/ProfileStore';
import { UserData } from '../interfaces/interfaces';

const router = useRouter();
const props = defineProps<{
  profile: ProfileData;
  apls: Applicant[];
}>();

// onMounted(() => {
//   console.log('profile', props.profile);
//   // console.log('user_apls', user_apls.value);
//   console.log('total', total_payment_user_apls.value);
// });

const user_apls = computed(() => {
  return props.apls.filter((apl: Applicant) => {
    return apl.user_id === props.profile.id;
  });
});

const total_payment_user_apls = computed(() => {
  let val = user_apls.value.map(apl => {
    return apl.totalPayment;
  });

  if (val.length == 0) {
    return 0;
  } else {
    return val.reduce((a, b) => {
      return a + b;
    });
  }
});

const total$apls = computed(() => {
  let merge = _.spread(_.partial(_.merge, {}));
  return merge(user_apls.value);
});

const { daily_user_signins } = storeToRefs(useAppStore());

const ifUserSignedIn = (user: ProfileData) => {
  return daily_user_signins.value.filter(
    x =>
      x.user_id === user.id &&
      useDashStore().fd(new Date(x.created_at)) == useDashStore().fd(new Date())
  )[0];
};

const lastSeenUser = (user: ProfileData) => {
  let val = ifUserSignedIn(user);
  let hh = new Date(val.created_at).getHours();
  let mm = new Date(val.created_at).getMinutes();

  return `Time of Login: ${hh}:${mm}`;
};

// onBeforeMount(async () => {
//   user.value = await useUserStore().get_dailyUserApls(
//     props.profile.data.id
//   );
// });

const ViewUserReport = (userData: UserData) => {
  useProfileStore().setUserData(userData);

  router.push({
    name: 'UserReport',
    params: {
      id: props.profile.id,
    },
  });
};
</script>

<template>
  <div class="flex gap-3">
    <img
      :src="
        profile.avatar_path
          ? `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/${profile.avatar_path}`
          : 'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg'
      "
      class="w-[100px] h-[100px] rounded-lg"
    />
    <div class="product-list-detail flex flex-col justify-between">
      <div class="product-name text-xl font-bold">
        {{ profile.full_name }}
      </div>
      <div class="product-description text-md font-semibold">
        {{ profile.username }}
      </div>
      <div class="flex gap-3 items-center">
        <Chip
          :label="`${total_payment_user_apls}.00`"
          :icon="
            total_payment_user_apls
              ? 'pi pi-money-bill text-green-500'
              : 'pi pi-money-bill'
          "
          class="group-hover:text-white group-hover:bg-gray-400 transition-all duration-200 ease-linear font-Outfit font-bold"
        />
        <Chip
          :label="`${user_apls.length} Applicants Done`"
          icon="pi pi-users"
          class="group-hover:text-white group-hover:bg-gray-400 transition-all duration-200 ease-linear font-Outfit font-bold"
        />

        <div
          :class="
            ifUserSignedIn(profile)
              ? 'badge badge-accent rounded-lg font-bold'
              : 'badge badge-warning rounded-lg font-bold'
          "
        >
          {{
            ifUserSignedIn(profile) ? 'Logged In Today' : 'Has Not Logged In'
          }}
        </div>
        <div
          v-if="ifUserSignedIn(profile)"
          class="badge badge-accent rounded-lg font-bold"
        >
          {{ lastSeenUser(profile) }}
        </div>
      </div>
    </div>
  </div>
  <Button
    class="p-button-rounded bg-purple-500 self-center"
    icon="pi
    pi-search"
    @click="ViewUserReport({ profile: profile, apls: user_apls })"
  />
</template>
