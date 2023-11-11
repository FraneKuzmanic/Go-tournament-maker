<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//OVA KOMPONENTA JE DEFAULTNA AL SAM JE OSTAVIJA JER ETO AKO POGRJESITE RUTU BAR SE NE CRVENI SVE
//NEGO VAS NA STILIZIRANI I UMIRUJUC NACIN PODSJECA DA STE  POGRIJESILI

export default defineComponent({
  name: 'ErrorNotFound',
});
</script>
