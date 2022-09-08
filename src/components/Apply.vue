<script setup lang="ts">
import {
  ref,
  ComputedRef,
  provide,
  computed,
  watchEffect,
  reactive,
  onMounted,
  Ref,
} from 'vue';
import WardForm from './wardForm.vue';
import Dialog from 'primevue/dialog';
import gradientButton from '../components/gradientButton.vue';
import { supabase } from '../supabase/supabase';
import { useDashStore } from '../store/dashboardStore';
import Avatar from './avatar.vue';
import FileUpload from 'primevue/fileupload';
import { useApplyImgStore } from '../store/aplImgStore';
import { v4 as uuidv4 } from 'uuid';
import { storeToRefs } from 'pinia';
import ToggleButton from 'primevue/togglebutton';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import InlineMessage from 'primevue/inlinemessage';
import Button from 'primevue/button';
import Countries from './countries.vue';
import { Applicant } from '../interfaces/interfaces';
import { _Null } from '../types/types';
import { required, email } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

const PRICE_PER_APL: number = 20;
const PRICE_PER_WARD: number = 20;

const totalPayment: ComputedRef<number> = computed(() => {
  if (!hasSpouse.value && !hasWard.value) {
    return PRICE_PER_APL;
  } else if (hasSpouse.value && !hasWard.value) {
    return PRICE_PER_APL * 2;
  } else if (!hasSpouse.value && hasWard.value) {
    return PRICE_PER_APL + PRICE_PER_WARD * apl.children_number;
  } else {
    return PRICE_PER_APL * 2 + PRICE_PER_WARD * apl.children_number;
  }
});

const apl = reactive<Applicant>({
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

const rules = computed(() => {
  return {
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
  };
});

const toast = useToast();

const full: ComputedRef<string | undefined> = computed(() => {
  if (apl.plastName || apl.pfirstName) {
    return `${apl.plastName!.toUpperCase().trim()} ${apl
      .pfirstName!.toUpperCase()
      .trim()}${
      apl.potherName ? ' ' + apl.potherName!.toUpperCase().trim() : ''
    }`;
  }
});

onMounted(() => {
  useApplyImgStore().resetFiles();
});

const apply: Ref<HTMLDivElement | null> = ref(null);
const loading = ref(false);
const imgUploading = ref(false);
const { hasFiles } = storeToRefs(useApplyImgStore());
const editMode = ref(false);
const showPrice = ref(false);
const disabled = ref(false);
const secDisabled = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}

provide('editMode', { editMode, toggleEditMode });
provide('disabled', disabled);

const primeIMG = ref(null);
const primeSRC = ref(null);
const secIMG = ref(null);
const secSRC = ref(null);
const discountAmount = ref(null);

const ifSavedPrimeMsg = ref(false);
const ifSavedSecMsg = ref(false);
const discounted = ref(false);
const hasSaved = ref(false);
const isRender = ref(false);
const readySend = ref(false);

const wardNumberArr: any = ref([]);
const isSavedWardArr: any = ref([]);

const hasWard = computed(() => {
  if (apl.children_number > 0) {
    return true;
  } else {
    return false;
  }
});
const hasSpouse = computed(() => {
  if (apl.pmarital_status === 'married') {
    return true;
  } else {
    secIMG.value = null;
    secSRC.value = null;
    ifSavedSecMsg.value = false;
    useApplyImgStore().removeFile();
    return false;
  }
});

const validForDiscount = computed(() => {
  if (apl.children_number >= 4 && hasSpouse.value) {
    return true;
  } else {
    return false;
  }
});

const isSavedWard = computed(() => {
  if (
    isSavedWardArr.value.length == apl.children_number ||
    !apl.children_number
  ) {
    return true;
  } else {
    return false;
  }
});

const applyVerification = computed(() => {
  if (
    isSavedWard.value &&
    apl.plastName != null &&
    apl.pfirstName != null &&
    apl.pcontact != null &&
    apl.pother_contact != null
  ) {
    // && hasFiles.value
    return true;
  } else {
    return false;
  }
});

const wardEmitted = (e: {
  wlastName: _Null<string>;
  wfirstName: _Null<string>;
  wotherName: _Null<string>;
  wdob_day: _Null<number>;
  wdob_month: _Null<number>;
  wdob_year: _Null<number>;
  wgender: _Null<string>;
  wcity_ob: _Null<string>;
  wcountry_ob: _Null<string>;
  index: number;
}) => {
  apl.wards.push(e);
  isSavedWardArr.value.push({});
};

const wardRemoved = (e: number) => {
  isSavedWardArr.value.pop();
  const wardsRemoved = apl.wards.filter(ward => ward.index !== e);
  apl.wards = wardsRemoved;
};

watchEffect(() => {
  if (apl.children_number) {
    wardNumberArr.value = [];
    for (let i = 0; i < apl.children_number; i++) {
      wardNumberArr.value.push(i);
    }
  } else {
    wardNumberArr.value.slice(-1);
  }
});

const renderApl = () => {
  disabled.value = true;
  secDisabled.value = true;

  editMode.value = false;
  showPrice.value = true;
  apply.value!.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  console.log(apl);

  isRender.value = !isRender.value;
  readySend.value = !readySend.value;
  const applyInput = document.getElementsByClassName(
    'apply-input'
  ) as HTMLCollectionOf<HTMLInputElement>;
  const select = document.getElementsByClassName('sel') as HTMLSelectElement;

  for (let i = 0; i < applyInput.length; i++) {
    const input = applyInput[i];

    input.classList.add('inputless');
    input.classList.remove('text-xl');
    input.classList.add('text-md');
    input.disabled = !input.disabled;
  }
  for (let i = 0; i < select.length; i++) {
    const input = select[i];

    input.classList.add('inputless');
    input.classList.add('text-xl');
    input.classList.remove('text-md');
    input.disabled = !input.disabled;
  }
};

const cancelRender = () => {
  disabled.value = false;
  secDisabled.value = false;

  showPrice.value = false;
  isRender.value = !isRender.value;
  readySend.value = !readySend.value;
  apl.wards = [];
  isSavedWardArr.value = [];
  const applyInput = document.getElementsByClassName(
    'apply-input'
  ) as HTMLCollectionOf<HTMLInputElement>;
  const select = document.getElementsByClassName('sel') as HTMLSelectElement;

  for (let i = 0; i < applyInput.length; i++) {
    const input = applyInput[i];

    input.classList.remove('inputless');
    input.classList.add('text-md');
    input.classList.remove('text-xl');
    input.disabled = !input.disabled;
  }
  for (let i = 0; i < select.length; i++) {
    const input = select[i];

    input.classList.remove('inputless');
    input.classList.add('text-md');
    input.classList.remove('text-xl');
    input.disabled = !input.disabled;
  }
};

let placeholderActive = ref(false);

// TODO use vulidate to validate apply form

const applyApl = async () => {
  let apl_id = uuidv4();
  loading.value = true;
  try {
    if (hasFiles.value) {
      apl.aplImg_path = await useApplyImgStore().uploadFiles(apl_id);
    }
    // const { data, error } = await supabase.from('applicants').upsert([apl]);
    const { data, error } = await supabase
      .from<Applicant>('applicants')
      .upsert([
        {
          created_at_date: new Date().toLocaleString().split(',')[0],
          passportAvail: apl.passportAvail,
          aplImg_path: placeholderActive.value
            ? { primePath: ['avatar.svg'], secPath: [], wardsPath: [] }
            : apl.aplImg_path,
          apl_id,
          fullName: full.value,
          plastName: apl.plastName?.toUpperCase().trim(),
          pfirstName: apl.pfirstName?.toUpperCase().trim(),
          potherName: apl.potherName?.toUpperCase().trim(),
          pdob_day: apl.pdob_day,
          pdob_month: apl.pdob_month,
          pdob_year: apl.pdob_year,
          ppassport_number: apl.ppassport_number,
          passport_ex_day: apl.passport_ex_day,
          passport_ex_month: apl.passport_ex_month,
          passport_ex_year: apl.passport_ex_year,
          pgender: apl.pgender,
          pcity_ob: apl.pcity_ob,
          pconf_code: apl.pconf_code,
          pcountry_ob: apl.pcountry_ob,
          pemail: apl.pemail,
          pcountry_live_today: apl.pcountry_live_today,
          peducation_level: apl.peducation_level,
          pcontact: apl.pcontact,
          pother_contact: apl.pother_contact,
          ppostal: apl.ppostal,
          pmarital_status: apl.pmarital_status,
          children_number: apl.children_number,
          wards: apl.wards,
          psocial_media: apl.psocial_media,

          slastName: apl.slastName,
          sfirstName: apl.sfirstName,
          sotherName: apl.sotherName,
          sdob_day: apl.sdob_day,
          sdob_month: apl.sdob_month,
          sdob_year: apl.sdob_year,
          sgender: apl.sgender,
          scity_ob: apl.scity_ob,
          scountry_ob: apl.scountry_ob,
          totalPayment: totalPayment.value,
          user_id: supabase.auth.user()!.id,
        },
      ]);

    if (!data) throw error;
    console.log(apl);

    hasSaved.value = true;
    useDashStore().getApls();
    loading.value = false;
    setTimeout(() => {
      hasSaved.value = false;
      apply.value!.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 1700);

    apl.passportAvail = false;
    apl.plastName = null;
    apl.pfirstName = null;
    apl.potherName = null;
    apl.pdob_day = null;
    apl.pdob_month = null;
    apl.pdob_year = null;
    apl.ppassport_number = null;
    apl.passport_ex_day = null;
    apl.passport_ex_month = null;
    apl.passport_ex_year = null;
    apl.pgender = null;
    apl.pcity_ob = null;
    apl.pconf_code = null;
    apl.pcountry_ob = null;
    apl.pemail = null;
    apl.pcountry_live_today = null;
    apl.peducation_level = null;
    apl.pcontact = null;
    apl.pother_contact = null;
    apl.ppostal = null;
    apl.pmarital_status = 'unmarried';
    apl.children_number = 0;
    apl.wards = [];
    apl.psocial_media = {
      facebook: null,
      twitter: null,
      instagram: null,
    };

    apl.slastName = null;
    apl.sfirstName = null;
    apl.sotherName = null;
    apl.sdob_day = null;
    apl.sdob_month = null;
    apl.sdob_year = null;
    apl.sgender = null;
    apl.scity_ob = null;
    apl.scountry_ob = null;
    apl.fullName = null;

    primeIMG.value = null;
    primeSRC.value = null;
    ifSavedPrimeMsg.value = false;
    secSRC.value = null;
    secIMG.value = null;
    ifSavedSecMsg.value = false;

    useApplyImgStore().resetFiles();
  } catch (err) {
    loading.value = false;
    console.log(err);
    showErrorApply();
  } finally {
    cancelRender();
    loading.value = false;
  }
};

const showErrorApply = () => {
  toast.add({
    severity: 'error',
    summary: `Applicant Application failed.`,
    detail: `Your application request has not been sent! Please check for internet connectivity issues.`,
    life: 4000,
  });
};

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

const saveImgFiles = (e: any, type: string) => {
  useApplyImgStore().setFiles(e.files[0], type);
  toggleEditMode();
  if (type == 'prime') {
    ifSavedPrimeMsg.value = true;
  } else {
    ifSavedSecMsg.value = true;
  }
};
</script>

<template>
  <div
    ref="apply"
    class="flex-1 rounded-3xl p-5 shadow-2xl bg-gray-50 overflow-y-scroll font-Outfit font-bold"
  >
    <Toast />
    <div
      class="flex flex-col gap-[30px] min-w-full flex-1 min-h-full rounded-2xl py-[20px]"
    >
      <h1 class="flex text-center items-center gap-5 text-[2.5rem] mx-auto">
        Applicant Entry
        <div class="w-[0.8em] aspect-square">
          <img src="../assets/icons/input.png" />
        </div>
      </h1>

      <div
        class="mx-auto text-[1.3em] text-center rounded-lg bg-indigo-500 py-1 px-4 text-white"
      >
        Primary Applicant
      </div>

      <!-- <form @submit.prevent="applyApl" class="apply-form"> -->
      <form class="flex flex-col min-w-full">
        <div class="w-fit mx-auto rounded-lg">
          <Avatar
            class="my-3 mb-0"
            :editMode="editMode"
            :uploading="imgUploading"
            :url="primeSRC"
            @edit="toggleEditMode"
          >
            <!-- after:content-['!'] after:top-[5px] after:right-[5px] after:rounded-full after:bg-red-500 after:text-white relative after:absolute after:p-2 after:font-bold after:text-xl after:flex after:justify-center after:items-center after:h-[20px] after:w-[20px] -->
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
                <InlineMessage v-if="primeIMG && editMode" severity="info"
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
            class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCname after:content-['!'] after:top-[5px] after:right-[5px] after:rounded-full after:bg-red-500 after:text-white relative after:absolute after:p-2 after:font-bold after:text-xl after:flex after:justify-center after:items-center after:h-[20px] after:w-[20px]"
          >
            <div>
              <label for="ln">Last Name:</label>
              <input
                required
                v-model="apl.plastName"
                id="ln"
                name="lastName"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              />
            </div>
            <div>
              <label for="fn">First Name:</label>
              <input
                required
                v-model="apl.pfirstName"
                id="fn"
                type="text"
                name="firstName"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              />
            </div>
            <div>
              <label for="on">Other Name:</label>
              <input
                required
                v-model="apl.potherName"
                id="on"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
                name="otherName"
              />
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[10px] m-[10px] border-none rounded-2xl flex flex-col justify-center gap-2 text-center aC aCdob"
          >
            <label>Date of Birth:</label>
            <!-- <input type="date" v-model="pdob" class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input" /> -->

            <section>
              <input
                required
                v-model="apl.pdob_day"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center"
                min="1"
                max="31"
                placeholder="DD"
                maxlength="2"
              />
              <input
                required
                v-model="apl.pdob_month"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center"
                min="1"
                max="12"
                placeholder="MM"
                maxlength="2"
              />
              <input
                required
                v-model="apl.pdob_year"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center"
                min="1950"
                max="2004"
                placeholder="YY"
                maxlength="4"
              />
            </section>
          </div>
          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
          >
            <label for="gen">Gender:</label>
            <select
              required
              class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
              v-model="apl.pgender"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
          >
            <label for="cityb">City of Birth:</label>
            <input
              required
              id="cityb"
              type="text"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              v-model="apl.pcity_ob"
            />
          </div>
          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCname aC"
          >
            <label for="em">Confirmation Code:</label>
            <input
              v-model="apl.pconf_code"
              id="em"
              type="text"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
            />
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
          >
            <label for="counb">Country of Birth:</label>
            <select
              required
              v-model="apl.pcountry_ob"
              class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
            >
              <Countries />
            </select>
            <!-- <input
              required
              id="counb"
              v-model="pcountry_ob"
              type="text"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
            /> -->
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCem after:content-['!'] after:top-[5px] after:right-[5px] after:rounded-full after:bg-red-500 after:text-white relative after:absolute after:p-2 after:font-bold after:text-xl after:flex after:justify-center after:items-center after:h-[20px] after:w-[20px]"
          >
            <label for="pn">Phone Number:</label>
            <input
              required
              v-model="apl.pcontact"
              id="pn"
              type="text"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
            />
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCem after:content-['!'] after:top-[5px] after:right-[5px] after:rounded-full after:bg-red-500 after:text-white relative after:absolute after:p-2 after:font-bold after:text-xl after:flex after:justify-center after:items-center after:h-[20px] after:w-[20px]"
          >
            <label for="pn">Next Of Kin Phone Number(s):</label>
            <input
              required
              v-model="apl.pother_contact"
              id="pn"
              type="text"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
            />
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
          >
            <label for="em">Email:</label>
            <input
              v-model="apl.pemail"
              id="em"
              type="email"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
            />
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCem aC"
          >
            <label for="em">Passport Number:</label>

            <div class="flex w-full gap-[20px] items-center justify-evenly">
              <ToggleButton
                v-model="apl.passportAvail"
                onIcon="pi pi-check"
                offIcon="pi pi-times"
                class="h-8 font-Outfit rounded-xl"
                onLabel="Available"
                offLabel="Unavailable"
              />
              <input
                id="em"
                type="text"
                v-model="apl.ppassport_number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              />
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[10px] m-[10px] border-none rounded-2xl flex flex-col justify-center gap-2 text-center aC aCdob"
          >
            <label>Passport Expiration Date:</label>
            <section>
              <input
                v-model="apl.passport_ex_day"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center"
                min="1"
                max="31"
                placeholder="DD"
                maxlength="2"
              />
              <input
                v-model="apl.passport_ex_month"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center"
                min="1"
                max="12"
                placeholder="MM"
                maxlength="2"
              />
              <input
                v-model="apl.passport_ex_year"
                type="number"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center"
                min="1950"
                max="2050"
                placeholder="YY"
                maxlength="4"
              />
            </section>
          </div>
        </div>

        <div
          class="grid grid-cols-3 relative after:absolute after:px-[10px] after:bg-teal-400 after:rounded-full after:text-center after:text-[0.7em] after:left-[40px] after:text-slate-50 after:top-[-3px] after:font-extrabold after:content-['More_Information'] after:shadow-xl"
        >
          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCem"
          >
            <label for="pa">Postal Address:</label>
            <input
              v-model="apl.ppostal"
              id="pa"
              type="text"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
            />
          </div>
          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
          >
            <label for="cwylt">Country where You live today:</label>
            <!-- <input
              required
              v-model="country_live_today"
              id="cwylt"
              type="text"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
            /> -->
            <select
              required
              v-model="apl.pcountry_live_today"
              class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
            >
              <Countries />
            </select>
          </div>

          <div
            class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aCname"
          >
            <div class="flex flex-col w-full items-center">
              <label for="ln">Facebook:</label>
              <input
                required
                v-model="apl.psocial_media.facebook"
                id="ln"
                name="facebook"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              />
            </div>
            <div class="flex flex-col w-full items-center">
              <label for="fn">Instagram:</label>
              <input
                required
                v-model="apl.psocial_media.instagram"
                id="fn"
                type="text"
                name="instagram"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              />
            </div>
            <div class="flex flex-col w-full items-center">
              <label for="on">Twitter:</label>
              <input
                required
                v-model="apl.psocial_media.twitter"
                id="on"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
                name="twitter"
              />
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
          >
            <p>Marital Status:</p>
            <select
              required
              v-model="apl.pmarital_status"
              class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
            >
              <option value="unmarried">Unmarried</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="legally separated">Legally Separated</option>
            </select>
          </div>

          <div
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCem"
          >
            <p>Highest Level of Education:</p>
            <select
              required
              v-model="apl.peducation_level"
              class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
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
            class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCchild"
          >
            <label for="number-of-children">Number of Children:</label>
            <!-- <input
              v-model="children_number"
              id="number-of-children"
              type="number"
              class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              maxlength="2"
              min="0"
              max="10"
            /> -->
            <select
              required
              v-model="apl.children_number"
              class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
            >
              <option selected value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>

        <div v-if="hasSpouse" class="secondary">
          <div
            class="mx-auto text-[1.3em] text-center mt-[70px] my-[30px] bg-indigo-500 px-3 py-1 w-fit rounded-lg text-white"
          >
            Secondary Applicant
          </div>

          <div class="w-fit mx-auto">
            <Avatar
              class="my-3 mb-0"
              :editMode="editMode"
              :uploading="imgUploading"
              :url="secSRC"
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
                  <InlineMessage v-if="secIMG && editMode" severity="info"
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
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCname"
            >
              <div>
                <label for="ln">Last Name:</label>
                <input
                  v-model="apl.slastName"
                  required
                  id="ln"
                  name="lastName"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
                />
              </div>
              <div>
                <label for="fn">First Name:</label>
                <input
                  v-model="apl.sfirstName"
                  required
                  id="fn"
                  type="text"
                  name="firstName"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
                />
              </div>
              <div>
                <label for="on">Other Name:</label>
                <input
                  v-model="apl.sotherName"
                  id="on"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
                  name="otherName"
                />
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[10px] m-[10px] border-none rounded-2xl flex flex-col justify-center gap-2 text-center aC aCdob"
            >
              <label>Date of Birth:</label>

              <section>
                <input
                  v-model="apl.sdob_day"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center tooltip tooltip-bottom"
                  max="31"
                  min="1"
                  data-tip="day"
                  maxlength="2"
                  placeholder="DD"
                />
                <input
                  v-model="apl.sdob_month"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center tooltip tooltip-bottom"
                  min="1"
                  max="12"
                  data-tip="month"
                  maxlength="2"
                  placeholder="MM"
                />
                <input
                  v-model="apl.sdob_year"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input placeholder:text-center tooltip tooltip-bottom"
                  min="1950"
                  max="2004"
                  data-tip="year"
                  maxlength="4"
                  placeholder="YY"
                />
              </section>
            </div>
            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
            >
              <label for="gen">Gender:</label>
              <select
                required
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
                v-model="apl.sgender"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
            >
              <label for="cityb">City of Birth:</label>
              <input
                id="cityb"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
                v-model="apl.scity_ob"
              />
            </div>
            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCchild flex-col items-center"
            >
              <label for="counb">Country of Birth:</label>
              <select
                required
                v-model="apl.scountry_ob"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
              >
                <Countries />
              </select>

              <!-- <input
                id="counb"
                v-model=""
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md font-semibold text-center apply-input"
              /> -->
            </div>
          </div>
        </div>

        <div v-if="hasWard">
          <WardForm
            @ward-data="wardEmitted"
            @wardStateOff="wardRemoved"
            v-for="(numb, i) in wardNumberArr"
            :key="i"
            :index="numb"
            :readySend="readySend"
            :isRender="isRender"
          >
          </WardForm>
        </div>

        <div
          v-if="applyVerification"
          class="bg-gradient-to-br from-green-500 to-green-700 rounded-lg px-4 py-1 w-fit cursor-default mx-auto mb-5 mt-8 text-white font-Outfit font-bold text-2xl"
        >
          <i class="pi pi-money-bill"></i> {{ totalPayment }}.00
        </div>

        <div v-if="!isRender" class="flex justify-center gap-[30px]">
          <gradient-button @click.prevent="renderApl">REVIEW</gradient-button>
        </div>
        <div v-else>
          <div class="flex justify-center gap-[30px]">
            <gradient-button @click.prevent="cancelRender"
              >GO BACK</gradient-button
            >
            <gradient-button v-if="applyVerification" @click.prevent="applyApl"
              ><template v-if="!loading" #default>SEND</template>
              <template #loading v-if="loading">
                <i class="pi pi-spin pi-spinner text-[1rem]"></i>
              </template>
            </gradient-button>
          </div>
        </div>
      </form>
    </div>

    <teleport to="body">
      <Dialog
        :visible="hasSaved"
        :modal="true"
        :closable="false"
        :showHeader="true"
        contentClass="rounded-b-md pt-[24px]"
        :style="{ width: 'max-content' }"
      >
        <div class="flex justify-center items=center">
          <span
            class="font-Outfit text-4xl text-center font-bold cursor-default"
            >Applicant Saved!</span
          >
        </div>
      </Dialog>

      <Dialog
        :modal="true"
        :visible="discounted"
        class="font-Outfit"
        :style="{ width: '60%' }"
        :closable="false"
        :maximizable="false"
      >
        <template #header>
          <div class="flex gap-2 relative">
            <span
              class="font-bold text-3xl bg-purple-500 px-4 py-2 rounded-full text-white"
              >Request Discount</span
            >
          </div>
        </template>
        <div class="flex gap-2 items-center justify-center w-full mt-[32px]">
          <i class="pi pi-dollar h-full font-bold" />
          <input
            type="number"
            v-model="discountAmount"
            class="max-w-[100px] bg-white rounded-xl outline outline-2 outline-gray-600 text-center py-2 px-3 font-bold text-2xl"
          />
          <span class="text-2xl font-bold">.00</span>
        </div>
        <template #footer>
          <Button
            @click="discounted = !discounted"
            icon="pi pi-times"
            label="Close"
            class="h-10 rounded-full p-button-danger"
          />
          <Button
            label="Submit"
            icon="pi pi-check"
            class="h-10 p-button-rounded bg-purple-500"
            @click=""
          />
        </template>
      </Dialog>
    </teleport>
  </div>
</template>
