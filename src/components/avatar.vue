<script setup lang="ts">
// const props = defineProps(['url', 'editMode', 'uploading']);
const props = defineProps<{
  url: string|null;
  editMode: boolean;
  uploading: boolean;
}>();
const emit = defineEmits<{
  (e: 'edit', editMode: boolean): void;
}>();
// const emit = defineEmits(['edit']);
</script>

<template>
  <div>
    <div
      @click="emit('edit', !editMode)"
      class="w-[200px] min-h-[200px] aspect-square my-4 rounded-lg p-2 border-4 border-indigo-700 group mx-auto hover:bg-[rgba(0,0,0,0.22)] relative transition-all duration-500 ease-linear flex-col flex justify-center items-center"
    >
      <img
        src="../assets/icons/editing.png"
        class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-8 invisible group-hover:visible group-hover:invert"
      />
      <img
        v-if="url"
        class="group-hover:opacity-30 group-hover:scale-[95%] transition-all duration-500 rounded-lg object-fill"
        :src="url"
      />
      <i
        v-if="uploading"
        class="top-[45%] left-[45%] translate-x-[-50%] translate-y-[-50%] absolute pi pi-spin pi-spinner text-[2rem]"
      ></i>
      <img
        v-if="!url"
        class="group-hover:opacity-30 group-hover:scale-[95%] transition-all duration-500 rounded-lg object-fill"
        src="../assets/images/avatar.svg"
      />
    </div>
    <slot name="uploadFile" />
  </div>
</template>
