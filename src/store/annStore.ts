import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Announcement } from '../interfaces/interfaces';
import { supabase } from '../supabase/supabase';
import { _Null } from '../types/types';
import useErrorHandle from '../composables/useErrorHandle';

export const useAnnStore = defineStore('announcements', () => {
  const announcements = ref(
    useStorage<Announcement[] | null>('announcements', [])
  );
  const announcements_loading = ref<boolean>(false);
  const input_ann_loading = ref<boolean>(false);

  const reset = () => {
    announcements.value = [];
    input_ann_loading.value = false;
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

  const setAnnouncements = (ann: Announcement[]) => {
    announcements.value = ann;
  };

  const getAnnouncements = async () => {
    announcements_loading.value = true;
    try {
      let { data, error } = await supabase
        .from<Announcement>('announcements')
        .select('*');

      if (error) throw error;
      announcements_loading.value = false;
      return { data: data?.reverse(), error };
    } catch (err: any) {
      return useErrorHandle(err, announcements_loading.value);
    }
  };

  const inputAnnouncement = async (
    obj: {
      subject: string;
      body: string | number | string[] | undefined;
      urgency: string;
    }[]
  ) => {
    input_ann_loading.value = true;
    try {
      const { data, error } = await supabase.from('announcements').insert(obj);
      if (error) throw error;
      input_ann_loading.value = false;
      await getAnnouncements();
      return data;
    } catch (error: any) {
      console.log(error.message);
      return useErrorHandle(error, input_ann_loading.value);
    }
  };

  return {
    announcements,
    announcements_loading,
    input_ann_loading,
    getAnnouncements,
    changeDate,
    reset,
    setAnnouncements,
    inputAnnouncement,
  };
});
