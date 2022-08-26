<script setup lang="ts">
import { ref, reactive, onMounted, computed, Ref } from 'vue';
import { useProfileStore } from '../store/profileStore';
import { storeToRefs } from 'pinia';
import gradientButton from '../composables/gradientButton.vue';
import { supabase } from '../supabase/supabase';
import FileUpload from 'primevue/fileupload';
import Avatar from '../components/avatar.vue';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { DefaultProfile, RegisterInfo } from '../interfaces/interfaces';
import { required, email } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { _Null } from '../types/types';

const { uploading } = storeToRefs(useProfileStore());
const profileStore = useProfileStore();
const { fullname } = storeToRefs(useProfileStore());
const { username } = storeToRefs(useProfileStore());
const usernameUploading = ref(false);
const userName = ref('');
const fullName = ref('');
const { url } = storeToRefs(useProfileStore());
const { role } = storeToRefs(useProfileStore());
const editMode = ref(false);
const resetPassword = ref(false);
const imageFile: Ref<Event | null> = ref(null);
const toast = useToast();
const passwordReset = ref('');
const confirmPasswordReset = ref('');
const RegisterModal = ref(false);
const loading = ref(false);
const errMsg = ref('');

const registerInfo = reactive<RegisterInfo>({
  email: '',
  password: '',
  confirmPassword: '',
});

const showToast = (
  severity: string,
  summary: string,
  detail: string,
  life: number = 3000
): void => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: life,
  });
};

const adminProfileName = computed(() => {
  if (role.value === false) return 'ADMIN ';
});

// TODO policies for updating and deleting avatars..JUST LEARN POLICIES AND SQL QUERIES

const DefaultProfile: DefaultProfile = {
  // id: supabase.auth.user()!.id,
  full_name: 'User',
  username: 'user',
  email: supabase.auth.user()!.email,
  role: true,
  id: supabase.auth.user()!.id,
};

onMounted(async () => {
  try {
    let ifProfile = await profileStore.checkForProfile();
    if (ifProfile!.length !== 0) return;
    await profileStore.insertDefaultProfile([DefaultProfile]);
  } catch (error) {
    console.log(error);
  }
});

function onSelect(event: Event) {
  imageFile.value = event;
  // src.value = imageFile.value.files[0].objectURL;
}

async function saveAvatarPic(evt: any) {
  let res = await profileStore.uploadAvatar(evt);
  if (!res)
    return showToast(
      'error',
      'Error Updating Avatar!',
      'Some internet or server issue... check internet connection.',
      4000
    );
  // if (!res) return showErrorAvatar();
  return showToast(
    'success',
    'Avatar Updated!',
    `changed avatar...you're welcome.`,
    3000
  );
  // return showSuccessAvatar();
}

function enterEditMode() {
  editMode.value = !editMode.value;
  userName.value = username.value;
  fullName.value = fullname.value;
}

async function saveProfile() {
  usernameUploading.value = true;
  try {
    await profileStore.updateProfile({
      username: userName.value,
      full_name: fullName.value,
    });
    await profileStore.getProfile();
    editMode.value = !editMode.value;
    showSuccess(userName.value, fullName.value);
  } catch (err: any) {
    console.log(err.message);
    usernameUploading.value = false;
    editMode.value = !editMode.value;
    showError();
  } finally {
    usernameUploading.value = false;
  }
}

const passwordUpdating = ref(false);
function checkPassword(str: string) {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return re.test(str);
}

async function updatePassword() {
  passwordUpdating.value = true;
  if (passwordReset.value !== confirmPasswordReset.value) {
    showConfirmPasswordError();
    passwordUpdating.value = false;
  } else {
    if (checkPassword(passwordReset.value)) {
      try {
        const { user, error } = await supabase.auth.update({
          password: passwordReset.value,
          data: { role: 'admin' },
        });

        if (error) throw error;
        passwordUpdating.value = false;
        showSuccessPassword();
      } catch (error: any) {
        alert(error.message);
        passwordUpdating.value = false;
      }
    } else {
      passwordUpdating.value = false;
      passwordReset.value = '';
      confirmPasswordReset.value = '';
      showPasswordUpdateError();
    }
  }
}

const showSuccess = (username: string, fullname: string) => {
  toast.add({
    severity: 'success',
    summary: 'Profile Data Updated!',
    detail: `changed username to "${username}" and name to "${fullname}"...you're welcome.`,
    life: 4000,
  });
};
const showSuccessAvatar = () => {
  toast.add({
    severity: 'success',
    summary: 'Avatar Updated!',
    detail: `changed avatar...you're welcome.`,
    life: 3000,
  });
};

const showSuccessPassword = () => {
  toast.add({
    severity: 'success',
    summary: 'Password Updated!',
    detail: '',
    life: 3000,
  });
};

const showError = () => {
  toast.add({
    severity: 'error',
    summary: 'Error Updating Username!',
    detail: 'Some internet or server issue... check internet connection.',
    life: 4000,
  });
};
const showErrorAvatar = () => {
  toast.add({
    severity: 'error',
    summary: 'Error Updating Avatar!',
    detail: 'Some internet or server issue... check internet connection.',
    life: 4000,
  });
};

const showPasswordUpdateError = () => {
  toast.add({
    severity: 'error',
    summary: 'Error Updating Password!',
    detail:
      'Password might not meet required conditions. Password must contain at least 1 number, be at least 8 characters, have a capital letter and a symbol(special character). Example: Ebbysgold1@',
    life: 10000,
  });
};

const showConfirmPasswordError = () => {
  toast.add({
    severity: 'error',
    summary: 'Password Does Not Match!',
    detail: 'Password does not match "Confirm Password".',
    life: 10000,
  });
};

const showRegisterSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Registered User!',
    detail: 'Check for validation email sent to your mail box.',
    life: 10000,
  });
};

const rules = computed(() => {
  return {
    email: { required, email },
    password: { required },
    confirmPassword: { required },
  };
});

const registerUser = async () => {
  loading.value = true;
  const v$ = useVuelidate(rules, registerInfo);
  let val = await v$.value.$validate();
  console.log(v$);
  if (!val) {
    v$.value.$errors.forEach(err => {
      alert(err.$message);
    });
  } else {
    if (registerInfo.password !== registerInfo.confirmPassword) {
      loading.value = false;
      errMsg.value = 'Passwords do not match... try again.';
      setTimeout(() => {
        errMsg.value = '';
      }, 4000);
    } else {
      if (checkPassword(registerInfo.password)) {
        try {
          let { user, error } = await supabase.auth.signUp({
            email: registerInfo.email,
            password: registerInfo.password,
          });
          if (error) throw error;
          showRegisterSuccess();
          loading.value = false;
          RegisterModal.value = false;
        } catch (err: any) {
          errMsg.value = err.message;
          loading.value = false;
          setTimeout(() => {
            errMsg.value = '';
          }, 4000);
        } finally {
          loading.value = false;
        }
      }
    }
  }
};
</script>

<template>
  <div
    class="flex-1 p-3 bg-indigo-100 border-none rounded-3xl [max-height:100%] flex gap-3"
  >
    <Toast />

    <div
      class="chamber flex flex-col flex-1 items-center rounded-3xl p-5 shadow-2xl bg-gray-50 overflow-y-scroll font-Outfit font-bold"
    >
      <h1 class="font-bold text-[3em] text-center">
        <span
          v-if="adminProfileName"
          class="text-lg text-center text-white outline outline-2 outline-white bg-red-600 rounded-lg px-2 py-1 flex justify-center align-center"
          >{{ adminProfileName }}</span
        >
        PROFILE
      </h1>

      <Avatar
        @edit="(e:any) => (editMode = e)"
        :url="url"
        :editMode="editMode"
        :uploading="uploading"
      />

      <FileUpload
        v-if="editMode"
        :customUpload="true"
        mode="basic"
        accept="image/*"
        @select="onSelect"
        @uploader="saveAvatarPic"
      />

      <div class="w-[80%] grid grid-cols-2">
        <div
          v-if="!resetPassword"
          class="rounded-lg m-3 text-white bg-indigo-500 shadow-2xl p-4"
        >
          <label class="flex flex-col items-center" for="fullName"
            ><span class="px-2 rounded-xl bg-indigo-400">Full Name</span
            ><span v-if="!editMode" class="text-[2em] text-center font-bold">{{
              fullname
            }}</span
            ><input
              v-else
              class="bg-white text-black h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-[1.3em] font-semibold text-center my-3"
              type="text"
              placeholder="edit name"
              v-model="fullName"
          /></label>
        </div>
        <div
          v-if="!resetPassword"
          class="rounded-lg m-3 text-white bg-indigo-500 shadow-2xl p-4"
        >
          <label class="flex flex-col items-center" for="fullName"
            ><span class="px-2 rounded-xl bg-indigo-400">Username</span
            ><span v-if="!editMode" class="text-[2em] text-center font-bold">{{
              username
            }}</span
            ><input
              v-else
              class="bg-white text-black h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-[1.3em] font-semibold text-center my-3"
              type="text"
              placeholder="edit username"
              v-model="userName"
          /></label>
        </div>

        <div
          v-if="resetPassword"
          class="rounded-lg m-3 text-white bg-indigo-500 shadow-2xl p-4"
        >
          <label class="flex flex-col items-center" for="fullName"
            ><span class="px-2 rounded-xl bg-indigo-400">Password Reset</span
            ><input
              class="bg-white text-black h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-[1.3em] font-semibold text-center my-3"
              type="password"
              placeholder="password"
              v-model="passwordReset"
          /></label>
        </div>
        <div
          v-if="resetPassword"
          class="rounded-lg m-3 text-white bg-indigo-500 shadow-2xl p-4"
        >
          <label class="flex flex-col items-center" for="fullName"
            ><span class="px-2 rounded-xl bg-indigo-400"
              >Confirm Password Reset</span
            ><input
              class="bg-white text-black h-[30px] border-none w-4/5 rounded-xl px-[15px] py-[5px] text-[1.3em] font-semibold text-center my-3"
              type="password"
              placeholder="confirm password"
              v-model="confirmPasswordReset"
          /></label>
        </div>
      </div>

      <teleport to="body">
        <Dialog
          :modal="true"
          :visible="RegisterModal"
          class="font-Outfit"
          :closable="false"
          :draggable="false"
          :style="{ width: '60%' }"
          :maximizable="false"
        >
          <template #header>
            <div class="flex gap-2 relative">
              <span
                class="relative font-bold text-3xl bg-purple-500 px-4 py-2 rounded-full text-white"
                >Register New User</span
              >
            </div>
          </template>
          <div class="flex items-center justify-center w-full gap-3 mt-[10px]">
            <div
              class="font-bold flex flex-col max-w-[70%] p-3 rounded-md bg-gradient-to-br from-purple-300 to-indigo-300 w-full h-[300px]"
            >
              <div
                class="flex flex-col items-center w-full min-h-[50%] text-center justify-evenly"
              >
                <em class=""
                  >Enter <span class="text-purple-500">Information</span> below
                  to register for the data point access</em
                >

                <div class="flex flex-col">
                  <div class="flex w-full gap-3">
                    <div class="max-w-[30px] flex items-center aspect-square">
                      <img src="../assets/icons/arroba.png" />
                    </div>
                    <input
                      v-model="registerInfo.email"
                      class="text-center font-[1.3rem] rounded-lg h-[40px] px-[15px] py-[10px] transition-all bg-[rgba(0,0,0,.3)] placeholder:text-white duration-300 text-white my-3 hover:bg-purple-500 backdrop-blur-lg focus:bg-purple-500 focus:outline-none"
                      type="email"
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div class="flex w-full gap-3">
                    <div class="max-w-[30px] flex items-center aspect-square">
                      <img src="../assets/icons/key.png" />
                    </div>
                    <input
                      class="text-center font-[1.3rem] rounded-lg h-[40px] px-[15px] py-[10px] transition-all bg-[rgba(0,0,0,.3)] placeholder:text-white duration-300 text-white my-3 hover:bg-purple-500 backdrop-blur-lg focus:bg-purple-500 focus:outline-none"
                      v-model="registerInfo.password"
                      type="password"
                      placeholder="Password"
                      required
                    />
                  </div>

                  <div class="flex w-full gap-3">
                    <div class="max-w-[30px] flex items-center aspect-square">
                      <img src="../assets/icons/password.png" />
                    </div>
                    <input
                      class="text-center font-[1.3rem] rounded-lg h-[40px] px-[15px] py-[10px] transition-all bg-[rgba(0,0,0,.3)] placeholder:text-white duration-300 text-white my-3 hover:bg-purple-500 backdrop-blur-lg focus:bg-purple-500 focus:outline-none"
                      v-model="registerInfo.confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      required
                    />
                  </div>
                </div>
                <div>
                  <span class="errMsg">{{ errMsg }}</span>
                </div>
                <div class="outputs">
                  <gradient-button
                    @click="registerUser"
                    class="hover:scale-110"
                  >
                    <template #default v-if="!loading">Sign Up</template>
                    <template #loading v-if="loading"
                      ><i class="pi pi-spin pi-spinner text-[1rem]"></i
                    ></template>
                  </gradient-button>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="w-full">
              <Button
                @click="RegisterModal = false"
                icon="pi pi-times"
                label="Close"
                class="p-button-rounded p-button-danger"
              />
            </div>
          </template>
        </Dialog>
      </teleport>

      <div class="mt-20 w-full gap-5 flex justify-center">
        <gradient-button
          @click="RegisterModal = !RegisterModal"
          v-if="!editMode && !role"
          >Register New User</gradient-button
        >
        <gradient-button @click="enterEditMode" v-if="!editMode"
          >Edit Profile</gradient-button
        >
        <div v-else class="flex gap-5 w-full justify-center">
          <gradient-button
            @click="
              () => {
                userName = '';
                editMode = false;
                resetPassword = false;
              }
            "
            >Cancel Edit</gradient-button
          >
          <gradient-button v-if="!resetPassword" @click="saveProfile()"
            ><template v-if="!usernameUploading"> Save Profile </template>
            <template #loading v-if="usernameUploading">
              <i class="pi pi-spin pi-spinner text-[1rem]"></i>
            </template>
          </gradient-button>

          <gradient-button
            @click="
              () => {
                if (resetPassword) updatePassword();
                resetPassword = true;
                passwordReset = '';
                confirmPasswordReset = '';
              }
            "
            ><template v-if="!passwordUpdating">
              {{ resetPassword ? 'Save Password' : 'Reset Password' }}
            </template>
            <template #loading v-if="passwordUpdating">
              <i class="pi pi-spin pi-spinner text-[1rem]"></i>
            </template>
          </gradient-button>
        </div>
      </div>
    </div>
  </div>
</template>
