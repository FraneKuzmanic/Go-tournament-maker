<template>
  <!-- Zamisao je da ova komponenta drzi info o igracima i da ima fini render na razlicitim velicinama ekrana -->
    <div class="main_container">
      <div class="player-edit-buttons">
        <q-btn
          class="q-ml-sm q-mr-sm"
          @click.stop
          round
          color="blue"
          icon="edit"
          dense
          @click="$emit('editPlayer')"
        />
        <q-btn
          class="q-ml-sm q-mr-sm"
          @click.stop
          round
          color="blue"
          icon="delete"
          dense
          @click="$emit('deltePlayer')"
        />
      </div>

      <div class="player-name_lastname">
        <p> {{ player_name }} </p> 
        <p>{{ player_lastname }}</p>
      </div>

      <div class="rating">
        <p> {{ player_rating }} </p>
      </div>

      <div class="stone-advantage-count">
        <p>adv:</p>
        <p>{{ stone_advantage }}</p>
      </div>
    </div>
</template>
  
<script>
  export default {
    emits: ['editPlayer', 'deltePlayer'],
    props: {
    player_name: String,
    player_lastname: String,
    player_rating: String,
    points: Number,
    stone_advantage: Number,
    background_color: String
  },
    return: {},
  };
</script>
  
<style scoped>
.main_container {
  width: 90%;
  min-height: 50px;
  background-color: rgb(37, 124, 159);
  margin-top: 1em;
  margin-bottom: 1em;
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;  
}

.player-edit-buttons {
  width: 30px;
}

.player-name_lastname {
  flex: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: brown;
}

.stone-advantage-count {
  flex: 1;
}


</style>
  