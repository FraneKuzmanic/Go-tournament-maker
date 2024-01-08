<template>
  <div class="q-pa-md">
    <q-badge v-if="standard < 0" color="blue">
      Current: {{ Math.abs(standard) }}k Choose the rating
    </q-badge>
    <q-badge v-else color="blue">
      Current: {{ Math.abs(standard) }}d Choose the rating
    </q-badge>

    <q-slider
      v-model="standard"
      :min="-30"
      :max="5"
      :step="1"
      snap
      label
      :label-value="Math.abs(standard)"
      color="blue"
      track-color="green"
    />
    <q-btn @click="changeColor" label="Potvrdi"></q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch } from 'vue';
import { Player } from 'src/models/models';
import {
  addNewPlayer,
  getTournamentPlayers,
  removePlayer,
} from 'src/firebase/init';
import { Color, useQuasar } from 'quasar';
import { usePlayersStore } from 'app/utils/store';

export default defineComponent({
  name: 'colorPicker',

  props: {
    tournamentId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = usePlayersStore();
    const $q = useQuasar();
    const players: Ref<Player[]> = ref([]);
    const input: Ref<number> = ref(1);
    const changeColor = async () => {
      try {
        const result = await getTournamentPlayers(
          props.tournamentId,
          store.currentRound
        );

        if (result !== undefined) {
          players.value = result;
          players.value.forEach(function (player) {
            if (input.value < 0) {
              if (
                player.rating.includes('k') &&
                parseInt(player.rating) > Math.abs(input.value)
              ) {
                savePlayer('blue', player);
                savePlayerLocal(player, 'blue');
              } else {
                savePlayer('green', player);
                savePlayerLocal(player, 'green');
              }
            } else {
              if (
                player.rating.includes('d') &&
                parseInt(player.rating) > Math.abs(input.value)
              ) {
                savePlayer('green', player);
                savePlayerLocal(player, 'green');
              } else {
                savePlayer('blue', player);
                savePlayerLocal(player, 'blue');
              }
            }
          });

          return;
        } else {
          console.error('getTournamentPlayers returned undefined');
        }
      } catch (error) {
        console.error('Error fetching tournament players:', error);
      } finally {
        showNotifAdd();
      }
    };
    function savePlayerLocal(player: Player, color: Color) {
      store.players.forEach(function (element) {
        if (element.id == player.id) {
          element.color = color;
        }
      });
    }
    async function savePlayer(color: Color, player: Player) {
      const editedPlayer: Player = {
        id: player.id,
        name: player.name,
        lastname: player.lastname,
        rating: player.rating,
        column: player.column,
        color: color,
      };
      store.editedPlayer = editedPlayer;
      await removePlayer(player, props.tournamentId, store.currentRound);
      await addNewPlayer(editedPlayer, props.tournamentId, store.currentRound);
    }
    function showNotifAdd() {
      $q.notify({
        message: 'Uspješno odabran rating',
        color: 'green',
      });
    }
    return {
      standard: ref(input),
      changeColor,
      input: input,
    };
  },
  methods: {},
});
</script>
