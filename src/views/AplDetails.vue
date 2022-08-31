<script setup lang="ts">
// const user_id = ref(null);
// const plastName = ref(null);
// const pfirstName = ref(null);
// const potherName = ref(null);
// const pdob_day = ref(null);
// const pdob_month = ref(null);
// const pdob_year = ref(null);
// const passport_number = ref(null);
// const ped_day = ref(null);
// const ped_month = ref(null);
// const ped_year = ref(null);
// const pgender = ref(null);
// const pcity_ob = ref(null);
// const conf_code = ref(null);
// const pcountry_ob = ref(null);
// const email = ref(null);
// const country_live_today = ref(null);
// const education_level = ref(null);
// const pcontact = ref(null);
// const pother_contact = ref(null);
// const postal = ref(null);
// const marital_status = ref(null);
// const children_number = ref(0);
// const wards = ref(null);
// const psocial_media = ref({
//   twitter: null,
//   instagram: null,
//   facebook: null,
// });

// const slastName = ref(null);
// const sfirstName = ref(null);
// const sotherName = ref(null);
// const sdob_day = ref(null);
// const sdob_month = ref(null);
// const sdob_year = ref(null);
// const sgender = ref(null);
// const scity_ob = ref(null);
// const scountry_ob = ref(null);
// const primePath = ref([]);
// const secPath = ref([]);
// const wardsPath = ref([]);
// const created_at = ref(null);

import { useRoute } from 'vue-router';
import { ref, onBeforeMount, computed } from 'vue';
import { supabase } from '../supabase/supabase';
import { useToast } from 'primevue/usetoast';
import { useApplyImgStore } from '../store/aplImgStore';
import { useProfileStore } from '../store/profileStore.js';
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
import { _Null } from '../types/types';
import {
  Applicant,
  WardsApplicant,
  ProfileData,
} from '../interfaces/interfaces';

const toast = useToast();
const loading = ref(false);
const requestLoading = ref(false);
const route = useRoute();
const id = computed(() => route.params.id);

// const supabase.auth.user().id = supabase.auth.user().id;

const apl = ref<Applicant | null>(null);
const primePath = computed(() => {
  return apl.value?.aplImg_path.primePath![0];
});
const secPath = computed(() => {
  return apl.value?.aplImg_path.secPath![0];
});
const wardsPath = computed(() => {
  return apl.value?.aplImg_path.wardsPath;
});
const hasSpouse = ref(false);
const hasWards = ref(false);
const request = ref<_Null<string>>(null);
const requestBody = ref<string | undefined>('');
const isRequested = ref(false);
const isSavedWardArr = ref<{}[]>([]);
const editedWards = ref<WardsApplicant[]>([]);
const disabled = ref(false);
const editMode = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}

const imgUploading = ref(false);
const aplImg_path = ref([]);
const primeIMG = ref<any>(null);
const primeSRC = ref<string | null>(null);
const ifSavedPrimeMsg = ref(false);
const secIMG = ref<any>(null);
const secSRC = ref<string | null>(null);
const ifSavedSecMsg = ref(false);

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

const primeImage = computed(() => {
  if (primeIMG.value) {
    return primeSRC.value;
  } else {
    if (apl.value?.aplImg_path.primePath?.length) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
        apl.value.aplImg_path.primePath![0]
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
    if (apl.value?.aplImg_path.secPath?.length) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${
        apl.value?.aplImg_path.secPath![0]
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

const full = computed(() => {
  if (!apl.value!.plastName || !apl.value!.pfirstName) {
    return null;
  } else {
    return `${apl.value!.plastName.toUpperCase().trim()} ${apl
      .value!.pfirstName.toUpperCase()
      .trim()}${
      apl.value!.potherName
        ? ' ' + apl.value!.potherName.toUpperCase().trim()
        : ''
    }`;
  }
});

const passportStatus = ref<boolean>(false);
const passportStatusColor = computed(() => {
  if (apl.value?.passportAvail) return 'success';
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

// TODO complete supabase database
const userOfApl = ref<ProfileData | null>(null);

const loadApl = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('apl_id', id.value);

    if (error) throw error;
    console.log(data[0]);

    apl.value = data[0];

    // apl.value!.created_at = data[0].created_at;
    // apl.value!.pconf_code = data[0].pconf_code
    //   ? data[0].pconf_code
    //   : 'No Confirmation Code Yet';
    // apl.value!.passportAvail = data[0].passportAvail;
    // apl.value!.user_id = data[0].user_id;
    // apl.value!.aplImg_path = data[0].aplImg_path;
    // apl.value!.plastName = data[0].plastName?.toUpperCase();
    // apl.value!.pfirstName = data[0].pfirstName?.toUpperCase();
    // apl.value!.potherName = data[0].potherName?.toUpperCase();
    // apl.value!.pdob_day = data[0].pdob_day;
    // apl.value!.pdob_month = data[0].pdob_month;
    // apl.value!.pdob_year = data[0].pdob_year;
    // apl.value!.ppassport_number = data[0].ppassport_number;
    // apl.value!.passport_ex_day = data[0].passport_ex_day;
    // apl.value!.passport_ex_month = data[0].passport_ex_month;
    // apl.value!.passport_ex_year = data[0].passport_ex_year;
    // apl.value!.pgender = data[0].pgender?.toUpperCase();
    // apl.value!.pcontact = data[0].pcontact;
    // apl.value!.pother_contact = data[0].pother_contact;
    // apl.value!.pcity_ob = data[0].pcity_ob?.toUpperCase();
    // apl.value!.pcountry_ob = data[0].pcountry_ob?.toUpperCase();
    // apl.value!.pemail = data[0].pemail?.toUpperCase();
    // apl.value!.pcountry_live_today = data[0].pcountry_live_today?.toUpperCase();
    // apl.value!.peducation_level = data[0].peducation_level;
    // apl.value!.ppostal = data[0].ppostal?.toUpperCase();
    // apl.value!.pmarital_status = data[0].pmarital_status?.toUpperCase();
    // apl.value!.children_number = data[0].children_number;
    // apl.value!.wards = data[0].wards;
    // apl.value!.psocial_media = data[0].psocial_media
    //   ? data[0].psocial_media
    //   : { twitter: '', facebook: '', instagram: '' };

    if (data[0].slastName != '' && data[0].slastName != null) {
      hasSpouse.value = true;
      // apl.value!.slastName = data[0].slastName?.toUpperCase();
      // apl.value!.sfirstName = data[0].sfirstName?.toUpperCase();
      // apl.value!.sotherName = data[0].sotherName?.toUpperCase();
      // apl.value!.sdob_day = data[0].sdob_day;
      // apl.value!.sdob_month = data[0].sdob_month;
      // apl.value!.sdob_year = data[0].sdob_year;
      // apl.value!.sgender = data[0].sgender?.toUpperCase();
      // apl.value!.scity_ob = data[0].scity_ob?.toUpperCase();
      // apl.value!.scountry_ob = data[0].scountry_ob?.toUpperCase();
    }

    if (data[0].wards.length > 0) {
      hasWards.value = true;
    }

    let user = useProfileStore().Users.filter(
      user => user.id === apl.value!.user_id
    );
    userOfApl.value = user[0];

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

const changeDate = (date: string) => {
  const day = new Date(date).toLocaleDateString('en-us', options);
  return day;
};

const sendRequest = async () => {
  if (request.value == 'edit') {
    // for edit requests
    // if (hasFiles.value) {
    //   aplImg_path.value = await useApplyImgStore().uploadFiles(id.value);
    // }

    try {
      requestLoading.value = true;
      const { data, error } = await supabase.from('requests').insert([
        {
          reason_body: requestBody.value,
          apl_id: id.value,
          user_id: supabase.auth.user()!.id,
          modify_type: request.value,
          modify_apl: {
            aplImg_path: aplImg_path.value,
            fullName: full.value,
            passportAvail: passportStatus.value,
            plastName: apl.value!.plastName?.toUpperCase(),
            pfirstName: apl.value!.pfirstName?.toUpperCase(),
            potherName: apl.value!.potherName?.toUpperCase(),
            pdob_day: apl.value!.pdob_day,
            pdob_month: apl.value!.pdob_month,
            pdob_year: apl.value!.pdob_year,
            pgender: apl.value!.pgender?.toUpperCase(),
            pcity_ob: apl.value!.pcity_ob?.toUpperCase(),
            pcountry_ob: apl.value!.pcountry_ob?.toUpperCase(),
            ppassport_number: apl.value!.ppassport_number,
            passport_ex_day: apl.value!.passport_ex_day,
            passport_ex_month: apl.value!.passport_ex_month,
            passport_ex_year: apl.value!.passport_ex_year,
            pemail: apl.value!.pemail,
            peducation_level: apl.value!.peducation_level?.toUpperCase(),
            pcontact: apl.value!.pcontact,
            pother_contact: apl.value!.pother_contact,
            ppostal: apl.value!.ppostal?.toUpperCase(),
            pcountry_live_today: apl.value!.pcountry_live_today?.toUpperCase(),
            pmarital_status: apl.value!.pmarital_status?.toUpperCase(),
            children_number: apl.value!.children_number,
            slastName: apl.value!.slastName?.toUpperCase(),
            sfirstName: apl.value!.sfirstName?.toUpperCase(),
            sotherName: apl.value!.sotherName?.toUpperCase(),
            sdob_day: apl.value!.sdob_day,
            sdob_month: apl.value!.sdob_month,
            sdob_year: apl.value!.sdob_year,
            sgender: apl.value!.sgender?.toUpperCase(),
            scity_ob: apl.value!.scity_ob?.toUpperCase(),
            scountry_ob: apl.value!.scountry_ob?.toUpperCase(),
            wards: editedWards.value,
            psocial_media: apl.value!.psocial_media,
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
              primePath: apl.value?.aplImg_path.primePath,
            },
            fullName: full.value,
            pfirstName: apl.value!.pfirstName?.toUpperCase(),
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
// const openModal = e => {
//   isRequested.value = true;
//   if (e.target.innerText.includes('EDIT')) {
//     request.value = 'edit';
//   } else {
//     request.value = 'delete';
//   }
// };

const isSavedWard = computed(() => {
  if (
    isSavedWardArr.value.length === Number(apl.value!.children_number) &&
    apl.value!.plastName!.trim() !== '' &&
    apl.value!.pfirstName!.trim() !== ''
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

// watchEffect(() => {
//   console.log(isSavedWard.value);
//   console.log(isSavedWardArr.value);
//   console.log(isSavedWardArr.value.length, Number(children_number.value));
// console.log(submitButton.value);
// });

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
    apl.value!.pconf_code = data[0].pconf_code;
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

// const updateAplInfo = async (table, rowItems, value) => {
//   try {
//     const { data, error } = await supabase
//       .from(table)
//       .update(rowItems)
//       .eq('apl_id', value);
//     if (error) throw error;
//   } catch (err:any) {
//     console.trace(err.message);
//   }
// };

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
      apl.value!.aplImg_path,
      newPath,
      apl.value?.apl_id,
      type
    );
  } else {
    await useApplyImgStore().updateSingleAplImg(path);
  }
  imageUpdateLoading.value = false;
  ifSavedPrimeMsg.value = false;
  ifSavedSecMsg.value = false;

  showToast('success', `${type} Applicant Image Updated`, '');
  useApplyImgStore().resetFiles();
}

const getUser4Apl = computed(() => {
  let user = useProfileStore().Users.filter(
    user => user.id === apl.value!.user_id
  );
  return user[0];
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
            <!-- <ImageView :url="primePath ? primePath : ''" /> -->
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
              <input
                required
                id="counb"
                v-model="apl!.pcountry_ob"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
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
              <input
                required
                v-model="apl!.pcountry_live_today"
                id="cwylt"
                type="text"
                class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
              />
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
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCname"
              >
                <label for="counb">Country of Birth:</label>
                <input
                  id="counb"
                  v-model="apl!.scountry_ob"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                />
              </div>
            </div>
          </div>

          <div v-if="hasWards" class="wardInfo">
            <WardFormDetails
              v-for="(ward, i) in apl!.wards"
              :index="i"
              :aplImg_path="apl?.aplImg_path"
              :wardsPath="wardsPath"
              :ward="ward"
              :apl_id="apl?.apl_id"
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
