import { defineStore, storeToRefs } from 'pinia';
import { supabase } from '../supabase/supabase';
import { ref, Ref, computed } from 'vue';
import { Applicant, Requests } from '../interfaces/interfaces';
import useErrorHandle from '../composables/useErrorHandle';
import { _Null } from '../types/types';
import { useProfileStore } from './ProfileStore';

export const useRequestStore = defineStore('requests', () => {
  const requests_loading = ref(false);
  const requests: Ref<Requests[]> = ref([]);
  const current_request: Ref<Requests | null> = ref(null);
  const is_request_open = ref(false);
  const view_ward_request_image = ref<boolean>(false);
  const { role } = storeToRefs(useProfileStore());

  // methods
  const reset = () => {
    requests.value = [];
    current_request.value = null;
  };

  const status_class = (requests: string): string => {
    if (requests == 'pending') {
      return 'text-xs w-[85px] text-center text-indigo-600 bg-indigo-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-indigo-400';
    } else if (requests == 'accepted') {
      return 'text-xs w-[85px] text-center text-green-600 bg-green-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-green-400';
    } else {
      return 'text-xs w-[85px] text-center text-red-600 bg-red-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-red-400';
    }
  };

  const setRequests = (req: Requests[]) => {
    requests.value = req;
  };
  const setCurrentRequest = (request: Requests) => {
    current_request.value = request;
  };

  const setViewRequestForWardImageDisplay = (bol: boolean): void => {
    view_ward_request_image.value = bol;
  };

  const full_name = (x: Applicant) => {
    if (x) {
      const ln = x.plastName;
      const fn = x.pfirstName;
      const on = x.potherName;
      return `${ln} ${fn} ${on}`;
    }
  };

  function capitalizeFirstLetter(string: string) {
    let lowered = string!.toLowerCase();
    return lowered.charAt(0).toUpperCase() + lowered.slice(1);
  }

  const getAllRequests = async () => {
    requests_loading.value = true;
    try {
      const { data, error } = await supabase
        .from<Requests>('requests')
        .select('*');

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
      // console.log('requests: ', requests.value);
      requests_loading.value = false;

      return { data: requests.value, error };
    } catch (error: any) {
      return useErrorHandle(error, requests_loading.value);
    }
  };

  const getRequestsById = async (user_id: string) => {
    requests_loading.value = true;
    try {
      const { data, error } = await supabase
        .from<Requests>('requests')
        .select('*')
        .eq('user_id', user_id);
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

      requests_loading.value = false;
      return { data, error };
    } catch (error: any) {
      return useErrorHandle(error, requests_loading.value);
    }
  };

  const refresh = async () => {
    if (role.value) {
      requests_loading.value = true;
      let req = await getRequestsById(supabase.auth.user()?.id!);
      setRequests(req?.data!);
      requests_loading.value = false;
    } else {
      requests_loading.value = true;
      let req = await getAllRequests();
      setRequests(req?.data!);
      requests_loading.value = false;
    }
  };

  const handleOpenAplRequest = (request: Requests) => {
    is_request_open.value = true;
    current_request.value = request;
  };

  const deleteRequest = async (id: string) => {
    requests_loading.value = true;
    try {
      const { data, error } = await supabase
        .from<Requests>('requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
      requests_loading.value = false;
      return { data, error };
    } catch (error: any) {
      return useErrorHandle(error, requests_loading.value);
    }
  };

  // computed
  const prime_path = computed((): string => {
    return current_request.value!.modify_apl.aplImg_path.primePath![0];
  });

  const is_request = computed<boolean>(() => {
    if (requests.value!.length == 0) {
      return false;
    } else {
      return true;
    }
  });

  return {
    deleteRequest,
    full_name,
    status_class,
    handleOpenAplRequest,
    setViewRequestForWardImageDisplay,
    capitalizeFirstLetter,
    setCurrentRequest,
    refresh,
    getAllRequests,
    getRequestsById,
    reset,
    current_request,
    prime_path,
    is_request,
    is_request_open,
    view_ward_request_image,
    requests,
    requests_loading,
  };
});
