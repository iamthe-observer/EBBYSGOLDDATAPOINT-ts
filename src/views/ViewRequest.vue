<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  ref,
  onMounted,
  computed,
  reactive,
  onBeforeMount,
  onBeforeUnmount,
} from 'vue';
import { supabase } from '../supabase/supabase';
import { useToast } from 'primevue/usetoast';
import { useApplyImgStore } from '../store/aplImgStore';
import { storeToRefs } from 'pinia';
import { useProfileStore } from '../store/profileStore.js';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import WardFormDetails from '../components/wardFormDetails.vue';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import Toast from 'primevue/toast';
import _ from 'lodash';
import { useRequestStore } from '../store/requestStore';
import ImageView from '../components/imgView.vue';
import Countries from '../components/countries.vue';
import {
  ProfileData,
  Applicant,
  Requests,
  WardsApplicant,
} from '../interfaces/interfaces';

const toast = useToast();
const loading = ref<boolean>(false);
const route = useRoute();
const id = computed(() => route.params.id);
const { curr_request } = storeToRefs(useRequestStore());
const viewed_request = ref(curr_request.value);
console.log(viewed_request.value);

const modified_apl = computed(() => {
  return curr_request.value!.modify_apl;
});

onBeforeMount(() => {
  useRequestStore().setViewRequestForWardImageDisplay(true);
});

onBeforeUnmount(() => {
  useRequestStore().setViewRequestForWardImageDisplay(false);
});

async function handleApprove(request: Requests | null) {
  if (request!.modify_type == 'edit') {
    try {
      const { data: updateApl, error: errorUpdate } = await supabase
        .from('applicants')
        .update(request!.modify_apl)
        .eq('apl_id', request!.apl_id);
      if (errorUpdate) throw errorUpdate;

      console.log(updateApl);

      const { data: acceptedRequest, error: requestError } = await supabase
        .from('requests')
        .update({ status: 'accepted' })
        .eq('id', request!.id);
      if (requestError) throw requestError;

      console.log(acceptedRequest, 'accepted');

      toast.add({
        severity: 'success',
        summary: `${request!.modify_apl.fullName}'s request has been approved.`,
        detail: 'Edited Applicant.',
        life: 2000,
      });

      setTimeout(() => {
        useRequestStore().getRequests();
      }, 2000);
    } catch (err: any) {
      console.log(err);
      toast.add({
        severity: 'error',
        summary: `Error occured... check internet connectivity.`,
        detail: `error mesage: ${err.message}`,
        life: 2000,
      });
    }
  } else {
    try {
      const { data: delApl, error: errorUpdate } = await supabase
        .from('applicants')
        .delete()
        .eq('apl_id', request!.apl_id);
      if (errorUpdate) throw errorUpdate;

      console.log(delApl);

      const { data: acceptedRequest, error: requestError } = await supabase
        .from('requests')
        .update({ status: 'accepted' })
        .eq('id', request!.id);
      if (requestError) throw requestError;

      console.log(acceptedRequest, 'accepted');

      toast.add({
        severity: 'success',
        summary: `${request!.modify_apl.fullName}'s request has been approved.`,
        detail: 'Deleted Applicant.',
        life: 2000,
      });

      setTimeout(() => {
        useRequestStore().getRequests();
      }, 2000);
    } catch (err: any) {
      console.log(err);
      toast.add({
        severity: 'error',
        summary: `Error occured... check internet connectivity.`,
        detail: `error mesage: ${err.message}`,
        life: 2000,
      });
    }
  }
}

async function handleReject(request: Requests | null) {
  try {
    const { data: acceptedRequest, error: requestError } = await supabase
      .from('requests')
      .update({ status: 'rejected' })
      .eq('id', request!.id);
    if (requestError) throw requestError;

    console.log(acceptedRequest, 'rejected');
    toast.add({
      severity: 'success',
      summary: `${request!.modify_apl.fullName}'s request has been approved.`,
      detail: 'Rejected Applicant.',
      life: 2000,
    });

    setTimeout(() => {
      useRequestStore().getRequests();
    }, 2000);
  } catch (error: any) {
    console.log(error);
    toast.add({
      severity: 'error',
      summary: `${
        request!.modify_apl.fullName
      }'s request could not be approved.`,
      detail: 'Check internet connection and try again..',
      life: 6000,
    });
  }
}

let apl = reactive<Applicant>({
  created_at: new Date(),
  apl_id: null,
  plastName: null,
  pfirstName: null,
  potherName: null,
  pdob_day: null,
  pdob_month: null,
  pdob_year: null,
  pcity_ob: null,
  pcountry_ob: null,
  pgender: null,
  pconf_code: null,
  pemail: null,
  ppassport_number: null,
  passport_ex_day: null,
  passport_ex_month: null,
  passport_ex_year: null,
  pcountry_live_today: null,
  peducation_level: null,
  ppostal: null,
  pmarital_status: 'unmarried',
  children_number: 0,
  fullName: null,
  user_id: supabase.auth.user()!.id,
  pcontact: null,
  slastName: null,
  sfirstName: null,
  sotherName: null,
  scity_ob: null,
  scountry_ob: null,
  sgender: null,
  wards: [],
  sdob_day: null,
  sdob_month: null,
  sdob_year: null,
  totalPayment: 0,
  passportAvail: false,
  created_at_date: new Date().toLocaleString().split(',')[0],
  pother_contact: null,
  psocial_media: {
    facebook: null,
    instagram: null,
    twitter: null,
  },
  aplImg_path: {
    primePath: [],
    secPath: [],
    wardsPath: [],
  },
});

// const created_at = ref(null);

const hasSpouse = ref(false);
const hasWards = ref(false);
const request = ref(null);
const isRequested = ref(false);
const isSavedWardArr = ref<{}[]>([]);
const editedWards = ref<WardsApplicant[]>([]);
const disabled = ref(false);
const editMode = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}

const userOfApl = ref<ProfileData | null>(null);
const aplImg_path = ref([]);
const primeIMG = ref<any>(null);
const ifSavedPrimeMsg = ref(false);
const ifSavedSecMsg = ref(false);
const imgUploading = ref(false);
const primeSRC = ref<string>('');
const secIMG = ref<any>(null);
const secSRC = ref<string>('');

const onSelectPrime = (evt: any) => {
  ifSavedPrimeMsg.value = false;
  primeIMG.value = evt.files[0];
  primeSRC.value = evt.files[0].objectURL;
};

const onSelectSec = (evt: any) => {
  ifSavedSecMsg.value = false;
  secIMG.value = evt.files[0];
  secSRC.value = evt.files[0].objectURL;
};

const viewRequestDiv = ref(null);

const primeImage = computed(() => {
  if (primeIMG.value) {
    return primeSRC.value;
  } else {
    if (apl?.aplImg_path.primePath?.length) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
        apl?.aplImg_path.primePath![0]
      }`;
    } else {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/avatar.svg`;
    }
  }
});
const secImage = computed(() => {
  if (secIMG.value) {
    return secSRC.value;
  } else {
    if (apl?.aplImg_path.secPath?.length) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
        apl?.aplImg_path.secPath![0]
      }`;
    } else {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg`;
    }
  }
});

const saveImgFiles = (e: any, type: string) => {
  useApplyImgStore().setFiles(e.files[0], type);
  toggleEditMode();
  if (type == 'prime') {
    ifSavedPrimeMsg.value = true;
  } else {
    ifSavedSecMsg.value = true;
  }
};

const full = computed((): string | null => {
  if (apl!.plastName || apl!.pfirstName) {
    return null;
  } else {
    return `${apl?.plastName!.toUpperCase().trim()} ${apl
      ?.pfirstName!.toUpperCase()
      .trim()}${
      apl!.potherName ? ' ' + apl?.potherName!.toUpperCase().trim() : ''
    }`;
  }
});

const passportStatusColor = computed(() => {
  if (apl!.passportAvail) return 'success';
  return 'danger';
});
const m_passportStatusColor = computed(() => {
  if (modified_apl.value.passportAvail) return 'success';
  return 'danger';
});

const wardEmitted = (e: WardsApplicant) => {
  editedWards.value.push(e);
  isSavedWardArr.value.push({});
};

console.log(modified_apl.value);

const wardRemoved = (e: number) => {
  isSavedWardArr.value.pop();
  const wardsRemoved = editedWards.value.filter(ward => ward.index !== e);
  editedWards.value = wardsRemoved;
};

const showErrorOnload = (errorMsg: string) => {
  toast.add({
    severity: 'danger',
    summary: `Failed to load resource.`,
    detail: `${errorMsg}.`,
    life: 6000,
  });
};

const loadApl = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('apl_id', curr_request.value?.apl_id);

    if (error) throw error;
    console.log(data[0]);
    console.log(curr_request.value);

    apl.created_at = data[0].created_at;
    apl.apl_id = data[0].apl_id;
    apl.plastName = data[0].plastName;
    apl.pfirstName = data[0].pfirstName;
    apl.potherName = data[0].potherName;
    apl.pdob_day = data[0].pdob_day;
    apl.pdob_month = data[0].pdob_month;
    apl.pdob_year = data[0].pdob_year;
    apl.pcity_ob = data[0].pcity_ob;
    apl.pcountry_ob = data[0].pcountry_ob;
    apl.pgender = data[0].pgender;
    apl.pconf_code = data[0].pconf_code;
    apl.pemail = data[0].pemail;
    apl.ppassport_number = data[0].ppassport_number;
    apl.passport_ex_day = data[0].passport_ex_day;
    apl.passport_ex_month = data[0].passport_ex_month;
    apl.passport_ex_year = data[0].passport_ex_year;
    apl.pcountry_live_today = data[0].pcountry_live_today;
    apl.peducation_level = data[0].peducation_level;
    apl.ppostal = data[0].ppostal;
    apl.pmarital_status = data[0].pmarital_status;
    apl.children_number = data[0].children_number;
    apl.fullName = data[0].fullName;
    apl.user_id = data[0].user_id;
    apl.pcontact = data[0].pcontact;
    apl.slastName = data[0].slastName;
    apl.sfirstName = data[0].sfirstName;
    apl.sotherName = data[0].sotherName;
    apl.scity_ob = data[0].scity_ob;
    apl.scountry_ob = data[0].scountry_ob;
    apl.sgender = data[0].sgender;
    apl.wards = data[0].wards;
    apl.sdob_day = data[0].sdob_day;
    apl.sdob_month = data[0].sdob_month;
    apl.sdob_year = data[0].sdob_year;
    apl.totalPayment = data[0].totalPayment;
    apl.passportAvail = data[0].passportAvail;
    apl.created_at_date = data[0].created_at_date;
    apl.pother_contact = data[0].pother_contact;
    apl.psocial_media = data[0].psocial_media;
    apl.aplImg_path = data[0].aplImg_path;

    if (data[0].slastName != '' && data[0].slastName != null) {
      hasSpouse.value = true;
    }

    if (data[0].wards.length > 0) {
      hasWards.value = true;
    }

    let user = useProfileStore().Users.filter(user => user.id === apl!.user_id);
    userOfApl.value = user[0];

    loading.value = false;
  } catch (err: any) {
    console.log(err.message);
    loading.value = false;
    showErrorOnload(err.message);
  }
};

onMounted(() => {
  loadApl();
});

const options: object = {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const changeDate = (date: Date) => {
  const day = new Date(date).toLocaleDateString('en-us', options);
  return day;
};

const showSuccessConf = () => {
  toast.add({
    severity: 'success',
    summary: `Confirmation Code Updated.`,
    detail: ``,
    life: 4000,
  });
};
const showErrorConf = () => {
  toast.add({
    severity: 'error',
    summary: `Confirmation Code Not Updated.`,
    detail: `The Confirmation Code was not updated! Please check for internet connectivity issues.`,
    life: 4000,
  });
};

const showToast = (
  severity: string,
  summary: string,
  detail: string,
  life: number = 4000
) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: life,
  });
};

let imageUpdateLoading = ref(false);

const getUser4Apl = computed(() => {
  let user = useProfileStore().Users.filter(user => user.id === apl!.user_id);
  return user[0];
});

// // const getComparedModifiedApl = () => {
// _.forEach(request.value, (value, key) => {
//   console.log({ key: value });
// });
// };

const lowecaseMaritalStatus = computed(() => {
  return modified_apl.value.pmarital_status?.toLowerCase();
});
const lowecaseLvlOfEdu = computed(() => {
  return modified_apl.value.peducation_level?.toLowerCase();
});
</script>

<template>
  <div
    class="flex-1 p-5 bg-indigo-100 border-none rounded-3xl [max-height:100%] flex gap-3"
  >
    <div v-if="loading" class="flex justify-center items-center w-full">
      <ProgressSpinner strokeWidth="4" animationDuration="1s" />
    </div>
    <div
      v-else
      class="flex flex-col gap-[30px] min-w-full flex-1 min-h-full bg-gray-50 overflow-y-scroll rounded-2xl p-[20px]"
    >
      <div
        ref="viewRequestDiv"
        class="flex flex-col gap-[30px] min-w-full flex-1 min-h-full rounded-2xl p-[20px]"
      >
        <h1
          class="text-center bg-gradient-to-br from-cyan-300 to-lime-300 text-[1.5rem] font-bold mt-10 mx-auto text-white px-4 py-2 rounded-xl normal-case after:absolute after:px-[10px] after:bg-teal-400 after:rounded-full after:text-center after:text-[0.5em] after:right-[20px] after:text-slate-50 after:top-[-10px] after:font-extrabold after:content-['Reason_To_Modify'] after:shadow-xl relative"
        >
          {{
            curr_request?.reason_body
              ? curr_request?.reason_body!.toLowerCase()
              : "'No reason given.'"
          }}
        </h1>

        <h2
          class="text-center bg-gradient-to-br from-indigo-300 to-purple-500 text-[1.5rem] font-bold mt-3 mx-auto text-white px-4 py-2 rounded-xl"
        >
          COMPARE MODIFIED APPLICANT INFORMATION
        </h2>

        <div class="flex gap-3 justify-center">
          <h1
            v-if="getUser4Apl"
            class="text-center bg-gradient-to-br from-indigo-300 to-purple-500 text-[0.8rem] font-bold my-1 text-white px-4 py-2 rounded-xl"
          >
            Applied By: {{ getUser4Apl ? getUser4Apl.username : '' }}
          </h1>
          <h1
            class="text-center bg-gradient-to-br from-indigo-300 to-purple-500 text-[0.8rem] font-bold my-1 text-white px-4 py-2 rounded-xl"
          >
            {{ changeDate(apl!.created_at) }}
          </h1>
        </div>

        <form class="flex flex-col p-1 min-w-full">
          <div
            class="mx-auto text-[1.3em] text-center mt-[70px] my-[30px] bg-indigo-500 px-3 py-1 text-white w-fit rounded-lg"
          >
            Primary Applicant
          </div>
          <div class="w-fit mx-auto rounded-lg">
            <ImageView :url="primeImage" />
          </div>
          <div
            class="grid grid-cols-3 relative mb-[50px] after:absolute after:px-[10px] after:bg-teal-400 after:rounded-full after:text-center after:text-[0.7em] after:left-[40px] after:text-slate-50 after:top-[-3px] after:font-extrabold after:content-['Main_Information'] after:shadow-xl"
          >
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCname"
            >
              <div>
                <label for="ln">Last Name:</label>
                <input
                  required
                  v-model="apl!.plastName"
                  id="ln"
                  name="lastName"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                />
              </div>
              <div>
                <label for="fn">First Name:</label>
                <input
                  required
                  v-model="apl!.pfirstName"
                  id="fn"
                  type="text"
                  name="firstName"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                />
              </div>
              <div>
                <label for="on">Other Name:</label>
                <input
                  required
                  v-model="apl!.potherName"
                  id="on"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  name="otherName"
                />
              </div>
            </div>

            <!-- Modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aCname mb-10"
            >
              <div>
                <label for="ln">Last Name:</label>
                <input
                  required
                  v-model="modified_apl.plastName"
                  id="ln"
                  name="lastName"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                />
              </div>
              <div>
                <label for="fn">First Name:</label>
                <input
                  required
                  v-model="modified_apl.pfirstName"
                  id="fn"
                  type="text"
                  name="firstName"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                />
              </div>
              <div>
                <label for="on">Other Name:</label>
                <input
                  required
                  v-model="modified_apl.potherName"
                  id="on"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  name="otherName"
                />
              </div>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCdob"
            >
              <label>Date of Birth:</label>
              <section>
                <input
                  required
                  v-model="apl!.pdob_day"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="31"
                  maxlength="2"
                />
                <input
                  required
                  v-model="apl!.pdob_month"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="12"
                  maxlength="2"
                />
                <input
                  required
                  v-model="apl!.pdob_year"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1950"
                  max="2004"
                  maxlength="4"
                />
              </section>
            </div>
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
            >
              <label for="gen">Gender:</label>
              <select
                required
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
                v-model="apl!.pgender"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
            >
              <label for="cityb">City of Birth:</label>
              <input
                required
                id="cityb"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                v-model="apl!.pcity_ob"
              />
            </div>

            <!-- modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aCdob mb-10"
            >
              <label>Date of Birth:</label>
              <section>
                <input
                  required
                  v-model="modified_apl.pdob_day"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="31"
                  maxlength="2"
                />
                <input
                  required
                  v-model="modified_apl.pdob_month"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="12"
                  maxlength="2"
                />
                <input
                  required
                  v-model="modified_apl.pdob_year"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1950"
                  max="2004"
                  maxlength="4"
                />
              </section>
            </div>
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center mb-10 shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC"
            >
              <label for="gen">Gender:</label>
              <select
                required
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
                v-model="modified_apl.pgender"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center mb-10 shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC"
            >
              <label for="cityb">City of Birth:</label>
              <input
                required
                id="cityb"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                v-model="modified_apl.pcity_ob"
              />
            </div>

            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] mb-10 m-[10px] border-none rounded-2xl flex text-center aCname aC"
            >
              <label for="em">Confirmation Code:</label>
              <input
                v-model="apl!.pconf_code"
                id="em"
                disabled
                type="text"
                class="bg-white uppercase text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              />
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
            >
              <label for="counb">Country of Birth:</label>
              <select
                required
                id="counb"
                v-model="apl!.pcountry_ob"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
              >
                <Countries />
              </select>

              <!-- <input
                required
                id="counb"
                v-model="apl!.pcountry_ob"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              /> -->
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCem"
            >
              <label for="pn">Phone Number:</label>
              <input
                required
                v-model="apl!.pcontact"
                id="pn"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
            </div>
            <!-- modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC mb-10"
            >
              <label for="counb">Country of Birth:</label>
              <select
                required
                id="counb"
                v-model="modified_apl.pcountry_ob"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
              >
                <Countries />
              </select>

              <!-- <input
                required
                id="counb"
                v-model="modified_apl.pcountry_ob"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              /> -->
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC aCem mb-10"
            >
              <label for="pn">Phone Number:</label>
              <input
                required
                v-model="modified_apl.pcontact"
                id="pn"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
            </div>

            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCem"
            >
              <label for="pn">Next Of Kin Phone Number(s):</label>
              <input
                required
                v-model="apl!.pother_contact"
                id="pn"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
              />
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
            >
              <label for="em">Email:</label>
              <input
                v-model="apl!.pemail"
                id="em"
                type="email"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
            </div>
            <!-- modified section -->
            <div
              class="bg-gradient-to-br from-green-500 to-cyan-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCem mb-10"
            >
              <label for="pn">Next Of Kin Phone Number(s):</label>
              <input
                required
                v-model="modified_apl.pother_contact"
                id="pn"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
              />
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg mb-10 bg-gradient-to-br from-green-500 to-cyan-500 aC"
            >
              <label for="em">Email:</label>
              <input
                v-model="modified_apl.pemail"
                id="em"
                type="email"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCem aC"
            >
              <label class="mb-1" for="em"
                >Passport Number:
                <Tag
                  class="h-4"
                  :value="apl!.passportAvail ? 'Available' : 'Unavailable'"
                  :severity="passportStatusColor"
                ></Tag
              ></label>
              <div class="flex w-full gap-[20px] items-center justify-evenly">
                <ToggleButton
                  v-model="apl!.passportAvail"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  class="h-8 font-Outfit rounded-xl"
                  onLabel="Available"
                  offLabel="Unavailable"
                />

                <input
                  id="em"
                  type="text"
                  v-model="apl!.ppassport_number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold uppercase"
                />
              </div>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCdob"
            >
              <label>Passport Expiration Date:</label>
              <section>
                <input
                  v-model="apl!.passport_ex_day"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="31"
                  maxlength="2"
                />
                <input
                  v-model="apl!.passport_ex_month"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="12"
                  maxlength="2"
                />
                <input
                  v-model="apl!.passport_ex_year"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1950"
                  max="2050"
                  maxlength="4"
                />
              </section>
            </div>
            <!-- modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aCem aC mb-10"
            >
              <label class="mb-1" for="em"
                >Passport Number:
                <Tag
                  class="h-4"
                  :value="
                    modified_apl.passportAvail ? 'Available' : 'Unavailable'
                  "
                  :severity="m_passportStatusColor"
                ></Tag
              ></label>
              <div class="flex w-full gap-[20px] items-center justify-evenly">
                <ToggleButton
                  v-model="modified_apl.passportAvail"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  class="h-8 font-Outfit rounded-xl"
                  onLabel="Available"
                  offLabel="Unavailable"
                />

                <input
                  id="em"
                  type="text"
                  v-model="modified_apl.ppassport_number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold uppercase"
                />
              </div>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aCdob mb-10"
            >
              <label>Passport Expiration Date:</label>
              <section>
                <input
                  v-model="modified_apl.passport_ex_day"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="31"
                  maxlength="2"
                />
                <input
                  v-model="modified_apl.passport_ex_month"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="12"
                  maxlength="2"
                />
                <input
                  v-model="modified_apl.passport_ex_year"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1950"
                  max="2050"
                  maxlength="4"
                />
              </section>
            </div>
          </div>

          <div
            class="grid grid-cols-3 relative after:absolute after:px-[10px] after:bg-teal-400 after:rounded-full after:text-center after:text-[0.7em] after:left-[40px] after:text-slate-50 after:top-[-3px] after:font-extrabold after:content-['More_Information'] after:shadow-xl"
          >
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCem"
            >
              <label for="pa">Postal Address:</label>
              <input
                v-model="apl!.ppostal"
                id="pa"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
            </div>
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
            >
              <label for="cwylt">Country where You live today:</label>
              <select
                required
                id="counb"
                v-model="apl!.pcountry_ob"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
              >
                <Countries />
              </select>

              <!-- <input
                required
                v-model="apl!.pcountry_live_today"
                id="cwylt"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              /> -->
            </div>
            <!-- modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br mb-10 from-green-500 to-cyan-500 aC aCem"
            >
              <label for="pa">Postal Address:</label>
              <input
                v-model="modified_apl.ppostal"
                id="pa"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
            </div>
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 mb-10 to-cyan-500 aC"
            >
              <label for="cwylt">Country where You live today:</label>
              <select
                required
                id="counb"
                v-model="modified_apl.pcountry_live_today"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
              >
                <Countries />
              </select>

              <!-- <input
                required
                v-model="modified_apl.pcountry_live_today"
                id="cwylt"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              /> -->
            </div>
            <!-- . -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCname"
            >
              <div class="flex flex-col w-full items-center">
                <label for="ln">Facebook:</label>
                <input
                  required
                  v-model="apl!.psocial_media.facebook"
                  id="ln"
                  name="facebook"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
                />
              </div>
              <div class="flex flex-col w-full items-center">
                <label for="fn">Instagram:</label>
                <input
                  required
                  v-model="apl!.psocial_media.instagram"
                  id="fn"
                  type="text"
                  name="instagram"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
                />
              </div>
              <div class="flex flex-col w-full items-center">
                <label for="on">Twitter:</label>
                <input
                  required
                  v-model="apl!.psocial_media.twitter"
                  id="on"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
                  name="twitter"
                />
              </div>
            </div>
            <!-- modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aCname mb-10"
            >
              <div class="flex flex-col w-full items-center">
                <label for="ln">Facebook:</label>
                <input
                  required
                  v-model="modified_apl.psocial_media.facebook"
                  id="ln"
                  name="facebook"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
                />
              </div>
              <div class="flex flex-col w-full items-center">
                <label for="fn">Instagram:</label>
                <input
                  required
                  v-model="modified_apl.psocial_media.instagram"
                  id="fn"
                  type="text"
                  name="instagram"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
                />
              </div>
              <div class="flex flex-col w-full items-center">
                <label for="on">Twitter:</label>
                <input
                  required
                  v-model="modified_apl.psocial_media.twitter"
                  id="on"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input uppercase"
                  name="twitter"
                />
              </div>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
            >
              <p>Marital Status:</p>
              <select
                required
                v-model="lowecaseMaritalStatus"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
              >
                <option value="unmarried">Unmarried</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="legally separated">Legally Separated</option>
              </select>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCem"
            >
              <p>Highest Level of Education:</p>
              <select
                required
                v-model="lowecaseLvlOfEdu"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
              >
                <option value="primary school only">Primary School Only</option>
                <option value="high school, no degree">
                  High School, No Degree
                </option>
                <option value="high school degree">High School Degree</option>
                <option value="vocational school">Vocational School</option>
                <option value="some university courses">
                  Some University Courses
                </option>
                <option value="university degree">University Degree</option>
                <option value="some graduate level courses">
                  Some Graduate Level Courses
                </option>
                <option value="masters degree">Master's Degree</option>
                <option value="some doctorate level courses">
                  Some Doctorate Level Courses
                </option>
                <option value="doctorate degree">Doctorate Degree</option>
              </select>
            </div>
            <!-- modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC mb-10"
            >
              <p>Marital Status:</p>
              <select
                required
                v-model="modified_apl.pmarital_status"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
              >
                <option value="unmarried">Unmarried</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="legally separated">Legally Separated</option>
              </select>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC aCem mb-10"
            >
              <p>Highest Level of Education:</p>
              <select
                required
                v-model="modified_apl.peducation_level"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
              >
                <option value="primary school only">Primary School Only</option>
                <option value="high school, no degree">
                  High School, No Degree
                </option>
                <option value="high school degree">High School Degree</option>
                <option value="vocational school">Vocational School</option>
                <option value="some university courses">
                  Some University Courses
                </option>
                <option value="university degree">University Degree</option>
                <option value="some graduate level courses">
                  Some Graduate Level Courses
                </option>
                <option value="masters degree">Master's Degree</option>
                <option value="some doctorate level courses">
                  Some Doctorate Level Courses
                </option>
                <option value="doctorate degree">Doctorate Degree</option>
              </select>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCchild"
            >
              <label for="number-of-children">Number of Children:</label>
              <input
                v-model="apl!.children_number"
                id="number-of-children"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                maxlength="2"
                min="0"
              />
            </div>
            <!-- modified section -->
            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC aCchild mb-10"
            >
              <label for="number-of-children">Number of Children:</label>
              <input
                v-model="modified_apl.children_number"
                id="number-of-children"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                maxlength="2"
                min="0"
              />
            </div>
          </div>

          <div v-if="hasSpouse" class="secondary">
            <div
              class="mx-auto text-[1.3em] text-center mt-[70px] my-[30px] bg-indigo-500 px-3 py-1 text-white w-fit rounded-lg"
            >
              Secondary Applicant
            </div>

            <div class="w-fit mx-auto rounded-lg">
              <ImageView :url="secImage" />
            </div>

            <div
              class="grid grid-cols-3 relative mb-[50px] after:absolute after:px-[10px] after:bg-teal-400 after:rounded-full after:text-center after:text-[0.7em] after:left-[40px] after:text-slate-50 after:top-[-3px] after:font-extrabold after:content-['Main_Information'] after:shadow-xl"
            >
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCname"
              >
                <div>
                  <label for="ln">Last Name:</label>
                  <input
                    v-model="apl!.slastName"
                    required
                    id="ln"
                    name="lastName"
                    type="text"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  />
                </div>
                <div>
                  <label for="fn">First Name:</label>
                  <input
                    v-model="apl!.sfirstName"
                    required
                    id="fn"
                    type="text"
                    name="firstName"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  />
                </div>
                <div>
                  <label for="on">Other Name:</label>
                  <input
                    v-model="apl!.sotherName"
                    id="on"
                    type="text"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    name="otherName"
                  />
                </div>
              </div>

              <!-- modified -->
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aCname mb-10"
              >
                <div>
                  <label for="ln">Last Name:</label>
                  <input
                    v-model="modified_apl.slastName"
                    required
                    id="ln"
                    name="lastName"
                    type="text"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  />
                </div>
                <div>
                  <label for="fn">First Name:</label>
                  <input
                    v-model="modified_apl.sfirstName"
                    required
                    id="fn"
                    type="text"
                    name="firstName"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  />
                </div>
                <div>
                  <label for="on">Other Name:</label>
                  <input
                    v-model="modified_apl.sotherName"
                    id="on"
                    type="text"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    name="otherName"
                  />
                </div>
              </div>

              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCdob"
              >
                <label>Date of Birth:</label>
                <section>
                  <input
                    v-model="apl!.sdob_day"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    max="31"
                    min="1"
                    maxlength="2"
                  />
                  <input
                    v-model="apl!.sdob_month"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    min="1"
                    max="12"
                    maxlength="2"
                  />
                  <input
                    v-model="apl!.sdob_year"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    min="1950"
                    max="2004"
                    maxlength="4"
                  />
                </section>
              </div>
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
              >
                <label for="gen">Gender:</label>
                <!-- <input v-model="sgender" type="text" class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold" /> -->
                <select
                  required
                  class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
                  v-model="apl!.sgender"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
              >
                <label for="cityb">City of Birth:</label>
                <input
                  id="cityb"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  v-model="apl!.scity_ob"
                />
              </div>

              <!-- modified -->
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aCdob mb-10"
              >
                <label>Date of Birth:</label>
                <section>
                  <input
                    v-model="modified_apl.sdob_day"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    max="31"
                    min="1"
                    maxlength="2"
                  />
                  <input
                    v-model="modified_apl.sdob_month"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    min="1"
                    max="12"
                    maxlength="2"
                  />
                  <input
                    v-model="modified_apl.sdob_year"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    min="1950"
                    max="2004"
                    maxlength="4"
                  />
                </section>
              </div>
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC mb-10"
              >
                <label for="gen">Gender:</label>
                <!-- <input v-model="sgender" type="text" class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold" /> -->
                <select
                  required
                  class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
                  v-model="modified_apl.sgender"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div
                class="mb-10 text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC"
              >
                <label for="cityb">City of Birth:</label>
                <input
                  id="cityb"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  v-model="modified_apl.scity_ob"
                />
              </div>

              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCchild"
              >
                <label for="counb">Country of Birth:</label>
                <select
                  required
                  id="counb"
                  v-model="apl!.scountry_ob"
                  class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
                >
                  <Countries />
                </select>

                <!-- <input
                  id="counb"
                  v-model="apl!.scountry_ob"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                /> -->
              </div>

              <!-- modified -->
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-green-500 to-cyan-500 aC aCchild"
              >
                <label for="counb">Country of Birth:</label>
                <select
                  required
                  id="counb"
                  v-model="modified_apl.scountry_ob"
                  class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
                >
                  <Countries />
                </select>

                <!-- <input
                  id="counb"
                  v-model="modified_apl.scountry_ob"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                /> -->
              </div>
            </div>
          </div>

          <div v-if="hasWards" class="wardInfo">
            <WardFormDetails
              v-for="(ward, i) in apl!.wards"
              :index="i"
              :apl="apl"
              :ward="ward"
              :is_request="true"
              @wardData="wardEmitted"
              @wardStateOff="wardRemoved"
            />
          </div>
          <div
            class="flex items-center relative pb-4 w-full justify-center gap-3 px-5 min-h-[100px]"
          >
            <Button
              class="p-button-rounded p-button-help"
              label="Accept"
              icon="pi pi-check"
              @click="handleApprove(curr_request)"
            ></Button
            ><Button
              class="p-button-rounded p-button-danger"
              label="Reject"
              icon="pi pi-times"
              @click="handleReject(curr_request)"
            ></Button>
          </div>
        </form>

        <teleport to="body">
          <Toast />
        </teleport>
      </div>
    </div>
  </div>
</template>
