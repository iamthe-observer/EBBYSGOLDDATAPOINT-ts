<script setup lang="ts">
// const props = defineProps<{ url: string | undefined }>();
const { url } = defineProps<{ url: string }>();
</script>

<template>
  <div
    class="w-[200px] min-h-[200px] aspect-square my-4 rounded-xl p-2 border-4 border-indigo-700 mx-auto flex-col flex justify-center items-center"
  >
    <img class="rounded-lg object-fill aspect-square" :src="url" />
  </div>
</template>
