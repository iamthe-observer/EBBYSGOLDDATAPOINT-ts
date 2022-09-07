<script setup lang="ts">
import { reactive, ref, watchEffect, inject } from 'vue';
import ToggleButton from 'primevue/togglebutton';
import Avatar from './avatar.vue';
import FileUpload from 'primevue/fileupload';
import { useApplyImgStore } from '../store/aplImgStore';
import InlineMessage from 'primevue/inlinemessage';
import Countries from './countries.vue';
import { useToggleState } from '../composables/useToggleState';

const props = defineProps<{
  index: number;
  readySend: boolean;
  isRender: boolean;
}>();

const EditMode = useToggleState();
const disabled = inject<boolean>('disabled', false);
const imgUploading = inject<boolean>('uploading', false);
const emit = defineEmits(['wardData', 'wardStateOff']);
const isSaved = ref(false);
const checked = ref(false);
const ifSavedWardMsg = ref(false);
const wardIMG = ref(null);
const wardSRC = ref(null);

const wardSave = () => {
  if (!checked.value) {
    emit('wardStateOff', props.index);
  } else {
    emit('wardData', wardInfo);
  }
};

watchEffect(() => {
  if (!props.isRender) checked.value = false;
});

watchEffect(() => {
  if (props.readySend == false) {
    isSaved.value = false;
  }
});

const wardInfo = reactive({
  wlastName: null,
  wfirstName: null,
  wotherName: null,
  wdob_day: null,
  wdob_month: null,
  wdob_year: null,
  wgender: null,
  wcity_ob: null,
  wcountry_ob: null,
  index: props.index,
});

const onSelect = (evt: any) => {
  ifSavedWardMsg.value = false;
  wardIMG.value = evt.files[0];
  wardSRC.value = evt.files[0].objectURL;
};

const saveImgFiles = (e: any, type: string) => {
  useApplyImgStore().setFiles(e.files[0], type);
  EditMode.toggleState();
  if (type.includes('ward')) {
    ifSavedWardMsg.value = true;
  }
};
</script>

<template>
  <div>
    <hr id="sDivide" class="w-1/2 mx-auto bg-indigo-400" />
    <div
      class="mx-auto text-[1.3em] text-center mt-[70px] my-[30px] bg-indigo-500 px-3 py-1 text-white w-fit rounded-lg"
    >
      Child Applicant #{{ index + 1 }}
    </div>
    <div class="w-fit mx-auto">
      <Avatar
        class="my-3 mb-0"
        :editMode="EditMode.state.value"
        :url="wardSRC"
        :uploading="imgUploading"
        @edit="EditMode.toggleState()"
      >
        <template #uploadFile>
          <div class="w-fit mx-auto gap-2 items-center flex flex-col">
            <FileUpload
              v-if="EditMode.state.value"
              :customUpload="true"
              mode="basic"
              accept="image/*"
              @select="onSelect"
              @uploader="e => saveImgFiles(e, `ward${index}`)"
              :disabled="disabled"
            />
            <InlineMessage
              v-if="wardIMG && EditMode.state.value"
              severity="info"
              >Image is not saved until clicked <i class="pi pi-arrow-up"></i
            ></InlineMessage>
            <InlineMessage v-if="ifSavedWardMsg" severity="success"
              >Saved Image!</InlineMessage
            >
          </div>
        </template>
      </Avatar>
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
            v-model="wardInfo.wlastName"
            id="ln"
            name="lastName"
            type="text"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input uppercase"
          />
        </div>
        <div>
          <label for="fn">First Name:</label>
          <input
            data-wardInput
            required
            v-model="wardInfo.wfirstName"
            id="fn"
            type="text"
            name="firstName"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input uppercase"
          />
        </div>
        <div>
          <label for="on">Other Name:</label>
          <input
            data-wardInput
            required
            v-model="wardInfo.wotherName"
            id="on"
            type="text"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input uppercase"
            name="otherName"
          />
        </div>
      </div>
      <div
        class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[10px] m-[10px] border-none rounded-2xl flex flex-col justify-center gap-2 text-center aC aCdob"
      >
        <label>Date of Birth:</label>
        <!-- <input type="date" v-model="wardInfo.wdob" class="bg-white text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center" /> -->

        <section>
          <input
            data-wardInput
            required
            v-model="wardInfo.wdob_day"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input uppercase"
            min="1"
            max="31"
            maxlength="2"
            placeholder="DD"
          />
          <input
            required
            data-wardInput
            v-model="wardInfo.wdob_month"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input uppercase"
            min="1"
            max="12"
            maxlength="2"
            placeholder="MM"
          />
          <input
            data-wardInput
            required
            v-model="wardInfo.wdob_year"
            type="number"
            class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center placeholder:text-center apply-input uppercase"
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
          v-model="wardInfo.wgender"
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
          class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input uppercase"
          v-model="wardInfo.wcity_ob"
        />
      </div>
      <div
        class="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg p-[20px] m-[10px] border-none rounded-2xl flex text-center aC aCchild"
      >
        <label for="counb">Country of Birth:</label>
        <!-- <input
          data-wardInput
          required
          id="counb"
          v-model="wardInfo.wcountry_ob"
          type="text"
          class="bg-white font-semibold text-purple-600 h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-md text-center apply-input uppercase"
        /> -->
        <select
          data-wardInput
          required
          id="counb"
          v-model="wardInfo.wcountry_ob"
          class="bg-white text-purple-600 h-[30px] border-none w-[90%] m-[10px] rounded-xl px-[15px] py-[5px] text-md font-semibold sel"
        >
          <Countries />
        </select>
      </div>

      <div v-if="readySend" class="col-span-3 mx-auto">
        <ToggleButton
          v-if="!isSaved"
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
