<template>
  <span class="doppi-mark inline-block bg-current" aria-hidden="true" />
</template>

<style scoped>
/* The Do'ppi AI mark from logo.svg. It is painted through a mask rather than
   shown as an image so it takes the current text colour, like an icon: size it
   with width/height classes and colour it with `text-*`. */
.doppi-mark {
  mask: url("../assets/brand/logo-mark.png") center / contain no-repeat;
}
</style>
