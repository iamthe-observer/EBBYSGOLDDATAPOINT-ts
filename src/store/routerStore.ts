import { supabase } from '../supabase/supabase';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref, watchEffect, computed } from 'vue';
import { useRouter } from 'vue-router';

export const useRouteStore = defineStore('routeStore', () => {
    const session = supabase.auth.session();
    const router = useRouter();
    const routeName = computed(() => {
        return router.currentRoute.value.name;
    });

    const currRoute = ref(
        useStorage('currentRoute', {
            route: null,
        })
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