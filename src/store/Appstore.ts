import { defineStore } from 'pinia';
import { ref, watchEffect } from 'vue';
import useErrorHandle from '../composables/useErrorHandle';
import { UserSignIn } from '../interfaces/interfaces';
import { supabase } from '../supabase/supabase';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';

export const useAppStore = defineStore('app', () => {
  const user_signins = ref<UserSignIn[]>([]);
  const loading = ref(false);
  let content = ref(useStorage<string | null>('content', null));

  const daily_user_signins = computed(() => {
    return user_signins.value.filter(
      x => fullDate(new Date(x.created_at)) === fullDate(new Date())
    );
  });

  // watchEffect(() => {
  //   console.log(user_signins.value);
  //   console.log(daily_user_signins.value);
  // });

  const fullDate = (date: Date) => {
    let today = date;
    let DD = String(today.getDate()).padStart(2, '0');
    let MM = String(today.getMonth() + 1).padStart(2, '0');
    let YYYY = today.getFullYear();
    let hh = today.getHours();
    let mm = today.getMinutes();
    let ss = today.getSeconds();
    return `${DD}/${MM}/${YYYY}`;
  };

  const active_user_signins = (ID: string) => {
    return user_signins.value.filter(user => {
      return user.user_id === ID;
    });
  };

  const getUserSignIns = async () => {
    loading.value = true;
    try {
      let { data, error } = await supabase
        .from<UserSignIn>('user_sign_ins')
        .select('*');
      if (error) throw error;
      user_signins.value = data!;
      // daily_user_signins.value = data!.filter(DATA => {
      //   fullDate(new Date(DATA.created_at)) === fullDate(new Date());
      // });
      loading.value = false;
      return { data, error };
    } catch (err: any) {
      loading.value = false;
      return useErrorHandle(err, loading.value);
    }
  };

  return {
    user_signins,
    loading,
    content,
    daily_user_signins,
    getUserSignIns,
    fullDate,
  };
});
