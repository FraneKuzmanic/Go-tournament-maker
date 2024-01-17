<template>

    <div class="player-card-container" :style="{ backgroundColor: color }">
        <q-btn color="accent" round flat icon="more_vert" class="options-button">
            <q-menu cover auto-close>
                <q-list>
                    <q-item clickable>
                        <q-item-section @click="$emit('editPlayer')">Edit Player</q-item-section>
                    </q-item>
                    <q-item clickable>
                        <q-item-section @click="$emit('deletePlayer')">Remove Player</q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
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
    justify-content: space-between;
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