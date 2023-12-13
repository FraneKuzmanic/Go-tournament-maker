<template>
    <div class="buttonContainer">
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
          { label: '+1', value: 'winnerP1' },
          { label: '+0.5/+0.5', value: 'Draw' },
          { label: '+1', value: 'winnerP2' }
        ]"
        @update:model-value="handleToggleChange"
        size="20px"
      />
    </div>
  </template>
  
  <script>
  import { ref, defineEmits } from 'vue'
  
  export default {
    emits: ['playerOneWin', 'playerTwoWin', 'draw'], // Define custom events
  
    setup(_, { emit }) {
      const onPlayerOneWon = () => {
        console.log('Player one won!')
        emit('playerOneWin') // Emit event for player one win
      }
  
      const onPlayerTwoWon = () => {
        console.log('Player two won!')
        emit('playerTwoWin') // Emit event for player two win
      }
  
      const onDraw = () => {
        console.log("It's a draw, go figure!")
        emit('draw') // Emit event for draw
      }
  
      const model = ref('winnerP1')
  
      const handleToggleChange = (value) => {
        switch (value) {
          case 'winnerP1':
            onPlayerOneWon()
            break
          case 'Draw':
            onDraw()
            break
          case 'winnerP2':
            onPlayerTwoWon()
            break
          default:
            break
        }
      }
  
      return {
        model,
        handleToggleChange
      }
    }
  }
  </script>
  
  <style scoped>
  .my-custom-toggle {
    border: 1px solid #027be3;
    margin-top: 20px;
    justify-self: center;
  }
  </style>
  