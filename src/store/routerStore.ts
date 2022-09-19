import { supabase } from '../supabase/supabase';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref, watchEffect, computed } from 'vue';
import { RouteRecordName, useRouter } from 'vue-router';
import { _Null } from '../types/types';
import { Session } from '@supabase/gotrue-js';

export const useRouterStore = defineStore('routeStore', () => {
  const session: _Null<Session> = supabase.auth.session();
  const router = useRouter();
  const isNotFound = ref<boolean>(false);
  const route_name = computed(() => {
    return router.currentRoute.value.name;
  });

  const curr_route = ref(
    useStorage<{ route: RouteRecordName | string | null | undefined }>(
      'currentRoute',
      {
        route: '',
      }
    )
  );

  watchEffect(() => {
    if (route_name.value == 'AplDetails') {
      curr_route.value.route = 'Database';
    } else if (route_name.value == 'Authenticate' && session) {
      curr_route.value.route = 'Dashboard';
      router.push({ name: 'Dashboard' });
    } else {
      curr_route.value.route = route_name.value;
    }
  });

  return {
    route_name,
    curr_route,
    isNotFound,
  };
});
