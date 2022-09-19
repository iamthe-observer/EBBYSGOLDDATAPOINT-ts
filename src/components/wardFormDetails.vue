<script setup lang="ts">
import { ref } from 'vue';
import ToggleButton from 'primevue/togglebutton';
import Avatar from './avatar.vue';
import FileUpload from 'primevue/fileupload';
import { useApplyImgStore } from '../store/AplImgStore';
import InlineMessage from 'primevue/inlinemessage';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import { computed } from '@vue/reactivity';
import { Applicant, WardsApplicant } from '../interfaces/interfaces';
import { _Null } from '../types/types';
import { useRequestStore } from '../store/RequestStore';
import { storeToRefs } from 'pinia';
import ImageView from '../components/imgView.vue';
import Countries from './countries.vue';

const { viewWardRequestImage } = storeToRefs(useRequestStore());
const toast = useToast();
const props = defineProps<{
  index: number;
  ward: WardsApplicant;
  apl: Applicant | any;
  is_request: boolean;
}>();
const { curr_request } = storeToRefs(useRequestStore());

const modified_apl = computed(() => {
  return curr_request.value!.modify_apl;
});
const emit = defineEmits(['ward', 'wardStateOff']);
const isSaved = ref(false);
const checked = ref(false);
const wardIMG = ref(null);
const wardSRC = ref<string>('');

const WARDPATH: string | undefined = props.apl!.aplImg_path.wardsPath!.filter(
  (wardPath: string): boolean => wardPath.includes(`ward${props.index}`)
)[0];
const hasWardPath = computed(() => {
  if (WARDPATH) {
    return true;
  } else {
    return false;
  }
});

const wardImage = computed((): string => {
  if (wardIMG.value) {
    return wardSRC.value;
  } else {
    if (props.apl!.aplImg_path.wardsPath!.length && hasWardPath.value) {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${WARDPATH}`;
    } else {
      return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/avatar.svg`;
    }
  }
});

const editMode = ref(false);
const disabled = ref(false);
const ifSavedWardMsg = ref(false);
const imageUpdateLoading = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}
const wardSave = () => {
  if (!checked.value) {
    emit('wardStateOff', props.index);
  } else {
    emit('ward', props.ward);
  }
};

const onSelect = (evt: any) => {
  wardIMG.value = evt.files[0];
  wardSRC.value = evt.files[0].objectURL;
};

const saveImgFiles = (e: any, type: string) => {
  useApplyImgStore().setFiles(e.files[0], type);
  toggleEditMode();
  ifSavedWardMsg.value = true;
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

async function handleAplImgUpdate(
  id: string | null | undefined,
  path: string | undefined,
  hasPath: boolean,
  type: string,
  file: any
) {
  imageUpdateLoading.value = true;
  if (!hasPath) {
    const newPath = await useApplyImgStore().uploadAplImg(id, file);
    console.log(newPath);
    await useApplyImgStore().updateAplPath(
      props.apl!.aplImg_path,
      newPath,
      props.apl!.apl_id,
      type
    );
  } else {
    await useApplyImgStore().updateSingleAplImg(path);
  }
  ifSavedWardMsg.value = false;
  imageUpdateLoading.value = false;

  showToast('success', `Ward Applicant Image Updated`, '');
  useApplyImgStore().resetFiles();
}

// async function handleAplImgUpdate(path: string) {
//   imageUpdateLoading.value = true;
//   await useApplyImgStore().updateSingleAplImg(path);
//   imageUpdateLoading.value = false;
// ifSavedWardMsg.value = false;
//   showToast('success', 'Ward Applicant Image Updated', '');
//   useApplyImgStore().resetFiles();

// await useApplyImgStore().updateAplImg(primePath.value, id.value);
// await useApplyImgStore().updateingle(primePath.value);
// }
</script>

<template>
  <div>
    <teleport to="body">
      <Toast />
    </teleport>

    <hr id="sDivide" class="w-1/2 mx-auto bg-indigo-400" />
    <div
      class="mx-auto text-[1.3em] text-center mt-[70px] my-[30px] bg-indigo-500 px-3 py-1 text-white w-fit rounded-lg"
    >
      Child Applicant #{{ index + 1 }}
    </div>
    <div class="w-fit mx-auto">
      <slot name="imageView">
        <ImageView v-if="viewWardRequestImage" :url="wardImage" />
        <Avatar
          v-else
          class="my-3 mb-0"
          :editMode="editMode"
          :url="wardImage"
          :uploading="false"
          @edit="toggleEditMode"
        >
          <template #uploadFile>
            <div class="w-fit mx-auto flex flex-col gap-2 items-center">
              <FileUpload
                v-if="editMode"
                :customUpload="true"
                mode="basic"
                accept="image/*"
                @select="onSelect"
                @uploader="e => saveImgFiles(e, `ward${index}`)"
                :disabled="disabled"
              />
              <Button
                v-if="ifSavedWardMsg"
                class="p-button bg-indigo-500 self-center"
                icon="pi
                        pi-upload"
                @click="
                  handleAplImgUpdate(
                    apl!.apl_id,
                    WARDPATH,
                    hasWardPath,
                    `ward${index}`,
                    wardIMG
                  )
                "
                label="Update Image"
                :loading="imageUpdateLoading"
              />
              <InlineMessage v-if="!ifSavedWardMsg && editMode" severity="info"
                >Image is not saved until clicked <i class="pi pi-arrow-up"></i
              ></InlineMessage>
              <InlineMessage v-if="ifSavedWardMsg" severity="success"
                >Saved Image!</InlineMessage
              >
            </div>
          </template>
        </Avatar>
      </slot>
    </div>

    <div
      class="grid grid-cols-3 relative after:absolute mb-5 after:px-[10px] after:bg-teal-400 after:rounded-full after:text-center after:text-[0.7em] after:left-[40px] after:text-slate-50 after:top-[-3px] after:font-extrabold after:content-['Main_Information'] after:shadow-xl"
    >
      <div
        class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCname"
      >
        <div>
          <label for="ln">Last Name:</label>
          <input
            data-wardInput
            required
            v-model="ward.wlastName"
            id="ln"
            name="lastName"
            type="text"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
          />
        </div>
        <div>
          <label for="fn">First Name:</label>
          <input
            data-wardInput
            required
            v-model="ward.wfirstName"
            id="fn"
            type="text"
            name="firstName"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
          />
        </div>
        <div>
          <label for="on">Other Name:</label>
          <input
            data-wardInput
            required
            v-model="ward.wotherName"
            id="on"
            type="text"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
            name="otherName"
          />
        </div>
      </div>

      <!-- modified -->
      <div
        v-if="is_request"
        class="bg-gradient-to-br from-green-500 to-cyan-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aCname"
      >
        <div>
          <label for="ln">Last Name:</label>
          <input
            data-wardInput
            required
            v-model="modified_apl.wards[index].wlastName"
            id="ln"
            name="lastName"
            type="text"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
          />
        </div>
        <div>
          <label for="fn">First Name:</label>
          <input
            data-wardInput
            required
            v-model="modified_apl.wards[index].wfirstName"
            id="fn"
            type="text"
            name="firstName"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
          />
        </div>
        <div>
          <label for="on">Other Name:</label>
          <input
            data-wardInput
            required
            v-model="modified_apl.wards[index].wotherName"
            id="on"
            type="text"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
            name="otherName"
          />
        </div>
      </div>

      <div
        class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCdob"
      >
        <label>Date of Birth:</label>
        <!-- <input type="date" v-model="ward.wdob" class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center" /> -->

        <section>
          <input
            data-wardInput
            required
            v-model="ward.wdob_day"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input"
            min="1"
            max="31"
            maxlength="2"
            placeholder="DD"
          />
          <input
            required
            data-wardInput
            v-model="ward.wdob_month"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input"
            min="1"
            max="12"
            maxlength="2"
            placeholder="MM"
          />
          <input
            data-wardInput
            required
            v-model="ward.wdob_year"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input"
            min="1950"
            max="2050"
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
          data-wardSelect
          required
          class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
          v-model="ward.wgender"
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
          data-wardInput
          required
          id="cityb"
          type="text"
          class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
          v-model="ward.wcity_ob"
        />
      </div>

      <!-- modified -->
      <div
        v-if="is_request"
        class="bg-gradient-to-br from-green-500 to-cyan-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCdob"
      >
        <label>Date of Birth:</label>
        <!-- <input type="date" v-model="ward.wdob" class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center" /> -->

        <section>
          <input
            data-wardInput
            required
            v-model="modified_apl.wards[index].wdob_day"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input"
            min="1"
            max="31"
            maxlength="2"
            placeholder="DD"
          />
          <input
            required
            data-wardInput
            v-model="modified_apl.wards[index].wdob_month"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input"
            min="1"
            max="12"
            maxlength="2"
            placeholder="MM"
          />
          <input
            data-wardInput
            required
            v-model="modified_apl.wards[index].wdob_year"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input"
            min="1950"
            max="2050"
            maxlength="4"
            placeholder="YY"
          />
        </section>
      </div>
      <div
        v-if="is_request"
        class="bg-gradient-to-br from-green-500 to-cyan-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
      >
        <label for="gen">Gender:</label>
        <select
          data-wardSelect
          required
          class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
          v-model="modified_apl.wards[index].wgender"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div
        v-if="is_request"
        class="bg-gradient-to-br from-green-500 to-cyan-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC"
      >
        <label for="cityb">City of Birth:</label>
        <input
          data-wardInput
          required
          id="cityb"
          type="text"
          class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
          v-model="modified_apl.wards[index].wcity_ob"
        />
      </div>

      <div
        class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCchild"
      >
        <label for="counb">Country of Birth:</label>
        <select
          required
          id="counb"
          v-model="ward.wcountry_ob"
          class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
        >
          <Countries />
        </select>

        <!-- <input
          data-wardInput
          required
          id="counb"
          v-model="ward.wcountry_ob"
          type="text"
          class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
        /> -->
      </div>

      <!-- modified -->
      <div
        v-if="is_request"
        class="bg-gradient-to-br from-green-500 to-cyan-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCchild"
      >
        <label for="counb">Country of Birth:</label>
        <select
          required
          id="counb"
          v-model="modified_apl.wards[index].wcountry_ob"
          class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
        >
          <Countries />
        </select>

        <!-- <input
          data-wardInput
          required
          id="counb"
          v-model="modified_apl.wards[index].wcountry_ob"
          type="text"
          class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input"
        /> -->
      </div>

      <div class="col-span-3 mx-auto">
        <ToggleButton
          v-if="!isSaved && !is_request"
          v-model="checked"
          onLabel="Saved"
          offLabel="Not Saved"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
          class="rounded-lg"
          @change="wardSave"
        />
      </div>
    </div>
  </div>
</template>

<!-- FINALLY FOUND THE ANSWER!
  <template>
  <button @click="$emit('change')">Click Me</button>
</template>
<script setup>
  import { defineProps, defineEmit, useContext } from 'vue'

  const props = defineProps({
    foo: String
  })
  const emit = defineEmit(['change', 'delete'])

  const { slots, attrs } = useContext()
</script> -->
