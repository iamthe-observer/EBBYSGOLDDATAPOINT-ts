import { defineStore } from 'pinia';
import { supabase } from '../supabase/supabase';
import { ref, Ref, computed } from 'vue';
import { useProfileStore } from './profileStore';
import { storeToRefs } from 'pinia';
import { Applicant, Requests } from '../interfaces/interfaces';

export const useRequestStore = defineStore('requests', () => {
  const loading = ref(false);
  const requests: Ref<Requests[] | null> = ref([]);
  const isRequestOpen = ref(false);
  const currentRequest: Ref<Requests | null> = ref(null);
  const { role } = storeToRefs(useProfileStore());

  const statusClass = (requests: string): string => {
    if (requests == 'pending') {
      return 'text-xs w-[85px] text-center text-indigo-600 bg-indigo-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-indigo-400';
    } else if (requests == 'accepted') {
      return 'text-xs w-[85px] text-center text-green-600 bg-green-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-green-400';
    } else {
      return 'text-xs w-[85px] text-center text-red-600 bg-red-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-red-400';
    }
  };

  const curr_request = ref<Requests | null>(null);

  const setCurrRequest = (request: Requests) => {
    curr_request.value = request;
  };

  const viewWardRequestImage = ref<boolean>(false);

  const setViewRequestForWardImageDisplay = (bol: boolean): void => {
    viewWardRequestImage.value = bol;
  };

  const fullName = (x: Applicant) => {
    if (x) {
      const ln = x.plastName;
      const fn = x.pfirstName;
      const on = x.potherName;
      return `${ln} ${fn} ${on}`;
    }
  };

  const isRequest = computed<boolean>(() => {
    if (requests.value!.length == 0) {
      return false;
    } else {
      return true;
    }
  });

  function capitalizeFirstLetter(string: string) {
    let lowered = string!.toLowerCase();
    return lowered.charAt(0).toUpperCase() + lowered.slice(1);
  }

  const getRequests = async () => {
    loading.value = true;
    console.log(role.value);

    if (!role.value) {
      try {
        const { data, error } = await supabase.from('requests').select('*');

        if (error) throw error;
        requests.value = data.reverse();

        requests.value?.forEach((request: Requests) => {
          if (request.modify_type == 'edit') {
            Object.entries(request.modify_apl).forEach(([key, value]) => {
              if (
                key === 'pcountry_ob' ||
                key === 'scountry_ob' ||
                key === 'pcountry_live_today'
              ) {
                if (!request.modify_apl[key]) return;
                request.modify_apl[key] = capitalizeFirstLetter(value);
              }
              if (
                key === 'peducation_level' ||
                key === 'pgender' ||
                key === 'sgender' ||
                key === 'pmarital_status'
              ) {
                if (!request.modify_apl[key]) return;
                request.modify_apl[key] = value.toLowerCase();
              }
              if (key === 'wards') {
                request.modify_apl[key].forEach(ward => {
                  Object.entries(ward).forEach(([key, value]) => {
                    if (key === 'wcountry_ob') {
                      if (!ward[key]) return;
                      ward[key] = capitalizeFirstLetter(value);
                    }
                  });
                });
              }
            });
          }
        });

        requests.value.sort((a, b) => b.status.localeCompare(a.status));
        console.log(requests.value);
      } catch (error: any) {
        console.log(error.message);
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', supabase.auth.user()?.id);
        if (error) throw error;
        requests.value = data.reverse();
        console.log(requests.value);
        loading.value = false;
      } catch (error: any) {
        console.log(error.message);
        loading.value = false;
      } finally {
        loading.value = false;
      }
    }
  };

  const refresh = async () => {
    requests.value = [];
    loading.value = true;
    await getRequests();
    loading.value = false;
  };

  const primePath = computed((): string => {
    return currentRequest.value!.modify_apl.aplImg_path.primePath![0];
  });

  const handleOpenAplRequest = (request: Requests) => {
    isRequestOpen.value = true;
    currentRequest.value = request;
  };

  const deleteRequest = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    deleteRequest,
    curr_request,
    setCurrRequest,
    primePath,
    refresh,
    getRequests,
    isRequest,
    isRequestOpen,
    fullName,
    statusClass,
    requests,
    currentRequest,
    handleOpenAplRequest,
    loading,
    setViewRequestForWardImageDisplay,
    viewWardRequestImage,
    capitalizeFirstLetter,
  };
});
