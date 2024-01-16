<template>
  <!-- Dakle, kad se klikne na lijevi ili desni buton, onda se rendera njegova aktivna opcija,
      kad se klikne na buton opet, onda se rendera njegova neaktivna opcija. Pri prijelazu iz neaktivne
      u aktivnu, okida se event pobjede, inace ne. Ugradio sam i check da ako je pobjednik vec odredjen
      da se ne moze kliknuti da je drugi pobjedio, niti izmjeniti koju je boju igrao. Lijevi i desni
      buton ostaju u stanju u kojem su bili dok se ne kliknu opet, srednji buton samo bljesne da se zna da se
      kliknuo.-->
  <div class="outcome-buttons-container">
    <div
      v-if="!leftButtonPressed"
      class="inactive-outcome-button"
      id="outcome-left"
      @click="handleLeftClickActive()"
    >
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
    <div
      v-if="leftButtonPressed"
      class="active-outcome-button"
      id="outcome-left"
      @click="handleLeftClickInactive()"
    >
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>

    <div
      v-if="!middleButtonPressed"
      class="inactive-outcome-button"
      id="outcome-middle"
      @click="handleMiddleButtonClick()"
    >
      <i class="fa-solid fa-rotate fa-2xl"></i>
    </div>
    <div
      v-if="middleButtonPressed"
      class="active-outcome-button"
      id="outcome-middle"
    >
      <i class="fa-solid fa-rotate fa-2xl"></i>
    </div>

    <div
      v-if="!rightButtonPressed"
      class="inactive-outcome-button"
      id="outcome-right"
      @click="handleRightClickActive()"
    >
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
    <div
      v-if="rightButtonPressed"
      class="active-outcome-button"
      id="outcome-right"
      @click="handleRightClickInactive()"
    >
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';

export default defineComponent({
  name: 'OutcomeButton',
  props: {
    leftPlayerWon: {
      type: Boolean,
      required: true,
    },
    rightPlayerWon: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['playerOneWon', 'playerTwoWon', 'switchColumns', 'cancelWin'],
  setup(props, context) {
    const middleButtonPressed: Ref<boolean> = ref(false);
    const leftButtonPressed: Ref<boolean> = ref(props.leftPlayerWon);
    const rightButtonPressed: Ref<boolean> = ref(props.rightPlayerWon);

    function handleMiddleButtonClick() {
      if (!(leftButtonPressed.value || rightButtonPressed.value)) {
        context.emit('switchColumns');
        middleButtonClickEffect();
      }
    }

    function middleButtonClickEffect() {
      middleButtonPressed.value = true;

      setTimeout(() => {
        middleButtonPressed.value = false;
      }, 100);
    }

    function handleLeftClickActive() {
      if (!rightButtonPressed.value) {
        context.emit('playerOneWon');
        leftButtonPressed.value = !leftButtonPressed.value;
        rightButtonPressed.value
          ? (rightButtonPressed.value = !rightButtonPressed.value)
          : '';
      }
    }

    function handleRightClickActive() {
      if (!leftButtonPressed.value) {
        context.emit('playerTwoWon');
        rightButtonPressed.value = !rightButtonPressed.value;
        leftButtonPressed.value
          ? (leftButtonPressed.value = !leftButtonPressed.value)
          : '';
      }
    }

    function handleLeftClickInactive() {
      leftButtonPressed.value = !leftButtonPressed.value;
      context.emit('cancelWin');
    }

    function handleRightClickInactive() {
      rightButtonPressed.value = !rightButtonPressed.value;
      context.emit('cancelWin');
    }

    return {
      middleButtonPressed,
      leftButtonPressed,
      rightButtonPressed,
      handleMiddleButtonClick,
      handleLeftClickActive,
      handleRightClickActive,
      handleLeftClickInactive,
      handleRightClickInactive,
    };
  },
});
</script>

<style scoped>
.outcome-buttons-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: 50px;
  width: 100%;
  margin-top: 2em;
  margin-bottom: 2em;
}

.inactive-outcome-button {
  width: 30%;
  background-color: rgb(44, 51, 66);
  display: flex;
  justify-content: center;
  align-items: center;
}

.active-outcome-button {
  width: 30%;
  background-color: rgb(255, 135, 6);
  display: flex;
  justify-content: center;
  align-items: center;
}

i {
  color: rgb(101, 116, 151);
}

.inactive-outcome-button:hover {
  background-color: rgb(174, 231, 247);
}

.active-outcome-button i {
  color: whitesmoke;
}

#outcome-left {
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
}

#outcome-right {
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
}
</style>
