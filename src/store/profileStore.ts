import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  ProfileData,
  DefaultProfile,
  Applicant,
} from '../interfaces/interfaces';
import { supabase } from '../supabase/supabase';
import { _Null } from '../types/types';
import useErrorHandle from '../composables/useErrorHandle';
import { v4 as uuidv4 } from 'uuid';

export const useProfileStore = defineStore('profile', () => {
  const active_profile = ref(useStorage<ProfileData>('profile', null));
  const profiles_loading = ref(false);
  const user_profiles = ref<_Null<ProfileData[]>>(null);
  const profile_pic_uploading = ref(false);
  const pic_file = ref<File>();
  const view_user_data = ref<{ profile: ProfileData; apls: Applicant[] }>();
  const DefaultProfile: Partial<DefaultProfile> = {
    id: supabase.auth.user()?.id,
    full_name: 'User',
    username: 'user',
    email: supabase.auth.user()?.email,
    role: true,
  };

  // methods
  const reset = () => {
    active_profile.value = null;
    profiles_loading.value = false;
  };

  const setActiveProfile = (val: ProfileData[]) => {
    active_profile.value = val[0];
  };

  const getUserProfileByUserId = async (user_id: string) => {
    profiles_loading.value = true;
    try {
      let { data, error } = await supabase
        .from<ProfileData>('profiles')
        .select('*')
        .eq('id', user_id);

      if (error) throw error;
      profiles_loading.value = false;
      return { data, error };
    } catch (err: any) {
      profiles_loading.value = false;
      return useErrorHandle(err, profiles_loading.value);
    }
  };

  const set_UserProfiles = (val: ProfileData[]) => {
    user_profiles.value = val;
  };
  const getUserProfiles = async () => {
    profiles_loading.value = true;
    try {
      let { data, error } = await supabase
        .from<ProfileData>('profiles')
        .select('*');
      if (error) throw error;

      profiles_loading.value = false;
      const regular_users = data?.filter(x => x.role);
      return { regular_users, error };
    } catch (err: any) {
      profiles_loading.value = false;
      return useErrorHandle(err, profiles_loading.value);
    }
  };

  const updateProfile = async (profileData: object, user_id: string) => {
    profiles_loading.value = true;
    try {
      let { data, error } = await supabase
        .from<ProfileData>('profiles')
        .update(profileData)
        .eq('id', user_id);

      if (error) throw error;
      profiles_loading.value = false;
      return { data, error };
    } catch (err: any) {
      profiles_loading.value = false;
      return useErrorHandle(err, profiles_loading.value);
    }
  };

  const checkForValidProfile = async () => {
    try {
      let { data, error } = await supabase
        .from<ProfileData>('profiles')
        .select('*');
      if (error) throw error;
      if (data?.length) return { data, ifProfile: true, error };
    } catch (err: any) {
      return useErrorHandle(err, profiles_loading.value);
    }
  };

  const insertDefaultProfile = async (profile: DefaultProfile[]) => {
    try {
      let { data, error } = await supabase.from('profiles').insert(profile);
      return { data, error };
    } catch (err: any) {
      return useErrorHandle(err, profiles_loading.value);
    }
  };

  const fd = (date: Date) => {
    let today = date;
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    return dd + '-' + mm + '-' + yyyy;
  };

  // const uploadProfilePic = async (path: string, file: File) => {
  //   profile_pic_uploading.value = true;
  //   try {
  //     const { data, error } = await supabase.storage
  //       .from('avatars')
  //       .upload(path, file);
  //     profile_pic_uploading.value = false;
  //   } catch (err) {
  //     useErrorHandle(err, profile_pic_uploading.value);
  //   }
  // };

  const files = ref<File[]>();
  const path = ref<string>();

  const uploadAvatar = async (evt: any) => {
    files.value = evt.files;
    const file = files?.value![0];
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    path.value = `${supabase.auth.user()!.id}/${filePath}`;

    try {
      profile_pic_uploading.value = true;
      if (!files.value || files.value.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      active_profile.value.avatar_url = null;

      let { data, error } = await supabase.storage
        .from('avatars')
        .upload(path.value, file);
      if (data) {
        let URL = await getPublicURL(path.value);
        let info = await updateProfile(
          {
            avatar_url: URL,
            avatar_path: path.value,
          },
          active_profile.value.id
        );
        active_profile.value.avatar_url = info?.data![0].avatar_url;
      }
      return true;
    } catch (error: any) {
      profile_pic_uploading.value = false;
      alert(error.message);
      return false;
    } finally {
      profile_pic_uploading.value = false;
    }
  };

  const getPublicURL = async (path: string) => {
    try {
      const { publicURL, error } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);
      if (error) throw error;
      return publicURL;
    } catch (err: any) {
      console.trace(err.message);
    }
  };

  const updateAvatar = async (evt: any) => {
    files.value = evt.files;
    const file = files.value![0];
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar.${fileExt}`;
    const filePath = `${fileName}`;
    path.value = `${supabase.auth.user()!.id}/${filePath}`;
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .update(path.value, file, {
          cacheControl: '1',
          upsert: true,
        });
      if (error) throw error;

      let URL = await getPublicURL(path.value);
      let info = await updateProfile(
        {
          avatar_url: URL,
        },
        active_profile.value.id
      );
      active_profile.value.avatar_url = info?.data![0].avatar_url;
    } catch (err: any) {
      console.trace(err.message);
    }
  };

  const setUserData = (data: { profile: ProfileData; apls: Applicant[] }) => {
    view_user_data.value = data;
  };

  // computed
  const url = computed<_Null<string> | undefined>(() => {
    return active_profile.value
      ? active_profile.value.avatar_url
      : placeholder_avatar;
  });

  const role = computed(() => {
    if (!active_profile.value) return true;
    return active_profile.value.role;
  });

  const placeholder_avatar: string =
    'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg';

  return {
    placeholder_avatar,
    profiles_loading,
    view_user_data,
    DefaultProfile,
    active_profile,
    user_profiles,
    role,
    url,
    fd,
    reset,
    setUserData,
    updateProfile,
    getPublicURL,
    uploadAvatar,
    updateAvatar,
    getUserProfiles,
    set_UserProfiles,
    setActiveProfile,
    checkForValidProfile,
    insertDefaultProfile,
    getUserProfileByUserId,
  };
});
