import { defineStore, storeToRefs } from 'pinia';
import { Applicant } from '../interfaces/interfaces';
import { ref, watchEffect } from 'vue';
import { computed } from '@vue/reactivity';
import { supabase } from '../supabase/supabase';
import { _Null } from '../types/types';
import { useProfileStore } from './ProfileStore';
import useErrorHandle from '../composables/useErrorHandle';
import { useDashStore } from './DashboardStore';

export const useApplicantStore = defineStore('applicants', () => {
  const applicants = ref<Applicant[] | null>([]);
  const paginated_applicants = ref<Applicant[] | null>([]);
  const applicants_loading = ref<boolean>(false);
  const startNum = ref<_Null<number>>(null);
  const endNum = ref<_Null<number>>(null);
  const { role } = storeToRefs(useProfileStore());

  // computed
  const total_applicants_number = computed(() => {
    if (!applicants.value) return;
    return applicants.value.length;
  });

  const daily_user_applicants = computed(() => {
    if (!applicants.value) return;
    return applicants.value.filter(apl => {
      return (
        useDashStore().fd(new Date(apl.created_at)) ===
        useDashStore().fd(new Date())
      );
    });
  });

  // watchEffect(() => {
  //   console.log(applicants.value);

  //   console.log(daily_user_applicants.value);
  // });

  const daily_service_sales = computed(() => {
    if (daily_user_applicants.value?.length! <= 0) return;
    let val = daily_user_applicants.value!.map(apl => apl.totalPayment);
    return val.reduce((a, b) => {
      return a + b;
    });
  });

  // methods
  function setApplicants(apls: Applicant[] | null) {
    applicants.value = apls;
  }
  function setPaginatedApplicants(apls: Applicant[] | null) {
    paginated_applicants.value = apls;
  }

  async function getApplicants() {
    try {
      let { data, error } = await supabase
        .from<Applicant>('applicants')
        .select('*');
      if (error) throw error;
      return { data, error };
    } catch (err) {
      return useErrorHandle(err, applicants_loading.value);
    }
  }

  async function getApplicantsByUserId(user_id: string) {
    applicants_loading.value = true;
    try {
      let { data, error } = await supabase
        .from<Applicant>('applicants')
        .select('*')
        .eq('user_id', user_id);

      if (error) throw error;

      applicants_loading.value = false;
      return {
        data,
        error,
      };
    } catch (err: any) {
      return useErrorHandle(err, applicants_loading.value);
    }
  }

  const getPaginatedApls = async (num: number, user_id: string) => {
    applicants_loading.value = true;
    startNum.value = 10 * num;
    endNum.value = 9 + 10 * num;
    try {
      if (role.value) {
        let { data, error } = await supabase
          .from<Applicant>('applicants')
          .select('*')
          .eq('user_id', user_id)
          .order('plastName', { ascending: true })
          .range(startNum.value, endNum.value);

        if (error) throw error;
        applicants_loading.value = false;
        return { data, error };
      } else {
        let { data, error } = await supabase
          .from<Applicant>('applicants')
          .select('*')
          .order('plastName', { ascending: true })
          .range(startNum.value, endNum.value);

        if (error) throw error;
        applicants_loading.value = false;
        return { data, error };
      }
    } catch (err: any) {
      return useErrorHandle(err, applicants_loading.value);
    }
  };

  const reset = () => {
    applicants_loading.value = false;
    applicants.value = [];
    paginated_applicants.value = [];
    startNum.value = null;
    endNum.value = null;
  };

  return {
    daily_user_applicants,
    daily_service_sales,
    applicants,
    applicants_loading,
    total_applicants_number,
    paginated_applicants,
    reset,
    getApplicants,
    getApplicantsByUserId,
    setApplicants,
    setPaginatedApplicants,
    getPaginatedApls,
  };
});
