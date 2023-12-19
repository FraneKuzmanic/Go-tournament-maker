<template>
  <div class="outcome-container">
    <div
      class="outcome-button"
      id="outcome-left"
      @click="$emit('playerOneWon')"
    >
      +1
    </div>
    <div class="outcome-button" id="outcome-middle" @click="$emit('draw')">
      +0.5/+0.5
    </div>
    <div
      class="outcome-button"
      id="outcome-right"
      @click="$emit('playerTwoWon')"
    >
      +1
    </div>
  </div>
</template>

<script>
export default {
  emits: ['playerOneWon', 'playerTwoWon', 'draw'],
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
