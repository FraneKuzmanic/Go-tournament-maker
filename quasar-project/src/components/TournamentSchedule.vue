<template>
  <meta charset="UTF8" />
  <div id="main-container">
    <div class="player-group" id="left-column">
      <draggable
        v-model="playersColumnLeft"
        tag="ul"
        group="players"
        item-key="id"
      >
        <template #item="{ element: player }">
          <li @click="updateMatchups" :id="player.id">
            {{ player.name }} {{ player.lastname }}, {{ player.rating }}
            <img
              @click="
                startEditPlayer(
                  {
                    id: player.id,
                    name: player.name,
                    lastname: player.lastname,
                    rating: player.rating,
                  },
                  'left'
                )
              "
              class="edit-icon"
              src="/edit.png"
              alt="slika"
            />
          </li>
        </template>
      </draggable>
    </div>

    <div class="outcome-buttons">
      <ul>
        <li v-for="matchup in num_of_matchups" :key="matchup">
          <OutcomeButton
            @playerOneWon="PlayerOneWon(matchup)"
            @player-two-won="PlayerTwoWon(matchup)"
            @draw="Draw(matchup)"
          >
          </OutcomeButton>
        </li>
      </ul>
    </div>

    <div class="player-group" id="right-column">
      <draggable
        v-model="playersColumnRight"
        tag="ul"
        group="players"
        item-key="id"
      >
        <template #item="{ element: player }">
          <li @click="updateMatchups" :id="player.id">
            {{ player.name }} {{ player.lastname }}, {{ player.rating }}
            <img
              @click="
                startEditPlayer(
                  {
                    id: player.id,
                    name: player.name,
                    lastname: player.lastname,
                    rating: player.rating,
                  },
                  'right'
                )
              "
              class="edit-icon"
              src="/edit.png"
              alt="slika"
            />
          </li>
        </template>
      </draggable>
    </div>
  </div>

  <OutcomeButton />
  <div id="unmatched-drawer">
    <div class="player-group" id="unmatched-column">
      <draggable
        v-model="unmatchedPlayers"
        tag="ul"
        group="players"
        item-key="id"
      >
        <template #item="{ element: player }">
          <li
            :id="player.id"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            {{ player.name }} {{ player.lastname }}, {{ player.rating }}
            <img
              @click="
                startEditPlayer(
                  {
                    id: player.id,
                    name: player.name,
                    lastname: player.lastname,
                    rating: player.rating,
                  },
                  'unmatched'
                )
              "
              class="edit-icon"
              src="/edit.png"
              alt="slika"
            />
            <q-btn
              @click.stop
              round
              color="red"
              icon="delete"
              dense
              @click="handleClick(player)"
            />
          </li>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts">
//Ovo je Gabrijele tvoja komponenta,samo sam je preimenova
import { defineComponent, ref, Ref, watch, computed } from 'vue';
import { onMounted } from 'vue'; // Import onMounted from Vue 3
import draggable from 'vuedraggable';
import OutcomeButton from './OutcomeButton.vue';
import { Player, Matchup } from 'src/models/models';
import { usePlayersStore } from 'app/utils/store';
import { removePlayer } from '../firebase/init';
import { useRoute } from 'vue-router';
import { strict } from 'assert';

export default defineComponent({
  name: 'TournamentSchedule',
  components: { draggable: draggable, OutcomeButton: OutcomeButton },
  setup() {
    const store = usePlayersStore();

    const editedPlayerColumn: Ref<string> = ref('');

    const playersColumnLeft: Ref<Player[]> = ref([]); //doda sam ove Ref<> oznake radi typescripta,a i smanjujemo sansu za pogrijesit jer nas tako typescript cuva, ili nazivcira

    const playersColumnRight: Ref<Player[]> = ref([]);

    const unmatchedPlayers: Ref<Player[]> = ref([]);

    const route = useRoute();

    const matchups: Ref<Matchup[]> = ref([]);

    let num_of_matchups = computed(() => matchups.value.length);

    watch(
      () => store.players,
      () => {
        updatePlayers(); //ova watch funkcija dolazi iz samo vue-a i ona prati stanje igraca, kad god se promjeni stanje igraca, npr doda ili makne igrac, aktivirat ce funkcija updatePlayers()
      }
    );

    watch(
      () => store.editedPlayer,
      () => {
        updateEditedPlayer();
      }
    );

    const startEditPlayer = (player: Player, column: string) => {
      editedPlayerColumn.value = column;
      store.editPlayer(player);
    };

    const updatePlayers = () => {
      //ova funkcija bi na svaku promjenu s igracima(dodavanje,uklanjanje,premjestanje) trebala azurirati state ove komponente i preraspodijeliti u kojem se stupcu koji igraci nalaze
      const playerId = store.currentPlayer?.id;
      if (playerId) {
        let playerInd = playersColumnLeft.value.findIndex(
          (player) => player.id === playerId
        );
        if (playerInd !== -1) {
          playersColumnLeft.value.splice(playerInd, 1);
          return;
        }
        playerInd = playersColumnRight.value.findIndex(
          (player) => player.id === playerId
        );
        if (playerInd !== -1) {
          playersColumnRight.value.splice(playerInd, 1);
          return;
        }
        playerInd = unmatchedPlayers.value.findIndex(
          (player) => player.id === playerId
        );
        if (playerInd !== -1) {
          unmatchedPlayers.value.splice(playerInd, 1);
          return;
        } else {
          if (store.currentPlayer)
            unmatchedPlayers.value = [
              ...unmatchedPlayers.value,
              store.currentPlayer,
            ];
        }
      } else {
        unmatchedPlayers.value = store.players;
      }
      updateMatchups();
    };

    const updateEditedPlayer = () => {
      if (editedPlayerColumn.value === 'right' && store.editedPlayer) {
        const index = playersColumnRight.value.findIndex(
          (player) => player.id === store.editedPlayer?.id
        );
        playersColumnRight.value.splice(index, 1, store.editedPlayer);
      }
      if (editedPlayerColumn.value === 'left' && store.editedPlayer) {
        const index = playersColumnLeft.value.findIndex(
          (player) => player.id === store.editedPlayer?.id
        );
        playersColumnLeft.value.splice(index, 1, store.editedPlayer);
      }
      if (editedPlayerColumn.value === 'unmatched' && store.editedPlayer) {
        const index = unmatchedPlayers.value.findIndex(
          (player) => player.id === store.editedPlayer?.id
        );
        unmatchedPlayers.value.splice(index, 1, store.editedPlayer);
      }
    };

    const updateMatchups = () => {
      const _matchups: Matchup[] = [];
      const leftColumnLength = playersColumnLeft.value.length;
      const rightColumnLength = playersColumnRight.value.length;
      let shorterArray;
      //iterate over the shorter array
      if (leftColumnLength < rightColumnLength) shorterArray = leftColumnLength;
      else shorterArray = rightColumnLength;

      for (let i = 0; i < shorterArray; i++) {
        _matchups[i] = {
          id: i,
          playerOne: playersColumnLeft.value[i],
          playerTwo: playersColumnRight.value[i],
        };
      }

      console.log(_matchups);
      console.log(num_of_matchups);
      matchups.value = _matchups;
    };

    function PlayerOneWon(matchup_id: number) {
      matchup_id--;
      console.log(matchups.value[matchup_id].playerOne.name + 'won!');
    }

    function PlayerTwoWon(matchup_id: number) {
      matchup_id--;
      console.log(matchups.value[matchup_id].playerTwo.name + 'won!');
    }

    function Draw(matchup_id: number) {
      matchup_id--;
      console.log("it's a draw!, both players get half a point!");
    }

    function handleClick(player: Player) {
      const tournamentId = route.params.tournamentId;
      if (typeof tournamentId === 'string') {
        removePlayer(player, tournamentId);
      }
    }

    return {
      playersColumnLeft,
      playersColumnRight,
      unmatchedPlayers,
      updateMatchups,
      startEditPlayer,
      matchups,
      num_of_matchups,
      PlayerOneWon,
      PlayerTwoWon,
      Draw,
      handleClick,
    };
  },
});
</script>

<style>
.edit-icon {
  width: 20px;
  height: 80%;
  margin-left: 5px;
  margin-bottom: 5px;
  cursor: pointer;
}
</style>
