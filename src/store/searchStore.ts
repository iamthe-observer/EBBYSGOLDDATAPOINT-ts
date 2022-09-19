import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SearchParams } from '../interfaces/interfaces';

export const useSearchStore = defineStore('search', () => {
  const recent_search = ref(useStorage<SearchParams[] | null>('search', []));

  const resetRecentSearch = () => {
    recent_search.value = [];
  };

  const setRecentSearch = (inp: SearchParams) => {
    let isIn = recent_search.value?.find(x => x.apl_id == inp.apl_id);

    if (recent_search.value!.length > 4) {
      recent_search.value?.unshift(inp);
      recent_search.value?.splice(-1, 1);
    } else if (!isIn) {
      recent_search.value?.unshift(inp);
    }
  };

  return {
    recent_search,
    resetRecentSearch,
    setRecentSearch,
  };
});
