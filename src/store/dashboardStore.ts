import { defineStore } from 'pinia';
import { supabase } from '../supabase/supabase';
import { ref } from 'vue';
import { SupervisorInfo } from '../interfaces/interfaces';
import useErrorHandle from '../composables/useErrorHandle';

export const useDashStore = defineStore('dashboard', () => {
  const supervisor_info = ref<SupervisorInfo[]>([]);
  const dash_loading = ref(false);
  const version = ref('1.10.5');

  const getSupervisorData = async () => {
    dash_loading.value = true;
    try {
      let { data, error } = await supabase
        .from('super_contact_info')
        .select('*');
      if (error) throw error;
      dash_loading.value = false;
      supervisor_info.value = data!;
      return { data, error };
    } catch (err: any) {
      dash_loading.value = false;
      return useErrorHandle(err, dash_loading.value);
    }
  };

  const fd = (date: Date): string => {
    let today: Date = date;
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    return dd + '/' + mm + '/' + yyyy;
  };

  const reset = () => {
    dash_loading.value = false;
    supervisor_info.value = [];
  };

  return {
    version,
    dash_loading,
    supervisor_info,
    fd,
    reset,
    getSupervisorData,
  };
});
