import { defineStore } from 'pinia';
import { supabase } from '../supabase/supabase';
import { ref, computed } from 'vue';
import { useProfileStore } from './profileStore';
import { storeToRefs } from 'pinia';

export const useRequestStore = defineStore('requests', () => {
    const loading = ref(false);
    const requests = ref([]);
    const isRequestOpen = ref(false);
    const currentRequest = ref(null);
    const { role } = storeToRefs(useProfileStore());

    const statusClass = requests => {
        if (requests == 'pending') {
            return 'text-xs w-[85px] text-center text-indigo-600 bg-indigo-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-indigo-400';
        } else if (requests == 'accepted') {
            return 'text-xs w-[85px] text-center text-green-600 bg-green-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-green-400';
        } else {
            return 'text-xs w-[85px] text-center text-red-600 bg-red-200 px-2 py-1 rounded-full group-hover:outline group-hover:outline-2 group-hover:outline-red-400';
        }
    };

    const fullName = x => {
        if (x) {
            const ln = x.plastName;
            const fn = x.pfirstName;
            const on = x.potherName;
            return `${ln} ${fn} ${on}`;
        }
    };

    const isRequest = computed(() => {
        if (requests.value.length == 0) {
            return false;
        } else {
            return true;
        }
    });

    const getRequests = async() => {
        if (role.value == 'user') {
            try {
                loading.value = true;
                const { data, error } = await supabase
                    .from('requests')
                    .select('*')
                    .eq('user_id', supabase.auth.user().id);
                if (error) throw error;
                loading.value = false;
                requests.value = data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
            } catch (err) {
                loading.value = false;
                console.log(err.message);
            }
        } else {
            try {
                loading.value = true;
                const { data, error } = await supabase.from('requests').select('*');
                if (error) throw error;
                loading.value = false;
                // requests.value = data
                //     .filter(pendingR => pendingR.status == 'pending')
                //     .reverse();
                requests.value = data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                // .reverse()
            } catch (err) {
                loading.value = false;
                console.log(err.message);
            }
        }
    };

    const refresh = async() => {
        requests.value = [];
        loading.value = true;
        await getRequests();
        loading.value = false;
    };

    const primeImg = computed(() => {
        return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${currentRequest?.value?.modify_apl.aplImg_path.primePath}`;
    });

    const handleOpenAplRequest = request => {
        isRequestOpen.value = true;
        currentRequest.value = request;
    };

    const curr_request = ref(null);

    const setCurrRequest = request => {
        curr_request.value = request;
    };

    const deleteRequest = async id => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.log(error);
        }
    };

    return {
        deleteRequest,
        curr_request,
        setCurrRequest,
        primeImg,
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