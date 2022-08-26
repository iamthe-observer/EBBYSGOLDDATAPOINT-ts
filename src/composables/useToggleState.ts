import { ref } from 'vue';

export function useToggleState() {
  const state = ref(false);

  function toggleState(): void {
    state.value = !state.value;
  }
  return {
    state,
    toggleState,
  };
}
