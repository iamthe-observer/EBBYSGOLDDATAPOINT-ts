import { PostgrestError } from '@supabase/postgrest-js';
import { useToast } from 'primevue/usetoast';
import { toastOptions } from '../interfaces/interfaces';

export default function (error: any, toastOptions: toastOptions) {
  const toast = useToast();
  console.log(error.message);

  return {
    loadingState: false,
    error_message: error.message,
    toast: toast.add(toastOptions),
  };
}
