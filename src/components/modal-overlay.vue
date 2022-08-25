<template>
  <div class="overlay">
    <slot />
    <div id="closeModal" @click.stop="$emit('closeModal')">&times;</div>
  </div>
</template>

<style>
#closeModal {
  display: flex;
  align-items: center;
  width: 40px;
  aspect-ratio: 1;
  color: white;
  cursor: pointer;
  position: absolute;
  font-size: 2.5em;
  font-weight: 900;
  top: 20px;
  right: 20px;
}

.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.589);
}
</style>
