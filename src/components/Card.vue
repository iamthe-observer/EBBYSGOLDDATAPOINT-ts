<template>
  <div
    class="flex rounded-xl w-full gap-[15px] items-center bg-white shadow-2xl p-3 max-w-full"
  >
    <slot name="icon" />
    <slot name="body" />
    <slot name="openModalIcon" />
    <slot name="modal" />
  </div>
</template>
