<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase/supabase';
import { useToast } from 'primevue/usetoast';
import { useApplyImgStore } from '../store/aplImgStore';
import { storeToRefs } from 'pinia';
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

const toast = useToast();
const loading = ref(false);
const requestLoading = ref(false);
const route = useRoute();
const id = computed(() => route.params.id);

// const supabase.auth.user().id = supabase.auth.user().id;

const user_id = ref(null);
const plastName = ref(null);
const pfirstName = ref(null);
const potherName = ref(null);
const pdob_day = ref(null);
const pdob_month = ref(null);
const pdob_year = ref(null);
const passport_number = ref(null);
const ped_day = ref(null);
const ped_month = ref(null);
const ped_year = ref(null);
const pgender = ref(null);
const pcity_ob = ref(null);
const conf_code = ref(null);
const pcountry_ob = ref(null);
const email = ref(null);
const country_live_today = ref(null);
const education_level = ref(null);
const pcontact = ref(null);
const pother_contact = ref(null);
const postal = ref(null);
const marital_status = ref(null);
const children_number = ref(0);
const wards = ref(null);
const psocial_media = ref({
  twitter: null,
  instagram: null,
  facebook: null,
});

const slastName = ref(null);
const sfirstName = ref(null);
const sotherName = ref(null);
const sdob_day = ref(null);
const sdob_month = ref(null);
const sdob_year = ref(null);
const sgender = ref(null);
const scity_ob = ref(null);
const scountry_ob = ref(null);
const primePath = ref([]);
const secPath = ref([]);
const wardsPath = ref([]);
const created_at = ref(null);

const hasSpouse = ref(false);
const hasWards = ref(false);
const request = ref(null);
const requestBody = ref(null);
const isRequested = ref(false);
const isSavedWardArr = ref([]);
const editedWards = ref([]);
const disabled = ref(false);
const editMode = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}

const aplImg_path = ref([]);
const primeIMG = ref(null);
const ifSavedPrimeMsg = ref(false);
const ifSavedSecMsg = ref(false);
const imgUploading = ref(false);
const primeSRC = ref(null);
const secIMG = ref(null);
const secSRC = ref(null);

const onSelectPrime = evt => {
  ifSavedPrimeMsg.value = false;
  primeIMG.value = evt.files[0];
  primeSRC.value = evt.files[0].objectURL;
};

const onSelectSec = evt => {
  ifSavedSecMsg.value = false;
  secIMG.value = evt.files[0];
  secSRC.value = evt.files[0].objectURL;
};

const primeImage = computed(() => {
  if (primeIMG.value) {
    return primeSRC.value;
  } else {
    if (primePath.value) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${primePath.value}`;
    } else {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/avatar.svg`;
    }
  }
});
const secImage = computed(() => {
  if (secIMG.value) {
    return secSRC.value;
  } else {
    if (secPath.value) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${secPath.value}`;
    } else {
      return `https://bwisulfnifauhpe lglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg`;
    }
  }
});

const saveImgFiles = (e, type = null) => {
  useApplyImgStore().setFiles(e.files[0], type);
  toggleEditMode();
  if (type == 'prime') {
    ifSavedPrimeMsg.value = true;
  } else {
    ifSavedSecMsg.value = true;
  }
};

const full = computed(() => {
  if (!plastName.value || !pfirstName.value) {
    return null;
  } else {
    return `${plastName.value.toUpperCase().trim()} ${pfirstName.value
      .toUpperCase()
      .trim()}${
      potherName.value ? ' ' + potherName.value.toUpperCase().trim() : ''
    }`;
  }
});

const passportStatus = ref(null);
const passportStatusColor = computed(() => {
  if (passportStatus.value) return 'success';
  return 'danger';
});

const wardEmitted = e => {
  editedWards.value.push(e);
  isSavedWardArr.value.push({});
};

const wardRemoved = e => {
  isSavedWardArr.value.pop();
  const wardsRemoved = editedWards.value.filter(ward => ward.index !== e);
  editedWards.value = wardsRemoved;
};

// TODO complete supabase database

const loadApl = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('apl_id', id.value);

    if (error) throw error;
    created_at.value = data[0].created_at;
    conf_code.value = data[0].pconf_code
      ? data[0].pconf_code
      : 'No Confirmation Code Yet';
    passportStatus.value = data[0].passportAvail;
    user_id.value = data[0].user_id;
    aplImg_path.value = data[0].aplImg_path;
    primePath.value = data[0].aplImg_path.primePath
      ? data[0].aplImg_path.primePath[0]
      : null;
    secPath.value = data[0].aplImg_path.secPath
      ? data[0].aplImg_path.secPath[0]
      : null;
    wardsPath.value = data[0].aplImg_path.wardsPath
      ? data[0].aplImg_path.wardsPath
      : [];
    plastName.value = data[0].plastName?.toUpperCase();
    pfirstName.value = data[0].pfirstName?.toUpperCase();
    potherName.value = data[0].potherName?.toUpperCase();
    pdob_day.value = data[0].pdob_day;
    pdob_month.value = data[0].pdob_month;
    pdob_year.value = data[0].pdob_year;
    passport_number.value = data[0].ppassport_number;
    ped_day.value = data[0].passport_ex_day;
    ped_month.value = data[0].passport_ex_month;
    ped_year.value = data[0].passport_ex_year;
    pgender.value = data[0].pgender?.toUpperCase();
    pcontact.value = data[0].pcontact;
    pother_contact.value = data[0].pother_contact;
    pcity_ob.value = data[0].pcity_ob?.toUpperCase();
    pcountry_ob.value = data[0].pcountry_ob?.toUpperCase();
    email.value = data[0].pemail?.toUpperCase();
    country_live_today.value = data[0].pcountry_live_today?.toUpperCase();
    education_level.value = data[0].peducation_level;
    postal.value = data[0].ppostal?.toUpperCase();
    marital_status.value = data[0].pmarital_status?.toUpperCase();
    children_number.value = data[0].children_number;
    wards.value = data[0].wards;
    psocial_media.value = data[0].psocial_media
      ? data[0].psocial_media
      : { twitter: '', facebook: '', instagram: '' };

    if (data[0].slastName != '' && data[0].slastName != null) {
      hasSpouse.value = true;
      slastName.value = data[0].slastName?.toUpperCase();
      sfirstName.value = data[0].sfirstName?.toUpperCase();
      sotherName.value = data[0].sotherName?.toUpperCase();
      sdob_day.value = data[0].sdob_day;
      sdob_month.value = data[0].sdob_month;
      sdob_year.value = data[0].sdob_year;
      sgender.value = data[0].sgender?.toUpperCase();
      scity_ob.value = data[0].scity_ob?.toUpperCase();
      scountry_ob.value = data[0].scountry_ob?.toUpperCase();
    }

    if (data[0].wards.length > 0) {
      hasWards.value = true;
    }
    loading.value = false;
  } catch (err) {
    console.log(err.message);
    loading.value = false;
    showErrorOnload(err.message);
  }
};

const showErrorOnload = errorMsg => {
  toast.add({
    severity: 'danger',
    summary: `Failed to load resource.`,
    detail: `${errorMsg}.`,
    life: 6000,
  });
};

onMounted(() => {
  loadApl();
});

const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const changeDate = date => {
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
          user_id: supabase.auth.user().id,
          modify_type: request.value,
          modify_apl: {
            aplImg_path: aplImg_path.value,
            fullName: full.value,
            passportAvail: passportStatus.value,
            plastName: plastName.value?.toUpperCase(),
            pfirstName: pfirstName.value?.toUpperCase(),
            potherName: potherName.value?.toUpperCase(),
            pdob_day: pdob_day.value,
            pdob_month: pdob_month.value,
            pdob_year: pdob_year.value,
            pgender: pgender.value?.toUpperCase(),
            pcity_ob: pcity_ob.value?.toUpperCase(),
            pcountry_ob: pcountry_ob.value?.toUpperCase(),
            ppassport_number: passport_number.value,
            passport_ex_day: ped_day.value,
            passport_ex_month: ped_month.value,
            passport_ex_year: ped_year.value,
            pemail: email.value,
            peducation_level: education_level.value?.toUpperCase(),
            pcontact: pcontact.value,
            pother_contact: pother_contact.value,
            ppostal: postal.value?.toUpperCase(),
            pcountry_live_today: country_live_today.value?.toUpperCase(),
            pmarital_status: marital_status.value?.toUpperCase(),
            children_number: children_number.value,
            slastName: slastName.value?.toUpperCase(),
            sfirstName: sfirstName.value?.toUpperCase(),
            sotherName: sotherName.value?.toUpperCase(),
            sdob_day: sdob_day.value,
            sdob_month: sdob_month.value,
            sdob_year: sdob_year.value,
            sgender: sgender.value?.toUpperCase(),
            scity_ob: scity_ob.value?.toUpperCase(),
            scountry_ob: scountry_ob.value?.toUpperCase(),
            wards: editedWards.value,
            psocial_media: psocial_media.value,
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
          user_id: supabase.auth.user().id,
          modify_type: request.value,
          modify_apl: {
            aplImg_path: {
              primePath: primePath.value,
            },
            fullName: full.value,
            pfirstName: pfirstName.value?.toUpperCase(),
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

const openModal = e => {
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
    isSavedWardArr.value.length === Number(children_number.value) &&
    plastName.value.trim() !== '' &&
    pfirstName.value.trim() !== ''
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

const showToast = (severity, summary, detail, life = 4000) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: life,
  });
};

const isConf_code = ref(false);
const newConf_code = ref(null);
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
    conf_code.value = data[0].pconf_code;
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
  } catch (error) {
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

const updateAplInfo = async (table, rowItems, value) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(rowItems)
      .eq('apl_id', value);
    if (error) throw error;
  } catch (err) {
    console.trace(err.message);
  }
};

async function handleAplImgUpdate(id, path, type, file) {
  imageUpdateLoading.value = true;
  if (path == null) {
    const pathz = await useApplyImgStore().uploadAplImg(id, file);
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
  let user = useProfileStore().Users.filter(user => user.id === user_id.value);
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
            v-if="getUser4Apl"
            class="text-center bg-gradient-to-br from-indigo-300 to-purple-500 text-[0.8rem] font-bold my-1 text-white px-4 py-2 rounded-xl"
          >
            Applied By: {{ getUser4Apl ? getUser4Apl.username : '' }}
          </h1>
          <h1
            class="text-center bg-gradient-to-br from-indigo-300 to-purple-500 text-[0.8rem] font-bold my-1 text-white px-4 py-2 rounded-xl"
          >
            {{ changeDate(created_at) }}
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
                      handleAplImgUpdate(id, primePath, 'Primary', primeIMG)
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
                  v-model="plastName"
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
                  v-model="pfirstName"
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
                  v-model="potherName"
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
                  v-model="pdob_day"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="31"
                  maxlength="2"
                />
                <input
                  required
                  v-model="pdob_month"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="12"
                  maxlength="2"
                />
                <input
                  required
                  v-model="pdob_year"
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
                v-model="pgender"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
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
                v-model="pcity_ob"
              />
            </div>
            <div
              class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCname aC"
            >
              <label for="em">Confirmation Code:</label>
              <input
                v-model="conf_code"
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
                v-model="pcountry_ob"
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
                v-model="pcontact"
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
                v-model="pother_contact"
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
                v-model="email"
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
                  :value="passportStatus ? 'Available' : 'Unavailable'"
                  :severity="passportStatusColor"
                ></Tag
              ></label>
              <div class="flex w-full gap-[20px] items-center justify-evenly">
                <ToggleButton
                  v-model="passportStatus"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  class="h-8 font-Outfit rounded-xl"
                  onLabel="Available"
                  offLabel="Unavailable"
                />

                <input
                  id="em"
                  type="text"
                  v-model="passport_number"
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
                  v-model="ped_day"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="31"
                  maxlength="2"
                />
                <input
                  v-model="ped_month"
                  type="number"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                  min="1"
                  max="12"
                  maxlength="2"
                />
                <input
                  v-model="ped_year"
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
                v-model="postal"
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
                v-model="country_live_today"
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
                  v-model="psocial_media.facebook"
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
                  v-model="psocial_media.instagram"
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
                  v-model="psocial_media.twitter"
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
                v-model="marital_status"
                class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md sel font-semibold"
              >
                <option value="UNMARRIED">Unmarried</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
                <option value="LEGALLY SEPARATED">Legally Separated</option>
              </select>
            </div>

            <div
              class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCem"
            >
              <p>Highest Level of Education:</p>
              <select
                required
                v-model="education_level"
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
                v-model="children_number"
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
                      @click="handleAplImgUpdate(id, secPath, 'Secondary')"
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
                    v-model="slastName"
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
                    v-model="sfirstName"
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
                    v-model="sotherName"
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
                    v-model="sdob_day"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    max="31"
                    min="1"
                    maxlength="2"
                  />
                  <input
                    v-model="sdob_month"
                    type="number"
                    class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                    min="1"
                    max="12"
                    maxlength="2"
                  />
                  <input
                    v-model="sdob_year"
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
                  v-model="sgender"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
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
                  v-model="scity_ob"
                />
              </div>
              <div
                class="text-white p-[20px] m-[10px] border-none rounded-2xl flex text-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 aC aCname"
              >
                <label for="counb">Country of Birth:</label>
                <input
                  id="counb"
                  v-model="scountry_ob"
                  type="text"
                  class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input font-semibold"
                />
              </div>
            </div>
          </div>

          <div v-if="hasWards" class="wardInfo">
            <WardFormDetails
              v-for="(ward, i) in wards"
              :index="i"
              :wardsPath="wardsPath"
              :ward="ward"
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
              :tooltipOptions="{ position: 'top' }"
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
                  >Applicant {{ request.toUpperCase() }} Request</span
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
                disabled="disabled"
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
