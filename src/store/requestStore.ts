import { defineStore } from 'pinia';
import { supabase } from '../supabase/supabase';
import { ref, Ref, computed } from 'vue';
import { useProfileStore } from './profileStore';
import { storeToRefs } from 'pinia';
import { Applicant, Requests } from '../interfaces/interfaces';
import { deleteData, getData } from '../composables/supaClient';

export const useRequestStore = defineStore('requests', () => {
  const loading = ref(false);
  const requests: Ref<Requests[]> = ref([]);
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

  const fullName = (x: Applicant) => {
    if (x) {
      const ln = x.plastName;
      const fn = x.pfirstName;
      const on = x.potherName;
      return `${ln} ${fn} ${on}`;
    }
  };

  const isRequest = computed<boolean>(() => {
    if (requests.value.length == 0) {
      return false;
    } else {
      return true;
    }
  });

  const getRequests = async () => {
    if (role.value) {
      try {
        loading.value = true;
        const data = await getData(
          'requests',
          '*',
          'user_id',
          supabase.auth.user()!.id
        );
        if (data) requests.value = data.reverse();
        loading.value = false;
        // const { data, error } = await supabase
        //   .from('requests')
        //   .select('*')
        //   .eq('user_id', supabase.auth.user().id);
        //   requests.value = data!.sort(
        //     (a: any, b: any) => new Date(b.created_at) - new Date(a.created_at)
        //   );
        return data;
      } catch (err: any) {
        loading.value = false;
        console.log(err.message);
      }
    } else {
      try {
        loading.value = true;
        const data = await getData('requests', '*');
        loading.value = false;
        if (data) requests.value = data.reverse();
        // const { data, error } = await supabase.from('requests').select('*');
        // requests.value = data.sort(
        //   (a, b) => new Date(b.created_at) - new Date(a.created_at)
        // );
        // .reverse()
        return data;
      } catch (err: any) {
        loading.value = false;
        console.log(err.message);
      }
    }
  };

  const refresh = async () => {
    requests.value = [];
    loading.value = true;
    await getRequests();
    loading.value = false;
  };

  //   const primeImg = computed<string>(() => {
  //     return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
  //       currentRequest.value!.modify_apl.aplImg_path.primePath[0]
  //     }`;
  //   });

  const handleOpenAplRequest = (request: Requests) => {
    isRequestOpen.value = true;
    currentRequest.value = request;
  };

  const curr_request = ref<Requests | null>(null);

  const setCurrRequest = (request: Requests) => {
    curr_request.value = request;
  };

  const deleteRequest = async (id: string) => {
    // try {
    //   const { data, error } = await supabase
    //     .from('requests')
    //     .delete()
    //     .eq('id', id);
    //   if (error) throw error;
    // } catch (error) {
    //   console.log(error);
    // }

    const data = deleteData('requests', 'id', id);
  };

  return {
    deleteRequest,
    curr_request,
    setCurrRequest,
    // primeImg,
    refresh,
    getRequests,
    isRequest,
    isRequestOpen,
    fullName,
    statusClass,
    requests,
    currentRequest,
    handleOpenAplRequest,
  };
});
