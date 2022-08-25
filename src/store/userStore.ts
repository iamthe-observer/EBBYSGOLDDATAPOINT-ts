import { defineStore, storeToRefs } from 'pinia';
import { useDashStore } from './dashboardStore';
import { supabase } from '../supabase/supabase.js';

export const useUserStore = defineStore('userData', () => {
    const getUserApls = async id => {
        try {
            const { data, error } = await supabase
                .from('applicants')
                .select('*')
                .order('plastName', { ascending: true })
                .eq('user_id', id);
            if (error) throw error;

            const val = data.filter(
                y =>
                useDashStore().fd(new Date(y.created_at)) ===
                useDashStore().fd(new Date())
            );
            return val;
        } catch (err) {
            console.log(err.message);
        }
    };

    const totalUserDailyAplsAmount = async id => {
        let totalApls = await userDailyAplTotal(id);
        if (totalApls.length)
            return totalApls.reduce((a, b) => {
                a.totalPayment + b.totalPayment;
            });
    };

    return {
        getUserApls,
        totalUserDailyAplsAmount,
    };
});