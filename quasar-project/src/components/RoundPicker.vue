<template>
    <div class="q-pa-md">
      <div class="q-gutter-y-md" >

  
        <q-tabs
          v-model="tab"
          no-caps
          class="bg-black text-white shadow-2"
        >
          <q-tab name="prvoKolo" label="Prvo Kolo" />
          <q-tab name="drugoKolo" label="Drugo Kolo" />
          <q-tab name="trećeKolo" label="Treće Kolo" />
        </q-tabs>
  
 
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue'
  
  export default defineComponent({
  name: 'RoundPicker',
  components: {
},
  props: {
    tournamentId: {
      type: String,
      required: true,
    },
  },
  setup () {
    return {
      tab: ref('mails')
    }
  },
});
  
  </script>
