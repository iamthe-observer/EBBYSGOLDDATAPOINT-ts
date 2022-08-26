<template>
  <div class="flex w-full h-full bg-indigo-100 shadow-inner rounded-full">
    <div
      @click="toggleState"
      class="rounded-full animate__animated animate__fadeIn cursor-pointer toggleSelected w-full m-1 text-center"
    >
      Today
    </div>
    <div
      @click="toggleState"
      class="rounded-full animate__animated animate__fadeIn cursor-pointer w-full m-1 text-center"
    >
      All
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { watch, watchEffect } from 'vue';
import { useToggleState } from '../composables/useToggleState';
const toggle = useToggleState();
// const emit = defineEmits(['toggleVal']);
const emit = defineEmits<{
  (e: 'update', toggle: boolean): void;
}>();

// watchEffect(() => {
//   if (!toggle.state) {
//     emit('update:toggleState', toggle.state);
//   }
// });
const toggleState = (x: any) => {
  const children = x.target.parentNode.children;
  for (const child of children) {
    child.classList.remove('toggleSelected');
  }
  x.target.classList.add('toggleSelected');
  // emit('update:toggleVal', x.target.innerText);
  toggle.toggleState();
  console.log(toggle.state.value);

  emit('update', toggle.state.value);
};
</script>
