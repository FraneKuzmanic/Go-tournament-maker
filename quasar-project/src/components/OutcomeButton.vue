<template>
  <div class="outcome-container">
    <div
      class="outcome-button"
      id="outcome-left"
      @click="$emit('playerOneWon')"
    >
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
    <div class="outcome-button" id="outcome-middle" @click="$emit('switchColumns')">
      <i class="fa-solid fa-rotate fa-2xl"></i>
    </div>
    <div
      class="outcome-button"
      id="outcome-right"
      @click="$emit('playerTwoWon')"
    >
      <i class="fa-solid fa-trophy fa-2xl"></i>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['playerOneWon', 'playerTwoWon', 'switchColumns'],
  return: {},
};
</script>

<style>
.outcome-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: 50px;
  width: 80%;
  background-color: rgb(44, 51, 66);
  margin: 2rem auto;
}

.outcome-button {
  width: 30%;
  background-color: blue;
  display: flex;
  justify-content: center;
  align-items: center;
}

.outcome-button:hover {
  background-color: brown;
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
