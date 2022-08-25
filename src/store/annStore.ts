import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import * as interfaces from '../interfaces/interfaces';
import * as supaClient from '../composables/supaClient';

export const useAnnStore = defineStore('announcements', () => {
  const ann: Ref<{
    all: interfaces.Announcement[] | null;
    today: interfaces.Announcement[] | null;
  }> = ref(
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

  const getAnn = async () => {
    loading.value = true;

    const data = await supaClient.getData('announcements', '*');
    if (!data) return (loading.value = false);
    ann.value.all = data!.reverse();
    ann.value.today = data!.reverse().filter(ann => {
      if (changeDate(ann.created_at) == changeDate(new Date())) {
        return ann;
      }
    });
    loading.value = false;

    // try {
    //   let { data, error } = await supabase.from('announcements').select('*');

    //   if (error) throw error;
    //   loading.value = false;

    //   ann.value.all = data!.reverse();
    //   ann.value.today = data!.reverse().filter(ann => {
    //     if (changeDate(ann.created_at) == changeDate(new Date())) {
    //       return ann;
    //     }
    //   });
    // } catch (error: any) {
    //   loading.value = false;
    //   console.log(error.message);
    // }
  };

  const inputAnn = async (obj: object[]) => {
    inputLoading.value = true;
    const data = await supaClient.insertData('announcements', obj);
    if (!data) return (inputLoading.value = false);
    await getAnn();
    inputLoading.value = false;
    // try {
    //   const { data, error } = await supabase.from('announcements').insert(obj);
    //   if (error) throw error;
    //   inputLoading.value = false;
    //   getAnn();
    //   return data;
    // } catch (error: any) {
    //   console.log(error.message);
    //   inputLoading.value = false;
    // }
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
