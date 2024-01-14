<template>
  <!-- Dakle, kad se klikne na lijevi ili desni buton, onda se rendera njegova aktivna opcija,
      kad se klikne na buton opet, onda se rendera njegova neaktivna opcija. Pri prijelazu iz neaktivne
      u aktivnu, okida se event pobjede, inace ne. Ugradio sam i check da ako je pobjednik vec odredjen
      da se ne moze kliknuti da je drugi pobjedio, niti izmjeniti koju je boju igrao. Lijevi i desni
      buton ostaju u stanju u kojem su bili dok se ne kliknu opet, srednji buton samo bljesne da se zna da se
      kliknuo.-->
  <div class="outcome-buttons-container">
    <div v-if="!leftButtonPressed" class="inactive-outcome-button" id="outcome-left"
      @click="$emit('playerOneWon'); rightButtonPressed ? console.log('No') : leftButtonPressed = !leftButtonPressed">
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
    <div v-if="leftButtonPressed" class="active-outcome-button" id="outcome-left" @click="leftButtonPressed = !leftButtonPressed">
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>

    <div v-if="!middleButtonPressed" class="inactive-outcome-button" id="outcome-middle" 
    @click="!(leftButtonPressed || rightButtonPressed) ? $emit('switchColumns') : console.log('Nope.');
    handleMiddleButtonClick()"
    >
      <i class="fa-solid fa-rotate fa-2xl"></i>
    </div>
    <div v-if="middleButtonPressed" class="active-outcome-button" id="outcome-middle">
      <i class="fa-solid fa-rotate fa-2xl"></i>
    </div>

    <div v-if="!rightButtonPressed" class="inactive-outcome-button" id="outcome-right" 
      @click="$emit('playerTwoWon'); leftButtonPressed ? console.log('No') : rightButtonPressed = !rightButtonPressed;">
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
    <div v-if="rightButtonPressed" class="active-outcome-button" id="outcome-right" @click="rightButtonPressed = !rightButtonPressed">
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['playerOneWon', 'playerTwoWon', 'switchColumns'],
  data(){
    return {
      leftButtonPressed: false,
      middleButtonPressed: false,
      rightButtonPressed: false,
    }
  },
  methods: {
    middleButtonClickEffect(){
      this.middleButtonPressed = true

      setTimeout(() => {
        this.middleButtonPressed = false
      }, 100);
    },
    handleMiddleButtonClick(){
      !(this.leftButtonPressed || this.rightButtonPressed) ? this.middleButtonClickEffect(): console.log('nah')  
    }
  },
  return: {},
};
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
