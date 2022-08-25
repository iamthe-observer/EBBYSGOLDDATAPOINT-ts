import { defineStore, storeToRefs } from 'pinia';
import { supabase } from '../supabase/supabase';
import { useStorage } from '@vueuse/core';
import { useProfileStore } from './profileStore
import { ref, computed } from 'vue';

export const useDashStore = defineStore('dashboard', () => {
    const dashboard = ref(
        useStorage('dashboard', {
            dailyUserApls: [],
            apls: [],
            paginatedApls: [],
            super_contact_info: [],
        })
    );

    const { role } = storeToRefs(useProfileStore());
    const loading = ref(false);
    const dailyUserSignIns = ref([]);
    const version = ref('2.01-alpha');

    let startNum = ref(0);
    let endNum = ref(9);

    const dailyApls = computed(() => dashboard.value.dailyUserApls);
    const super_contact_info = computed(() => dashboard.value.super_contact_info);
    const getDailyUserAplsNumb = computed(
        () => dashboard.value.dailyUserApls.length
    );

    const getTotalUserAplsNumb = computed(() => dashboard.value.apls.length);

    const getApls = async() => {
        loading.value = true;
        try {
            if (role.value === 'user') {
                const { data, error } = await supabase
                    .from('applicants')
                    .select('*')
                    .order('plastName', { ascending: true })
                    .eq('user_id', supabase.auth.user().id);
                if (error) throw error;
                dashboard.value.apls = data;
            } else {
                const { data, error } = await supabase
                    .from('applicants')
                    .select('*')
                    .order('plastName', { ascending: true });
                if (error) throw error;
                dashboard.value.apls = data;
            }

            const val = dashboard.value.apls.filter(
                y => fd(new Date(y.created_at)) === fd(new Date())
            );
            dashboard.value.dailyUserApls = val;
            loading.value = false;
        } catch (err) {
            console.log(err.message);
            loading.value = false;
        }
    };

    const getContactInfo = async() => {
        try {
            let { data, error } = await supabase
                .from('super_contact_info')
                .select('*');
            if (error) throw error;
            dashboard.value.super_contact_info = data;
        } catch (err) {
            console.trace(err.message);
        }
    };

    const fd = date => {
        let today = date;
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();

        return dd + '/' + mm + '/' + yyyy;
    };

    const getDailyServiceSales = computed(() => {
        const val = dashboard.value.dailyUserApls.map(x => x.totalPayment);
        return val.reduce(function(price, nextPrice) {
            return price + nextPrice;
        }, 0);
    });

    const resetApls = () => {
        dashboard.value.dailyUserApls = [];
        loading.value = false;
        dashboard.value.apls = [];
    };

    const paginateApls = async num => {
        loading.value = true;
        startNum.value = 10 * num;
        endNum.value = 9 + 10 * num;
        try {
            if (role.value === 'user') {
                let { data, error } = await supabase
                    .from('applicants')
                    .select('*')
                    .eq('user_id', supabase.auth.user().id)
                    .order('plastName', { ascending: true })
                    .range(startNum.value, endNum.value);

                if (error) throw error;
                dashboard.value.paginatedApls = data;
            } else {
                let { data, error } = await supabase
                    .from('applicants')
                    .select('*')
                    .order('plastName', { ascending: true })
                    .range(startNum.value, endNum.value);

                if (error) throw error;
                dashboard.value.paginatedApls = data;
            }

            loading.value = false;
        } catch (error) {
            console.log(error.message);
            loading.value = false;
        }
    };

    const getDailyUserSignIns = async() => {
        try {
            const { data, error } = await supabase.from('user_sign_ins').select('*');

            const val = data.filter(
                y => fd(new Date(y.created_at)) === fd(new Date())
            );

            if (error) throw error;
            dailyUserSignIns.value = val;
        } catch (error) {
            console.log(error.message);
        }
    };

    return {
        dashboard,
        version,
        startNum,
        endNum,
        loading,
        fd,
        resetApls,
        getApls,
        dailyApls,
        getDailyUserAplsNumb,
        getTotalUserAplsNumb,
        getDailyServiceSales,
        getContactInfo,
        super_contact_info,
        paginateApls,
        getDailyUserSignIns,
        dailyUserSignIns,
    };
});