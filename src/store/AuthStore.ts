import { defineStore } from 'pinia';
import { supabase } from '../supabase/supabase';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('authenticate', () => {
  const router = useRouter();

  async function logout() {
    let { error } = await supabase.auth.signOut();
    if (error) throw error;
    // logged.value = ev;
    router.push({ name: 'Authenticate' });
    return { error };
  }

  return {
    logout,
  };
});
