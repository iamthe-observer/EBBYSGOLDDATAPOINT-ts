import { reactive } from 'vue';

const state = reactive({
    profile: null,
});

const methods = {
    setProfile(payload) {
        state.profile = payload ? payload : null;
    },
    resetUser() {
        // state.user = null;
        state.profile = null;
    },
};

export default {
    state,
    methods,
};