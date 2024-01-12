<template>
  <!-- Zamisao je da ova komponenta drzi info o igracima i da ima fini render na razlicitim velicinama ekrana -->
    <div class="main_container">
      <div class="player-info">
        <p style="text-align:center"> {{ player_name }} {{ player_lastname }}, {{ player_rating }}</p>
      </div>
      <div class="player-edit-buttons">
        <q-btn
          class="q-ml-sm q-mr-sm"
          @click.stop
          round
          color="blue"
          icon="edit"
          dense
        />
        <q-btn
          class="q-ml-sm q-mr-sm"
          @click.stop
          round
          color="blue"
          icon="delete"
          dense
        />
      </div>
    </div>
</template>
  
<script>

  export default {
    props: {
    player_name: String,
    player_lastname: String,
    player_rating: String,
  },
    return: {},
  };
</script>
  
<style scoped>
.main_container {
  width: 100%;
  background-color: darkorange;
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;  
}

.player-info {
  align-self: center;
  text-align: center;
  background-color: blueviolet;
}

</style>
  