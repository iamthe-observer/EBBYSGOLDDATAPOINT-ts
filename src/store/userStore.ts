import { defineStore } from 'pinia';
import { useDashStore } from './DashboardStore';
import { supabase } from '../supabase/supabase.js';
import { Applicant, ProfileData } from '../interfaces/interfaces';
import { computed, ref } from '@vue/reactivity';
import _ from 'lodash';
import { UserData } from '../interfaces/interfaces';

export const useUserStore = defineStore('userData', () => {
  const curr_user_data = ref<UserData | undefined>();
  const users_data = ref<UserData[] | undefined>([]);
  const users_loading = ref(false);

  const setCurrUserData = (val: UserData) => {
    curr_user_data.value = val;
  };

  const getUserData = async (id: string) => {
    users_loading.value = true;
    try {
      const { data: apls, error } = await supabase
        .from<Applicant>('applicants')
        .select('*')
        .order('plastName', { ascending: true })
        .eq('user_id', id);

      const { data: profile, error: err } = await supabase
        .from<ProfileData>('profiles')
        .select('*');
      if (err || error) throw error || err;
      users_loading.value = false;

      return {
        data: { profile, apls },
        error: {
          error,
          err,
        },
      };
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const getDailyUserApls = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from<Applicant>('applicants')
        .select('*')
        .order('plastName', { ascending: true })
        .eq('user_id', id);
      if (error) throw error;

      const val = data.filter(
        y =>
          useDashStore().fd(new Date(y.created_at)) ===
          useDashStore().fd(new Date())
      );

      return val;
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const curr_user_apls_by_date = computed<Applicant[]>((): Applicant[] => {
    return curr_user_data.value!.apls!.sort(function (a, b) {
      let dateA = new Date(a.created_at).getTime();
      let dateB = new Date(b.created_at).getTime();
      return dateA < dateB ? 1 : -1;
    });
  });

  return {
    getUserData,
    getDailyUserApls,
    setCurrUserData,
    users_data,
    curr_user_data,
    curr_user_apls_by_date,
  };
});
