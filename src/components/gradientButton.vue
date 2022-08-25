<template>
  <button
    class="w-max h-[40px] px-4 py-2 text-white bg-indigo-600 text-[1.3em] focus:ring focus-ring-indigo-400 font-extrabold duration-100 ease-linear transition-all rounded-lg cursor-pointer hover:rounded-2xl hover:border-[2px] hover:bg-opacity-0 hover:border-purple-600 hover:text-purple-600 flex justify-center items-center font-Outfit"
  >
    <slot />
    <slot name="loading" />
  </button>
</template>
