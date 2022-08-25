import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../supabase/supabase';
import { useRouter } from 'vue-router';
import * as types from '../types/types';

export const useAuthStore = defineStore('authenticate', () => {
  const router = useRouter();

  async function logout(ev: boolean) {
    try {
      let { error } = await supabase.auth.signOut();
      if (error) throw error;
      // logged.value = ev;
      router.push({ name: 'Authenticate' });
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async function login(ev: types.emitLogin) {}

  return {
    logout,
    login,
  };
});
