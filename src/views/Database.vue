<script setup lang="ts">
import SideTab from '../components/SideTab.vue';
import { ref, markRaw } from 'vue';
import Apply from '../components/Apply.vue';
import Search from '../components/Search.vue';
import { useStorage } from '@vueuse/core';
import { computed } from '@vue/reactivity';
import { storeToRefs } from 'pinia';
import { useAppStore } from '../store/Appstore';

let { content } = storeToRefs(useAppStore());

let current_content = computed(() => {
  if (content.value == 'apply') {
    return markRaw(Apply);
  } else {
    return markRaw(Search);
  }
});

function changeContent(event: string) {
  if (event == 'SEARCH') {
    content.value = event.toLowerCase();
  } else {
    content.value = event.toLowerCase();
  }
}
</script>

<template>
  <div
    class="flex-1 p-3 bg-indigo-100 border-none rounded-3xl [max-height:100%] flex gap-3"
  >
    <SideTab :init_content="content!" @contentChange="changeContent" />
    <transition name="fade" mode="out-in">
      <keep-alive>
        <component :is="current_content" />
      </keep-alive>
    </transition>
  </div>
</template>
