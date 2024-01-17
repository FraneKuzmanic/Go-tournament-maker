<template>

    <div class="player-card-container" :style="{ backgroundColor: color }">
        <div class="player-info">
            {{ player_name }} {{ player_lastname }},
            {{ player_rating }}
        </div>
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PlayerCardRight',
  props: {
    player_name: String,
    player_lastname: String,
    player_rating: String,
    player_points: Number,
    color: String
  },
  emits: ['editPlayer', 'deletePlayer'],
  setup(props, context) {
    
    return {
      
    };
  },
});
</script>

<style scoped>

.player-card-container {
    background-color: coral;
    border-radius: 15px;
    display: flex;
    width: 100%;
    margin-top: 2em;
    margin-bottom: 2em;
    justify-content: flex-end;
    height: 70px;
}

.player-info {
    align-self: center;
    padding-right: 1em;
}

.options-button {
    padding: 0;
    margin: 0;
}

</style>