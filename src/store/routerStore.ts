import { supabase } from '../supabase/supabase';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref, watchEffect, computed, Component } from 'vue';
import { RouteRecordName, useRouter } from 'vue-router';
import { _Null } from '../types/types';

export const useRouteStore = defineStore('routeStore', () => {
  const session = supabase.auth.session();
  const router = useRouter();
  const routeName = computed(() => {
    return router.currentRoute.value.name;
  });

  const currRoute = ref(
    useStorage<{ route: RouteRecordName | string | null | undefined }>(
      'currentRoute',
      {
        route: null,
      }
    )
  );

  watchEffect(() => {
    if (routeName.value == 'AplDetails') {
      currRoute.value.route = 'Database';
    } else if (routeName.value == 'Authenticate' && session) {
      currRoute.value.route = 'Dashboard';
      router.push({ name: 'Dashboard' });
    } else {
      currRoute.value.route = routeName.value;
    }
  });

  return {
    routeName,
    currRoute,
  };
});
