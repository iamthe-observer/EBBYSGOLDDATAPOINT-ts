<template>
  <form @submit.prevent="applyApl" class="apply-form">
    <slot />
  </form>
</template>

<script setup>
import { ref } from 'vue';

const isRender = ref(false);
</script>
