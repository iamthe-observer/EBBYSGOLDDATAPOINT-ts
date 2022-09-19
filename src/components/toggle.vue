<template>
  <ToggleButton
    v-model="toggle"
    onLabel="All"
    offLabel="Today"
    onIcon="pi pi-comments"
    offIcon="pi pi-comment"
    class="rounded-full h-5 w-fit"
    @click="$emit('update', toggle)"
  ></ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from 'primevue/togglebutton';
import { ref } from 'vue';
const toggle = ref<boolean>(false);
const emit = defineEmits<{
  (e: 'update', toggle: boolean): void;
}>();
</script>

<style scoped>
.p-togglebutton {
  border-radius: 50px;
}
</style>
