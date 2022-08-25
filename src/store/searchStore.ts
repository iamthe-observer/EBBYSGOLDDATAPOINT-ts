import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSearchStore = defineStore('search', () => {
    const search = ref(
        useStorage('search', {
            recentSearch: [],
        })
    );

    const resetRecentSearch = () => {
        search.value.recentSearch = [];
    };

    const setRecentSearch = inp => {
        let isIn = search.value.recentSearch.find(x => x.apl_id == inp.apl_id);

        if (search.value.recentSearch.length > 4) {
            search.value.recentSearch.unshift(inp);
            search.value.recentSearch.splice(-1, 1);
        } else if (!isIn) {
            search.value.recentSearch.unshift(inp);
        }
    };

    return {
        resetRecentSearch,
        setRecentSearch,
        search,
    };
});