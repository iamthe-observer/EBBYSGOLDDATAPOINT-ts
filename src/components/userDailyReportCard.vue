<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import { useUserStore } from '../store/userStore';
import { useDashStore } from '../store/dashboardStore';
import { storeToRefs } from 'pinia';

const props = defineProps(['slotProps']);
const userApls = ref([]);
const { dailyUserSignIns } = storeToRefs(useDashStore());

const totalUserDailyApls = computed(() => {
  return userApls.value.length;
});

const ifUserSignedIn = user => {
  return dailyUserSignIns.value.filter(
    x =>
      x.user_id === user.id &&
      useDashStore().fd(new Date(x.created_at)) == useDashStore().fd(new Date())
  )[0];
};

const lastSeenUser = user => {
  let val = ifUserSignedIn(user);
  let hh = new Date(val.created_at).getHours();
  let mm = new Date(val.created_at).getMinutes();

  return `Time of Login: ${hh}:${mm}`;
};

const totalUserDailyAplsAmount = computed(() => {
  if (userApls.value.length) {
    let val = []
      .concat(...userApls.value)
      .map(apl => apl.totalPayment)
      .reduce((a, b) => a + b);

    return val;
  }
});

const refresh = async () => {
  userApls.value = await useUserStore().getUserApls(props.slotProps.data.id);
};

onBeforeMount(async () => {
  userApls.value = await useUserStore().getUserApls(props.slotProps.data.id);
});
</script>

<template>
  <div class="flex gap-3">
    <img
      :src="
        slotProps.data.avatar_path
          ? `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/${slotProps.data.avatar_path}`
          : 'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg'
      "
      class="w-[100px] h-[100px] rounded-lg"
    />
    <div class="product-list-detail flex flex-col justify-between">
      <div class="product-name text-xl font-bold">
        {{ slotProps.data.full_name }}
      </div>
      <div class="product-description text-md font-semibold">
        {{ slotProps.data.username }}
      </div>
      <div class="flex gap-3 items-center">
        <Chip
          :label="`${
            totalUserDailyAplsAmount ? totalUserDailyAplsAmount : 0
          }.00`"
          icon="pi pi-money-bill"
          class="group-hover:text-white group-hover:bg-gray-400 transition-all duration-200 ease-linear font-Outfit font-bold"
        />
        <Chip
          :label="`${totalUserDailyApls} Applicants Done`"
          icon="pi pi-users"
          class="group-hover:text-white group-hover:bg-gray-400 transition-all duration-200 ease-linear font-Outfit font-bold"
        />

        <div
          :class="
            ifUserSignedIn(slotProps.data)
              ? 'badge badge-accent rounded-lg font-bold'
              : 'badge badge-warning rounded-lg font-bold'
          "
        >
          {{
            ifUserSignedIn(slotProps.data)
              ? 'Logged In Today'
              : 'Has Not Logged In'
          }}
        </div>
        <div
          v-if="ifUserSignedIn(slotProps.data)"
          class="badge badge-accent rounded-lg font-bold"
        >
          {{ lastSeenUser(slotProps.data) }}
        </div>
      </div>
    </div>
  </div>
  <Button
    class="p-button-rounded bg-purple-500 self-center"
    icon="pi
    pi-search"
    @click="
      $router.push({
        name: 'UserReport',
        params: { id: slotProps.data.id, data: JSON.stringify(slotProps.data) },
      })
    "
  />
</template>
