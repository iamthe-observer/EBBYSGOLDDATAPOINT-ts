<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps(['apl']);
const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const placeholderImg = ref(`../assets/images/avatar.svg`);
const aplImg = computed(() => {
  return props.apl.aplImg_path.primePath
    ? `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${props.apl.aplImg_path.primePath[0]}`
    : `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg`;
});

const rSearchParams = reactive({
  fullName: props.apl.fullName,
  apl_id: props.apl.apl_id,
});

// TODO LEARN GRID: RECENT SEARCHES

const changeDate = date => {
  const day = new Date(date).toLocaleDateString('en-us', options);

  return day;
};
</script>

<template>
  <router-link
    :to="{ name: 'AplDetails', params: { id: apl.apl_id } }"
    class="no-underline w-full mb-5"
    @click="$emit('recentSearch', rSearchParams)"
  >
    <div
      class="flex gap-5 w-4/6 mx-auto text-black p-5 bg-indigo-200 items-center h-36 border-none rounded-2xl drop-shadow-lg last:border-none relative hover:bg-indigo-300 transition-all duration-100 group ease-linear"
    >
      <img
        alt="apl-image"
        class="rounded-lg aspect-square w-[100px] bg-cover group-hover:outline-4 group-hover:outline-white outline outline-0 outline-white transition-all duration-100 ease-linear"
        :src="apl.aplImg_path ? aplImg : placeholderImg"
      />
      <div class="flex flex-col w-full">
        <p class="text-[1.5em]">{{ apl.fullName }}</p>
        <p
          class="text-[1em] tooltip tooltip-right w-fit"
          data-tip="confirmation code"
        >
          {{ apl.pconf_code ? apl.pconf_code : 'No Confirmation Code Yet' }}
        </p>
        <p
          class="text-[1em] tooltip tooltip-right w-fit"
          data-tip="passport number"
        >
          {{
            apl.ppassport_number
              ? apl.ppassport_number
              : 'Passport Number not Available'
          }}
        </p>
        <p
          class="text-[1em] font-semibold tooltip tooltip-right w-fit"
          data-tip="contact"
        >
          {{ apl.pcontact ? apl.pcontact : 'Phone Number not Available' }}
        </p>
      </div>
      <div
        class="absolute text-xs bottom-0 right-0 mx-2 my-2 p-1 rounded-md bg-white bg-opacity-50"
      >
        {{ apl.created_at ? changeDate(apl.created_at) : '' }}
      </div>
    </div>
  </router-link>
</template>
