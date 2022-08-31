import { defineStore } from 'pinia';
import { supabase } from '../supabase/supabase';
import { ref, Ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { v4 as uuidv4 } from 'uuid';
import { DefaultProfile, ProfileData } from '../interfaces/interfaces';
import { _Null } from '../types/types';

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(useStorage<ProfileData>('profile', null));
  const path = ref<string>('');
  const files = ref<File[]>([]);
  const uploading = ref<boolean>(false);
  const isNotFound = ref<boolean>(false);
  const Users: Ref<ProfileData[]> = ref([]);
  const role = ref(useStorage<boolean>('role', null));
  const placeholder_avatar: string =
    'https://bwisulfnifauhpelglgh.supabase.co/storage/v1/object/public/avatars/avatar.svg';

  const fd = (date: Date) => {
    let today = date;
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    return dd + '-' + mm + '-' + yyyy;
  };

  // computed

  const url = computed<_Null<string>>(() =>
    profile.value ? profile.value.avatar_url : placeholder_avatar
  );

  const username = computed(() =>
    profile.value ? profile.value.username : 'user'
  );
  const fullname = computed(() =>
    profile.value ? profile.value.full_name : 'User'
  );

  const reset = () => {
    profile.value = null;
    path.value = '';
    files.value = [];
    uploading.value = false;
    isNotFound.value = false;
  };

  const setProfile = (val: ProfileData) => {
    profile.value = val;
  };

  const setRole = (val: string) => {
    if (val == 'user') {
      role.value = true;
    } else {
      role.value = false;
    }
  };

  const getProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabase.auth.user()!.id);
      if (error) throw error;
      setProfile(data[0]);
    } catch (err: any) {
      console.trace(err.message);
    }
  };

  const getUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      const regularUsers = data.filter(x => x.role);
      Users.value = regularUsers;
    } catch (err: any) {
      console.trace(err.message);
    }
  };

  const updateProfile = async (val: object) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(val)
        .eq('id', supabase.auth.user()!.id);
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.trace(err.message);
    }
  };

  const checkForProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabase.auth.user()!.id);
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.log(err.message);
    }
  };

  // const DefaultProfile: DefaultProfile = {
  //   // id: supabase.auth.user()!.id,
  //   full_name: 'User',
  //   username: 'user',
  //   email: supabase.auth.user()!.email,
  //   role: true,
  // };
  const insertDefaultProfile = async (val: DefaultProfile[]) => {
    try {
      const { data, error } = await supabase.from('profiles').insert(val);
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const uploadAvatar = async (evt: any) => {
    files.value = evt.files;
    const file = files.value[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    path.value = `${supabase.auth.user()!.id}/${filePath}`;

    try {
      uploading.value = true;
      if (!files.value || files.value.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      profile.value.avatar_url = null;

      let { data, error } = await supabase.storage
        .from('avatars')
        .upload(path.value, file);
      if (data) {
        let URL = await getPublicURL(path.value);
        let info = await updateProfile({
          avatar_url: URL,
          avatar_path: path.value,
        });
        profile.value.avatar_url = info![0].avatar_url;
      }
      return true;
    } catch (error: any) {
      uploading.value = false;
      alert(error.message);
      return false;
    } finally {
      uploading.value = false;
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
    const file = files.value[0];
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
      let info = await updateProfile({
        avatar_url: URL,
      });
      profile.value.avatar_url = info![0].avatar_url;
    } catch (err: any) {
      console.trace(err.message);
    }
  };

  return {
    profile,
    path,
    files,
    uploading,
    isNotFound,
    fd,
    role,
    setRole,
    updateProfile,
    insertDefaultProfile,
    checkForProfile,
    uploadAvatar,
    getPublicURL,
    reset,
    getProfile,
    setProfile,
    url,
    username,
    fullname,
    updateAvatar,
    getUsers,
    Users,
  };
});
