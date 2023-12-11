<template>
      <div>
        <q-btn-toggle
          v-model="model"
          class="my-custom-toggle"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="[
            {label: '+1', value: 'winnerP1'},
            {label: '+0.5/+0.5', value: 'Draw'},
            {label: '+1', value: 'winnerP2'}
          ]"
        />
      </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  
  export default {
    setup () {
      return {
        model: ref('one')
      }
    }
  }
  </script>
  
  <style scoped>
  .my-custom-toggle {
      border: 1px solid #027be3;
  }
  </style>
  