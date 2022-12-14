<script setup lang="ts">
import { useProfileStore } from '../store/ProfileStore';
import { useRequestStore } from '../store/RequestStore';
import { onBeforeMount } from 'vue';
import { storeToRefs } from 'pinia';
import SplitButton from 'primevue/splitbutton';
import { supabase } from '../supabase/supabase';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { Requests } from '../interfaces/interfaces';
import Chip from 'primevue/chip';

const { requests } = storeToRefs(useRequestStore());
const { user_profiles } = storeToRefs(useProfileStore());
const toast = useToast();
const router = useRouter();

onBeforeMount(async () => {});

// @todo make tab system for adminRequests

function getUser4AplInfo(request_user_id: string | undefined) {
  return user_profiles.value!.find(user => user.id == request_user_id);
}

async function handleApprove(request: Requests) {
  if (request.modify_type == 'edit') {
    try {
      const { data: updateApl, error: errorUpdate } = await supabase
        .from('applicants')
        .update(request.modify_apl)
        .eq('apl_id', request.apl_id);
      if (errorUpdate) throw errorUpdate;

      console.log(updateApl);

      const { data: acceptedRequest, error: requestError } = await supabase
        .from('requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);
      if (requestError) throw requestError;

      console.log(acceptedRequest, 'accepted');

      toast.add({
        severity: 'success',
        summary: `${request.modify_apl.fullName}'s request has been approved.`,
        detail: 'Accepted Edit of Applicant.',
        life: 2000,
      });

      setTimeout(async () => {
        await useRequestStore().getAllRequests();
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
        .eq('apl_id', request.apl_id);
      if (errorUpdate) throw errorUpdate;

      console.log(delApl);

      const { data: acceptedRequest, error: requestError } = await supabase
        .from('requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);
      if (requestError) throw requestError;

      console.log(acceptedRequest, 'accepted');

      toast.add({
        severity: 'success',
        summary: `${request.modify_apl.fullName}'s request has been approved.`,
        detail: 'Accepted Deletion of Applicant.',
        life: 2000,
      });

      setTimeout(() => {
        useRequestStore().getAllRequests();
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

async function handleReject(request: Requests) {
  const { data: acceptedRequest, error: requestError } = await supabase
    .from('requests')
    .update({ status: 'rejected' })
    .eq('id', request.id);
  if (requestError) throw requestError;

  console.log(acceptedRequest, 'rejected');
  toast.add({
    severity: 'info',
    summary: `${request.modify_apl.fullName}'s request has been approved.`,
    detail: 'Rejected Modification of Applicant.',
    life: 2000,
  });

  setTimeout(() => {
    useRequestStore().getAllRequests();
  }, 2000);
}

async function handleDeleteRequest(id: string) {
  await useRequestStore().deleteRequest(id);
  toast.add({
    severity: 'success',
    summary: `Removed Request from list????.`,
    detail: ``,
    life: 2000,
  });

  useRequestStore().getAllRequests();
}

const handleViewRequest = (request: Requests) => {
  useRequestStore().setCurrentRequest(request);
  router.push({ name: 'ViewRequest', params: { id: request.user_id } });
};

const avatarSrc = (path: string | undefined) => {
  if (!path) {
    return 'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/avatar.svg';
  } else {
    return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/applicants/${path}`;
  }
};

const userAvatarSrc = (path: string | undefined) => {
  if (!path) {
    return 'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg';
  } else {
    return `https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/${path}`;
  }
};
</script>

<template>
  <div
    class="flex-1 p-3 bg-indigo-100 border-none rounded-3xl max-h-full flex gap-3 w-full"
  >
    <Toast />
    <div
      class="chamber flex flex-col w-full rounded-3xl p-3 shadow-2xl bg-gray-50 overflow-y-scroll gap-3"
    >
      <div class="w-full">
        <h1
          class="text-center text-[2em] mb-5 bg-indigo-500 text-white rounded-lg font-bold"
        >
          Review Requests
        </h1>
        <table class="table w-full" v-if="requests!.length > 0">
          <!-- head -->
          <thead>
            <tr>
              <th class="text-lg">#</th>
              <th class="text-lg">Avatar</th>
              <th class="text-lg">Applicant Name</th>
              <th class="text-lg max-w-[200px]">Request Reason</th>
              <th class="text-lg">Status</th>
              <th class="text-lg">Modify Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(request, index) in requests" :key="index">
              <td>
                <div class="index text-center">{{ index + 1 }}</div>
              </td>
              <td>
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img
                      :src="avatarSrc(request.modify_apl.aplImg_path.primePath![0])"
                      alt="Primary Apl Image"
                    />
                  </div>
                </div>
              </td>
              <td>
                <div class="flex items-center space-x-3">
                  <div>
                    <div class="font-bold">
                      <!-- {{ getAplInfo(request.apl_id).fullName }} -->
                      {{ request.modify_apl.fullName }}
                    </div>
                    <div class="text-sm opacity-50"></div>
                    <Chip
                      :label="`Applied by ${
                        getUser4AplInfo(request.user_id)!.username
                      }`"
                      :image="userAvatarSrc(getUser4AplInfo(request.user_id!)?.avatar_path!)"
                      class="h-[25px] mr-2 font-extrabold text-sm my-2 font-Outfit"
                    />
                  </div>
                </div>
              </td>
              <td class="">
                <div class="min-w-[100px] max-w-[300px] truncate">
                  {{ request.reason_body }}
                </div>
              </td>
              <td class="">
                <span :class="useRequestStore().status_class(request.status)">{{
                  request.status
                }}</span>
              </td>
              <td class="text-center uppercase">
                {{ request.modify_type }}
              </td>
              <td class="">
                <!-- <Button
                  class="p-button-rounded bg-purple-500 self-center"
                  icon="pi
                        pi-search"
                /> -->
                <SplitButton
                  v-if="request.status == 'pending'"
                  label="View"
                  icon="pi pi-search"
                  @click="handleViewRequest(request)"
                  :model="[
                    {
                      label: 'Approve',
                      icon: 'pi pi-check',
                      command: () => {
                        handleApprove(request);
                      },
                    },
                    {
                      label: 'Reject',
                      icon: 'pi pi-times',
                      command: () => {
                        handleReject(request);
                      },
                    },
                  ]"
                  class="p-button-rounded p-button-help mb-2"
                ></SplitButton>

                <Button
                  v-else
                  label="Close"
                  @click="handleDeleteRequest(request.id)"
                  icon="pi pi-times"
                  class="p-button-rounded p-button-danger w-full"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div
          class="w-full min-h-full grid place-items-center font-bold text-[2.5em]"
          v-if="requests!.length == 0"
        >
          <span> No Requests Yet! </span>
        </div>
      </div>
    </div>
  </div>
</template>
