import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../supabase/supabase';

export const useAnnStore = defineStore('announcements', () => {
  const ann = ref(
    useStorage('announcements', {
      all: [],
      today: [],
    })
  );
  const loading = ref<boolean>(false);
  const inputLoading = ref<boolean>(false);

  const resetAnn = (): void => {
    ann.value.all = [];
    ann.value.today = [];
  };

  const changeDate = (date: Date): string => {
    const day = new Date(date).toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return day;
  };

  const getAnn = async (from:string,select:string) => {
    loading.value = true;
    try {
      let { data, error } = await supabase.from('announcements').select('*');

      if (error) throw error;
      loading.value = false;

      ann.value.all = data.reverse();
      ann.value.today = data.reverse().filter(ann => {
        if (changeDate(ann.created_at) == changeDate(new Date())) {
          return ann;
        }
      });
    } catch (error) {
      loading.value = false;
      console.log(error.message);
    }
  };

  const inputAnn = async obj => {
    inputLoading.value = true;
    try {
      const { data, error } = await supabase.from('announcements').insert(obj);
      if (error) throw error;
      inputLoading.value = false;
      getAnn();
      return data;
    } catch (error) {
      console.log(error.message);
      inputLoading.value = false;
    }
  };

  return {
    ann,
    getAnn,
    loading,
    inputLoading,
    changeDate,
    resetAnn,
    inputAnn,
  };
});
