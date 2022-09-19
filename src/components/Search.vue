<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';
import aplcard from './aplcard.vue';
import { supabase } from '../supabase/supabase';
import { useSearchStore } from '../store/SearchStore';
import { storeToRefs } from 'pinia';
import Chip from 'primevue/chip';
import Calendar from 'primevue/calendar';
import InputSwitch from 'primevue/inputswitch';
import gradientButton from '../components/gradientButton.vue';
import { _Null } from '../types/types';
import { Applicant } from '../interfaces/interfaces';

const loading = ref(false);
const isAplList = ref(false);
const toSearch = ref('');
const dateSearch = ref<Date | undefined>(undefined);
const searchform = ref<HTMLFormElement | null>(null);
const searchResults = ref<Applicant[] | never[]>([]);
const searchMessage = ref<_Null<string>>(null);
const searchStore = useSearchStore();
const searchInput = ref<HTMLInputElement | null>(null);
const searchType = ref(false);
const { recent_search } = storeToRefs(useSearchStore());

const hasSearchResults = computed(() => {
  if (searchResults.value.length > 0) return true;
  return false;
});

const ifSearch = computed(() => {
  if (toSearch.value.length > 2) {
    return true;
  } else {
    return false;
  }
});

watchEffect(() => {
  if (searchType.value == false) {
    dateSearch.value = undefined;
  }
});

// function debounce(cb: Function, delay = 1000) {
//   let timeout: number | undefined;
//   return (...args: any[]) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       cb(...args);
//     }, delay);
//   };
// }

const getSearch = async () => {
  searchMessage.value = null;
  if (ifSearch.value) {
    loading.value = true;
    try {
      const { data: searches, error } = await supabase
        .from('applicants')
        .select('*')
        .ilike('fullName', `%${toSearch.value}%`);

      if (!searches) throw error;

      if (searches.length > 0) {
        isAplList.value = true;
        searchResults.value = searches;
        searchMessage.value = '';
        searchInput.value!.value = '';
      } else {
        isAplList.value = false;
        searchResults!.value = [];
        searchMessage.value = 'No Applicants found';
        setTimeout(() => {
          searchMessage.value = '';
        }, 4000);
      }

      if (isAplList.value) {
        const searchbox = document.querySelector('.search') as HTMLDivElement;
        searchbox.classList.remove('centered');
        searchform.value!.classList.remove('search-field');
        searchform.value!.classList.add('search-flow');
      }
      loading.value = false;
      return searches;
    } catch (error: any) {
      loading.value = false;
      searchMessage.value = error.message;
      setTimeout(() => {
        searchMessage.value = '';
      }, 4000);
      searchResults.value = [];
    }
  } else {
    searchMessage.value = 'Enter longer name...';
    setTimeout(() => {
      searchMessage.value = '';
    }, 4000);
  }
};
const getSearchwDate = async () => {
  loading.value = true;
  searchMessage.value = null;
  if (ifSearch.value) {
    try {
      const { data: searches, error } = await supabase
        .from('applicants')
        .select('*')
        .ilike('fullName', `%${toSearch.value}%`)
        .eq(
          'created_at_date',
          new Date(dateSearch.value!).toLocaleString().split(',')[0]
        );

      if (!searches) throw error;

      if (searches.length > 0) {
        isAplList.value = true;
        searchResults.value = searches;
        searchMessage.value = '';
        searchInput.value!.value! = '';
      } else {
        isAplList.value = false;
        searchResults.value = [];
        searchMessage.value = 'No Applicants found';
        setTimeout(() => {
          searchMessage.value = '';
        }, 4000);
      }

      if (isAplList.value) {
        const searchbox = document.querySelector('.search') as HTMLDivElement;
        searchbox.classList.remove('centered');
        searchform.value!.classList.remove('search-field');
        searchform.value!.classList.add('search-flow');
      }
      loading.value = false;
    } catch (error: any) {
      loading.value = false;
      searchMessage.value = error.message;
      setTimeout(() => {
        searchMessage.value = '';
      }, 4000);
      searchResults.value = [];
    }
  } else {
    searchMessage.value = 'Enter longer name...';
    setTimeout(() => {
      searchMessage.value = '';
    }, 4000);
  }
};

const searchWay = () => {
  if (!searchType.value) return getSearch();
  return getSearchwDate();
};

const addRecentSearch = (evt: any) => {
  searchStore.setRecentSearch(evt);
};

watchEffect(() => {
  if (toSearch.value === '') {
    searchResults.value = [];
    isAplList.value = false;
  }
});

onMounted(() => {
  searchInput.value!.focus();
  const searchbox = document.querySelector('.search');
  searchbox!.classList.add('centered');

  watchEffect(() => {
    if (searchResults.value.length == 0 && toSearch.value == '') {
      searchbox!.classList.add('centered');
      searchform.value!.classList.add('search-field');
      searchform.value!.classList.remove('search-flow');
    }
  });
  watchEffect(() => {
    if (!isAplList.value) {
      searchbox!.classList.add('centered');
      searchform.value!.classList.add('search-field');
      searchform.value!.classList.remove('search-flow');
    }
  });
});
</script>

<template>
  <keep-alive>
    <div
      class="search chamber flex-1 rounded-3xl p-5 shadow-2xl bg-gray-50 overflow-y-scroll"
    >
      <form
        ref="searchform"
        class="flex items-center gap-[10px] mx-auto w-[60%] flex-col"
      >
        <input
          required
          ref="searchInput"
          class="shadow-xl text-lg text-black font-Outfit h-[50px] min-w-full rounded-full p-5 text-center bg-indigo-200 placeholder:text-white hover:placeholder:text-indigo-300 focus:border-2 focus:border-indigo-500 focus:placeholder:text-indigo-300 focus:outline-indigo-500 hover:border-2 hover:border-indigo-400"
          placeholder="search applicant"
          v-model="toSearch"
          type="text"
        />
        <Calendar
          inputClass="rounded-full font-Outfit shadow-xl text-lg text-black h-[50px] min-w-full p-5 text-center bg-indigo-200 placeholder:text-white hover:placeholder:text-indigo-300 focus:border-2 focus:border-indigo-500 focus:placeholder:text-indigo-300 hover:border-2 hover:border-indigo-400"
          v-if="searchType && !hasSearchResults"
          class="rounded-full"
          v-model="dateSearch"
          :touchUI="true"
          panelClass="rounded-full"
          dateFormat="dd | mm | yy"
        />

        <p class="text-center pt-[20px] font-normal">{{ searchMessage }}</p>
        <div
          class="justify-self-end w-[90px] aspect-square flex flex-col items-center"
        >
          <span
            v-if="!hasSearchResults"
            class="flex items-center font-Outfit gap-3 text-center rounded-full pl-3 bg-indigo-300 text-white p-2 min-w-max mb-3"
            >Search with Date <InputSwitch v-model="searchType"
          /></span>

          <gradient-button
            class="w-[100%] self-center my-auto"
            @click.prevent="searchWay"
          >
            <template #default v-if="!loading">Search</template>
            <template #loading v-if="loading"
              ><i class="pi pi-spin pi-spinner text-[1rem]"></i
            ></template>
          </gradient-button>
        </div>
        <section class="flex flex-col gap-2 w-full mt-6" v-if="!isAplList">
          <h3
            v-if="recent_search!.length > 0"
            class="w-fit mx-auto text-indigo-400 mb-1 bg-indigo-200 rounded-full py-1 px-4 font-Outfit"
          >
            Recent Searches
          </h3>
          <div class="flex items-center justify-center gap-3">
            <Chip
              v-for="(recent, i) in recent_search"
              :label="recent!.fullName"
              class="cursor-pointer w-fit"
              :key="i"
              @click="
                $router.push({
                  name: 'AplDetails',
                  params: { id: recent.apl_id },
                })
              "
            />
          </div>
        </section>
      </form>

      <hr
        v-if="isAplList"
        class="w-3/5 h-1 rounded-full mx-auto my-3 bg-gray-100"
      />

      <div v-if="isAplList" class="flex flex-col items-center">
        <aplcard
          v-for="(apl, i) of searchResults"
          :key="i"
          :apl="apl"
          :index="i"
          @recentSearch="addRecentSearch"
        />
      </div>
    </div>
  </keep-alive>
</template>
