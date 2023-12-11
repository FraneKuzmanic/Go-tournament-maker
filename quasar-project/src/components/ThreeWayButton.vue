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
            {label: 'winnerP1', value: '+1'},
            {label: 'Draw', value: '+0.5/ +0.5'},
            {label: 'winnerP2', value: '+2'}
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
  