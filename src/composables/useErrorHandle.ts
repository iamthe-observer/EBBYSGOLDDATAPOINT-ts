import { toastOptions } from '../interfaces/interfaces';
import handleError from './handleError';

export default function useErrorHandle(err: any, loading_state: boolean) {
  let toastOptions: toastOptions = {
    severity: 'error',
    summary: 'An Error Occured.',
    detail: err.message,
    life: 4000,
  };
  const { loadingState, toast } = handleError(err, toastOptions);
  loading_state = loadingState;
  return toast;
}
