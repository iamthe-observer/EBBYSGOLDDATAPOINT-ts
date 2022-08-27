import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import * as interfaces from '../interfaces/interfaces';
import * as supaClient from '../composables/supaClient';
import { supabase } from '../supabase/supabase';
import { _Null } from '../types/types';

export const useAnnStore = defineStore('announcements', () => {
  const ann: Ref<interfaces.Announcement[] | null> = ref(
    useStorage('announcements', [])
  );
  const loading = ref<boolean>(false);
  const inputLoading = ref<boolean>(false);

  const resetAnn = (): void => {
    ann.value = [];
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

  const getAnn = async () => {
    loading.value = true;
    try {
      let { data, error } = await supabase.from('announcements').select('*');

      if (error) throw error;
      loading.value = false;
      ann.value = data!.reverse();
    } catch (error: any) {
      loading.value = false;
      console.log(error.message);
    }
  };

  const inputAnn = async (
    obj: {
      subject: string;
      body: string | number | string[] | undefined;
      urgency: string;
    }[]
  ) => {
    inputLoading.value = true;
    try {
      const { data, error } = await supabase.from('announcements').insert(obj);
      if (error) throw error;
      inputLoading.value = false;
      await getAnn();
      return data;
    } catch (error: any) {
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
