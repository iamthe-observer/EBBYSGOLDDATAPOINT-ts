<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  ref,
  reactive,
  onBeforeMount,
  computed,
  ComputedRef,
  watchEffect,
} from 'vue';
import { supabase } from '../supabase/supabase';
import { useToast } from 'primevue/usetoast';
import { useApplyImgStore } from '../store/AplImgStore';
import { useProfileStore } from '../store/ProfileStore';
import { useRequestStore } from '../store/RequestStore';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import WardFormDetails from '../components/wardFormDetails.vue';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import Toast from 'primevue/toast';
import SpeedDial from 'primevue/speeddial';
import Avatar from '../components/avatar.vue';
import FileUpload from 'primevue/fileupload';
import InlineMessage from 'primevue/inlinemessage';
import Countries from '../components/countries.vue';
import { _Null } from '../types/types';
import {
  Applicant,
  WardsApplicant,
  ProfileData,
} from '../interfaces/interfaces';
import { storeToRefs } from 'pinia';

const toast = useToast();
const loading = ref(false);
const requestLoading = ref(false);
const route = useRoute();
const id = computed<any>(() => route.params.id);
const { user_profiles } = storeToRefs(useProfileStore());

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
const primePath = computed(() => {
  return apl.aplImg_path.primePath![0];
});
const secPath = computed(() => {
  return apl.aplImg_path.secPath![0];
});
const hasSpouse = ref(false);
const hasWards = ref(false);
const request = ref<_Null<string>>(null);
const requestBody = ref<string | any>('');
const isRequested = ref(false);
const isSavedWardArr = ref<{}[]>([]);
const editedWards = ref<WardsApplicant[]>([]);
const disabled = ref(false);
const editMode = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}

const primeIMG = ref<any>(null);
const ifSavedPrimeMsg = ref(false);
const ifSavedSecMsg = ref(false);
const imgUploading = ref(false);
const primeSRC = ref<string | null>(null);
const secIMG = ref<any>(null);
const secSRC = ref<string | null>(null);

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
// FIXME problem with sending requests
const primeImage = computed(() => {
  if (primeIMG.value) {
    return primeSRC.value;
  } else {
    if (apl.aplImg_path.primePath?.length) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
        apl.aplImg_path.primePath![0]
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
    if (apl.aplImg_path.secPath?.length) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
        apl.aplImg_path.secPath![0]
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
  if (!apl.plastName || !apl.pfirstName) {
    return null;
  } else {
    return `${apl.plastName!.toUpperCase().trim()} ${apl
      .pfirstName!.toUpperCase()
      .trim()}${
      apl.potherName ? ' ' + apl.potherName!.toUpperCase().trim() : ''
    }`;
  }
});

const passportStatusColor = computed(() => {
  if (apl.passportAvail) return 'success';
  return 'danger';
});

const wardEmitted = (e: WardsApplicant) => {
  editedWards.value.push(e);
  isSavedWardArr.value.push({});
};

const wardRemoved = (e: number) => {
  isSavedWardArr.value.pop();
  const wardsRemoved = editedWards.value.filter(ward => ward.index !== e);
  editedWards.value = wardsRemoved;
};

const userOfApl = ref<ProfileData | null | undefined>(null);

const loadApl = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from<Applicant>('applicants')
      .select('*')
      .eq('apl_id', id.value);

    if (error) throw error;
    console.log(data[0]);

    Object.entries(data[0]).forEach(([key, value]) => {
      if (
        key === 'pcountry_ob' ||
        key === 'scountry_ob' ||
        key === 'pcountry_live_today'
      ) {
        if (!apl[key]) return;
        apl[key] = useRequestStore().capitalizeFirstLetter(value);
      }

      if (
        key === 'peducation_level' ||
        key === 'pgender' ||
        key === 'sgender' ||
        key === 'pmarital_status'
      ) {
        if (!apl[key]) return;
        apl[key] = value!.toLowerCase();
      }

      if (key === 'wards') {
        data[0][key].forEach(ward => {
          {
            Object.entries(ward).forEach(([key, value]) => {
              if (key === 'wcountry_ob') {
                if (!ward[key]) return;
                ward[key] = useRequestStore().capitalizeFirstLetter(value);
              }
            });
          }
        });
      }
    });

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

    // let user = user_profiles.value!.filter(user => user.id === apl.user_id);
    let users = await useProfileStore().getUserProfileByUserId(apl.user_id);
    userOfApl.value = users?.data![0];

    loading.value = false;
  } catch (err: any) {
    console.log(err.message);
    loading.value = false;
    showErrorOnload(err.message);
  }
};

const showErrorOnload = (errorMsg: string) => {
  toast.add({
    severity: 'danger',
    summary: `Failed to load resource.`,
    detail: `${errorMsg}.`,
    life: 6000,
  });
};

onBeforeMount(() => {
  loadApl();
});

const options: { [key: string]: string } = {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const changeDate = (date: Date) => {
  const day = new Date(date).toLocaleDateString('en-us', options);
  return day;
};

const sendRequest = async () => {
  if (request.value == 'edit') {
    try {
      requestLoading.value = true;
      const { data, error } = await supabase.from('requests').insert([
        {
          reason_body: requestBody.value,
          apl_id: apl.apl_id,
          user_id: supabase.auth.user()!.id,
          modify_type: request.value,
          modify_apl: {
            created_at: apl.created_at,
            apl_id: apl.apl_id,
            plastName: apl.plastName,
            pfirstName: apl.pfirstName,
            potherName: apl.potherName,
            pdob_day: apl.pdob_day,
            pdob_month: apl.pdob_month,
            pdob_year: apl.pdob_year,
            pcity_ob: apl.pcity_ob,
            pcountry_ob: apl.pcountry_ob,
            pgender: apl.pgender,
            pconf_code: apl.pconf_code,
            pemail: apl.pemail,
            ppassport_number: apl.ppassport_number,
            passport_ex_day: apl.passport_ex_day,
            passport_ex_month: apl.passport_ex_month,
            passport_ex_year: apl.passport_ex_year,
            pcountry_live_today: apl.pcountry_live_today,
            peducation_level: apl.peducation_level,
            ppostal: apl.ppostal,
            pmarital_status: apl.pmarital_status,
            children_number: apl.children_number,
            fullName: full.value,
            user_id: apl.user_id,
            pcontact: apl.pcontact,
            slastName: apl.slastName,
            sfirstName: apl.sfirstName,
            sotherName: apl.sotherName,
            scity_ob: apl.scity_ob,
            scountry_ob: apl.scountry_ob,
            sgender: apl.sgender,
            wards: apl.wards,
            sdob_day: apl.sdob_day,
            sdob_month: apl.sdob_month,
            sdob_year: apl.sdob_year,
            totalPayment: apl.totalPayment,
            passportAvail: apl.passportAvail,
            created_at_date: apl.created_at_date,
            pother_contact: apl.pother_contact,
            psocial_media: apl.psocial_media,
            aplImg_path: apl.aplImg_path,
          },
        },
      ]);
      if (error) throw error;
      requestLoading.value = false;
      isRequested.value = false;
      showSuccessRequest();
    } catch (err) {
      console.log(err);
      requestLoading.value = false;
      showErrorRequest();
    }
  } else {
    try {
      requestLoading.value = true;
      const { data, error } = await supabase.from('requests').insert([
        {
          reason_body: requestBody.value,
          apl_id: id.value,
          user_id: supabase.auth.user()!.id,
          modify_type: request.value,
          modify_apl: {
            aplImg_path: {
              primePath: apl.aplImg_path.primePath,
            },
            fullName: apl.fullName,
            pfirstName: apl.pfirstName?.toUpperCase(),
          },
        },
      ]);
      if (error) throw error;
      requestLoading.value = false;
      isRequested.value = false;
      showSuccessRequest();
    } catch (err) {
      requestLoading.value = false;
      console.log(err);
      showErrorRequest();
    }
  }
};

const openModal = (e: 'edit' | 'delete') => {
  isRequested.value = true;
  if (e == 'edit') {
    request.value = 'edit';
  } else {
    request.value = 'delete';
  }
};

const isSavedWard = computed(() => {
  if (
    isSavedWardArr.value.length === Number(apl.children_number) &&
    apl.plastName!.trim() !== '' &&
    apl.pfirstName!.trim() !== ''
  ) {
    return true;
  } else {
    return false;
  }
});

const showSuccessRequest = () => {
  toast.add({
    severity: 'success',
    summary: `${request.value} request success.`,
    detail: `Your ${request.value} request has been sent! Please contact supervisor to review and approve your request.`,
    life: 4000,
  });
};

const showErrorRequest = () => {
  toast.add({
    severity: 'error',
    summary: `${request.value} request failed.`,
    detail: `Your ${request.value} request has not been sent! Please check for internet connectivity issues.`,
    life: 4000,
  });
};

const items = [
  {
    label: 'Request Edit',
    icon: 'pi pi-user-edit',
    command() {
      openModal('edit');
    },
  },
  {
    label: 'Request Delete',
    icon: 'pi pi-trash',
    command() {
      openModal('delete');
    },
  },
  {
    label: 'Edit Confirmation Code',
    icon: 'pi pi-key',
    command() {
      openConfModal();
    },
  },
];

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
  life = 4000
) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: life,
  });
};

const isConf_code = ref(false);
const newConf_code = ref<string | null>(null);
const confloading = ref(false);
const openConfModal = () => {
  isConf_code.value = !isConf_code.value;
};

const getConf_code = async () => {
  try {
    const { data, error } = await supabase
      .from('applicants')
      .select('pconf_code')
      .eq('apl_id', id.value);
    if (error) throw error;
    apl.pconf_code = data[0].pconf_code;
  } catch (error) {
    console.log(error);
  }
};

const sendConf_code = async () => {
  confloading.value = true;
  try {
    const { data, error } = await supabase
      .from('applicants')
      .update({
        pconf_code: newConf_code.value,
      })
      .eq('apl_id', id.value);

    if (error) throw error;
  } catch (error: any) {
    confloading.value = false;
    showErrorConf();
    console.log(error.message);
  } finally {
    confloading.value = false;
    isConf_code.value = false;
    getConf_code();
    showSuccessConf();
  }
};

let imageUpdateLoading = ref(false);

async function handleAplImgUpdate(
  id: string | null | undefined,
  path: string | undefined,
  type: string,
  file: any
) {
  imageUpdateLoading.value = true;
  if (!path) {
    const newPath = await useApplyImgStore().uploadAplImg(id, file);
    console.log(newPath);
    await useApplyImgStore().updateAplPath(
      apl.aplImg_path,
      newPath,
      apl.apl_id,
      type
    );

    loadApl();
  } else {
    await useApplyImgStore().updateSingleAplImg(path);
  }
  imageUpdateLoading.value = false;
  ifSavedPrimeMsg.value = false;
  ifSavedSecMsg.value = false;

  showToast('success', `${type} Applicant Image Updated`, '');
  useApplyImgStore().resetFiles();
}

// error
// const getUser4Apl = computed(() => {
//   let user = user_profiles.value!.filter(user => user.id === apl.user_id);
//   return user[0];
// });

// watchEffect(() => {
//   console.log(getUser4Apl.value);
// });
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
        class="flex flex-col gap-[30px] min-w-full flex-1 min-h-full rounded-2xl p-[20px]"
      >
        <h1
          class="text-center bg-gradient-to-br from-indigo-300 to-purple-500 text-[1.5rem] font-bold mt-10 mx-auto text-white px-4 py-2 rounded-xl"
        >
          APPLICANT INFORMATION
        </h1>

        <div class="flex gap-3 justify-center">
          <h1
            v-if="userOfApl"
            class="text-center bg-gradient-to-br from-indigo-300 to-purple-500 text-[0.8rem] font-bold my-1 text-white px-4 py-2 rounded-xl"
          >
            Applied By: {{ userOfApl ? userOfApl.username : '' }}
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
            <Avatar
              class="my-3 mb-0"
              :editMode="editMode"
              :uploading="imgUploading"
              :url="primeImage"
              @edit="toggleEditMode"
            >
              <template #uploadFile>
                <div class="w-fit mx-auto flex flex-col gap-2 items-center">
                  <FileUpload
                    v-if="editMode"
                    :customUpload="true"
                    mode="basic"
                    accept="image/*"
                    @select="onSelectPrime"
                    @uploader="e => saveImgFiles(e, 'prime')"
                    :disabled="disabled"
                  />
                  <Button
                    v-if="ifSavedPrimeMsg"
                    class="p-button bg-indigo-500 self-center"
                    icon="pi
                        pi-upload"
                    @click="
                      handleAplImgUpdate(
                        apl?.apl_id,
                        primePath,
                        'Primary',
                        primeIMG
                      )
                    "
                    label="Update Image"
                    :loading="imageUpdateLoading"
                  />
                  <InlineMessage
                    v-if="!ifSavedPrimeMsg && editMode"
                    severity="info"
                    >Image is not saved until clicked
                    <i class="pi pi-arrow-up"></i
                  ></InlineMessage>
                  <InlineMessage v-if="ifSavedPrimeMsg" severity="success"
                    >Saved Image!</InlineMessage
                  >
                </div>
              </template>
            </Avatar>
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
            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCname aC"
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
                v-model="apl!.pcountry_live_today"
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

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC"
            >
              <p>Marital Status:</p>
              <select
                required
                v-model="apl!.pmarital_status"
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
                v-model="apl!.peducation_level"
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
          </div>

          <div v-if="hasSpouse" class="secondary">
            <div
              class="mx-auto text-[1.3em] text-center mt-[70px] my-[30px] bg-indigo-500 px-3 py-1 text-white w-fit rounded-lg"
            >
              Secondary Applicant
            </div>

            <!-- <div class="w-fit mx-auto rounded-lg">
              <ImageView :url="secPath ? secPath : ''" />
            </div> -->
            <div class="w-fit mx-auto">
              <Avatar
                class="my-3 mb-0"
                :editMode="editMode"
                :uploading="imgUploading"
                :url="secImage"
                @edit="toggleEditMode"
              >
                <template #uploadFile>
                  <div class="w-fit mx-auto flex flex-col items-center gap-2">
                    <FileUpload
                      v-if="editMode"
                      :customUpload="true"
                      mode="basic"
                      accept="image/*"
                      @select="onSelectSec"
                      @uploader="e => saveImgFiles(e, 'sec')"
                      :disabled="disabled"
                    />
                    <Button
                      v-if="ifSavedSecMsg"
                      class="p-button bg-indigo-500 self-center"
                      icon="pi
                        pi-upload"
                      @click="
                        handleAplImgUpdate(
                          apl?.apl_id,
                          secPath,
                          'Secondary',
                          secIMG
                        )
                      "
                      label="Update Image"
                      :loading="imageUpdateLoading"
                    />
                    <InlineMessage
                      v-if="!ifSavedSecMsg && editMode"
                      severity="info"
                      >Image is not saved until clicked
                      <i class="pi pi-arrow-up"></i
                    ></InlineMessage>
                    <InlineMessage v-if="ifSavedSecMsg" severity="success"
                      >Saved Image!</InlineMessage
                    >
                  </div>
                </template>
              </Avatar>
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
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold uppercase"
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
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold uppercase"
                  />
                </div>
                <div>
                  <label for="on">Other Name:</label>
                  <input
                    v-model="apl!.sotherName"
                    id="on"
                    type="text"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold uppercase"
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
            </div>
          </div>

          <div v-if="hasWards" class="wardInfo">
            <WardFormDetails
              v-for="(ward, i) in apl!.wards"
              :index="i"
              :ward="ward"
              :apl="apl"
              :is_request="false"
              @wardData="wardEmitted"
              @wardStateOff="wardRemoved"
            />
          </div>
          <div
            class="flex items-center relative pb-4 w-full justify-end px-5 min-h-[100px]"
          >
            <!-- <gradient-button @click.prevent="e => openModal(e)"
              >REQUEST EDIT</gradient-button
            >
            <gradient-button @click.prevent="e => openModal(e)"
              >REQUEST DELETE</gradient-button
            > -->
            <SpeedDial
              :model="items"
              type="linear"
              direction="left"
              :radius="70"
              :transitionDelay="80"
              showIcon="pi pi-bars"
              hideIcon="pi pi-times"
              buttonClass="p-button-help"
              :tooltipOptions="{ position: 'top', event: 'hover' }"
            />
          </div>
        </form>

        <teleport to="body">
          <Dialog
            :modal="true"
            :visible="isRequested"
            class="font-Outfit"
            :style="{ width: '60%' }"
            :closable="false"
            :maximizable="true"
          >
            <template #header>
              <div class="flex gap-2 relative">
                <span
                  class="relative font-bold text-3xl bg-purple-500 px-4 py-2 rounded-full text-white"
                  >Applicant {{ request!.toUpperCase() }} Request</span
                >
              </div>
            </template>
            <div class="flex flex-col justify-center w-full mt-[32px]">
              <span v-if="hasWards" class="text-gray-300 w-full text-center"
                >Save Child information before sending request...</span
              >
              <textarea
                v-model="requestBody"
                class="w-4/5 min-h-[2ch] rounded-xl font-Outfit outline p-2 bg-[rgb(240,240,240)] outline-2 focus:outline-4 outline-purple-600 transition-all duration-150 ease-out focus:outline-offset-2 mx-auto"
                placeholder="Tell us your reasons for modifying this applicant information..."
              ></textarea>
            </div>
            <template #footer>
              <Button
                @click="isRequested = !isRequested"
                icon="pi pi-times"
                label="Close"
                class="h-10 rounded-full p-button-danger"
              />
              <Button
                v-if="!isSavedWard"
                :disabled="disabled"
                label="Submit"
                icon="pi pi-check"
                class="h-10 p-button-rounded bg-purple-500"
              />
              <Button
                v-else
                label="Submit"
                icon="pi pi-check"
                class="h-10 p-button-rounded bg-purple-500"
                @click="sendRequest"
                :loading="requestLoading"
              />
            </template>
          </Dialog>

          <Dialog
            :modal="true"
            :visible="isConf_code"
            class="font-Outfit"
            :style="{ width: '60%' }"
            :closable="false"
            :maximizable="false"
          >
            <template #header>
              <div class="flex gap-2 relative">
                <span
                  class="font-bold text-3xl bg-purple-500 px-4 py-2 rounded-full text-white"
                  >Edit Confirmation Code</span
                >
              </div>
            </template>
            <div class="flex justify-center w-full mt-[32px]">
              <input
                type="text"
                v-model="newConf_code"
                class="w-2/3 bg-white rounded-xl outline outline-2 outline-gray-600 uppercase text-center py-2 px-3 font-bold text-2xl"
              />
            </div>
            <template #footer>
              <Button
                @click="isConf_code = !isConf_code"
                icon="pi pi-times"
                label="Close"
                class="h-10 rounded-full p-button-danger"
              />
              <Button
                label="Submit"
                icon="pi pi-check"
                class="h-10 p-button-rounded bg-purple-500"
                @click="sendConf_code"
                :loading="confloading"
              />
            </template>
          </Dialog>
          <Toast />
        </teleport>
      </div>
    </div>
  </div>
</template>
