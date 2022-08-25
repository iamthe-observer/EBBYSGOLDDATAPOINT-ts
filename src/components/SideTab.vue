<template>
  <div
    class="flex flex-col min-w-[30px] self-center border-none h-min rounded-full bg-gradient-to-b from-indigo-400 to-indigo-700 p-1 relative transition-all duration-200 font-Outfit"
  >
    <div class="min-h-full text-center w-full px-auto text-white rounded-full">
      <div
        ref="sL"
        class="flex flex-col text-[1.3em] min-h-full gap-[20px] items-center"
      >
        <div
          @click="e => selectTab(e, 'APPLY')"
          class="w-full rounded-full border-none flex-grow-0 py-4 writing-mode orientation-upright flex items-center justify-center cursor-pointer relative hover:text-purple-500 hover:bg-white first:after:content-[''] first:after:absolute first:after:w-3/5 first:after:h-[2px] first:after:bg-white first:after:bottom-[-11.5px] first:after:rounded-full font-semibold"
        >
          APPLY
        </div>
        <div
          @click="e => selectTab(e, 'SEARCH')"
          class="w-full rounded-full border-none flex-grow-0 py-4 writing-mode orientation-upright flex items-center justify-center cursor-pointer relative hover:text-purple-500 hover:bg-white first:after:content-[''] first:after:absolute first:after:w-3/5 first:after:h-[2px] first:after:bg-white first:after:bottom-[-11.5px] first:after:rounded-full font-semibold"
        >
          SEARCH
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from '@vue/runtime-core';

const emit = defineEmits({
  contentChange(link) {
    if (link) {
      return true;
    }
  },
});

const selectTab = (e, link) => {
  let sidelinks = e.target.parentNode.children;

  for (let i = 0; i < sidelinks.length; i++) {
    const link = sidelinks[i];
    link.classList.value = `w-full rounded-full border-none flex-grow-0 py-4 writing-mode orientation-upright flex items-center justify-center cursor-pointer relative hover:text-purple-500 hover:bg-white first:after:content-[''] first:after:absolute first:after:w-3/5 first:after:h-[2px] first:after:bg-white first:after:bottom-[-11.5px] first:after:rounded-full font-semibold`;
  }

  e.target.classList.add('sideselected');

  emit('contentChange', link);
};

const sL = ref(null);

const mount = onMounted(() => {
  sL.value.children[0].classList.add('selected');
});
</script>
