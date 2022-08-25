<script setup lang="ts">
import SideTab from '../components/SideTab.vue';
import { shallowRef } from 'vue';
import Apply from '../components/Apply.vue';
import Search from '../components/Search.vue';

const currContent = shallowRef(Apply);

function changeContent(event: string) {
  if (event == 'SEARCH') {
    currContent.value = Search;
  } else {
    currContent.value = Apply;
  }
}
</script>

<template>
  <div
    class="flex-1 p-3 bg-indigo-100 border-none rounded-3xl [max-height:100%] flex gap-3"
  >
    <SideTab @contentChange="changeContent" />
    <transition name="fade" mode="out-in">
      <keep-alive>
        <component :is="currContent" />
      </keep-alive>
    </transition>
  </div>
</template>
