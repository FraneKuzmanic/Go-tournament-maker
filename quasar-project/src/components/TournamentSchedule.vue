<template>
  <meta charset="UTF8" />
  <div v-if="creatorId !== ''" class="button-container">
    <q-btn
      push
      color="white"
      text-color="primary"
      label="Generiraj parove"
      @click="generate"
      style="margin-right: 20px"
    />
    <q-btn
      push
      color="red"
      text-color="white"
      label="Ponisti parove"
      @click="removeElementsFromRightAndLeft"
    />
  </div>

    <div id="unmatched-drawer">
    <div class="player-group" id="unmatched-column">
      <draggable
        :disabled="creatorId === ''"
        v-model="unmatchedPlayers"
        tag="ul"
        group="players"
        item-key="id"
        @end="handleDragChange('unmatched')"
      >
        <template #item="{ element: player }">
          <li :id="player.id" :style="{ backgroundColor: player.color,  maxWidth: '200px' }">
            {{ player.name }} {{ player.lastname }}, {{ player.rating }}
            <q-btn
              class="q-ml-sm q-mr-sm"
              @click.stop
              round
              color="blue"
              icon="edit"
              dense
              @click="handleEditClick(player, 'unmatched')"
            />
            <q-btn
              class="q-ml-sm q-mr-sm"
              @click.stop
              round
              color="blue"
              icon="delete"
              dense
              @click="handleDeleteClick(player, 'unmatched')"
            />
          </li>
        </template>
      </draggable>
    </div>
  </div>

  <div id="main-container">
    <div class="player-group" id="left-column">
      <draggable
        :disabled="creatorId === ''"
        v-model="playersColumnLeft"
        tag="ul"
        group="players"
        item-key="id"
        @end="handleDragChange('left')"
      >
        <template #item="{ element: player }">
          <li
            :draggable="false"
            :id="player.id"
            :style="{ backgroundColor: player.color, maxWidth: '200px' }"
          >
            {{ player.name }} {{ player.lastname }}, {{ player.rating }}
            <q-btn
              v-if="creatorId !== ''"
              class="q-ml-sm q-mr-sm"
              @click.stop
              round
              color="blue"
              icon="edit"
              dense
              @click="handleEditClick(player, 'left')"
            />
            <q-btn
              v-if="creatorId !== ''"
              class="q-ml-sm q-mr-sm"
              @click.stop
              round
              color="blue"
              icon="delete"
              dense
              @click="handleDeleteClick(player, 'left')"
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
        :disabled="creatorId === ''"
        v-model="playersColumnRight"
        tag="ul"
        group="players"
        item-key="id"
        @end="handleDragChange('right')"
      >
        <template #item="{ element: player }">
          <li :id="player.id" :style="{ backgroundColor: player.color,  maxWidth: '200px' }">
            {{ player.name }} {{ player.lastname }}, {{ player.rating }}
            <q-btn
              v-if="creatorId !== ''"
              class="q-ml-sm q-mr-sm"
              @click.stop
              round
              color="blue"
              icon="edit"
              dense
              @click="handleEditClick(player, 'right')"
            />
            <q-btn
              v-if="creatorId !== ''"
              class="q-ml-sm q-mr-sm"
              @click.stop
              round
              color="blue"
              icon="delete"
              dense
              @click="handleDeleteClick(player, 'right')"
            />
          </li>
        </template>
      </draggable>
    </div>
  </div>


</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import OutcomeButton from './OutcomeButton.vue';
import { Player, Matchup } from 'src/models/models';
import { usePlayersStore } from 'app/utils/store';
import {
  removePlayer,
  updatePlayerColumn,
  getTournamentPlayers,
} from '../firebase/init';

export default defineComponent({
  name: 'TournamentSchedule',
  components: { draggable: draggable, OutcomeButton: OutcomeButton },
  props: {
    tournamentId: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = usePlayersStore();

    const editedPlayerColumn: Ref<string> = ref('');

    const playersColumnLeft: Ref<Player[]> = ref([]); //doda sam ove Ref<> oznake radi typescripta,a i smanjujemo sansu za pogrijesit jer nas tako typescript cuva, ili nazivcira

    const playersColumnRight: Ref<Player[]> = ref([]);

    const unmatchedPlayers: Ref<Player[]> = ref([]);

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

    watch(
      () => store.playerToAdd,
      () => {
        addPlayer();
      }
    );

    watch(
      () => store.currentRound,
      () => {
        getRoundPlayers();
      }
    ); //kad god se promijeni runda, moramo pozvati funkciju koja dohva asve igrace za tu rundu

    async function getRoundPlayers() {
      const tournamentPlayers = await getTournamentPlayers(
        props.tournamentId,
        store.currentRound
      ); //dohvati igrace za odredjeno kolo turnira koji su pohranjeni na firestore-u
      if (tournamentPlayers) store.setPlayers(tournamentPlayers); //postavlja igrace te se onda opet poziva funkcija updateplayers, jer se aktivirao watcher za igrače
    }

    async function changeLeftColumn(ind: number): Promise<void> {
      console.log(ind);
      const oldPlayer: Player = { ...playersColumnLeft.value[ind] };
      playersColumnLeft.value[ind].column = 'left';
      const newPlayer: Player = { ...playersColumnLeft.value[ind] };
      updatePlayerColumn(
        oldPlayer,
        newPlayer,
        props.tournamentId,
        store.currentRound
      );
    }

    async function changeRightColumn(ind: number): Promise<void> {
      console.log(ind);
      const oldPlayer: Player = { ...playersColumnRight.value[ind] };
      playersColumnRight.value[ind].column = 'right';
      const newPlayer: Player = { ...playersColumnRight.value[ind] };
      updatePlayerColumn(
        oldPlayer,
        newPlayer,
        props.tournamentId,
        store.currentRound
      );
    }

    async function changeUnmatchedColumn(ind: number): Promise<void> {
      console.log(ind);
      const oldPlayer: Player = { ...unmatchedPlayers.value[ind] };
      unmatchedPlayers.value[ind].column = 'unmatched';
      const newPlayer: Player = { ...unmatchedPlayers.value[ind] };
      updatePlayerColumn(
        oldPlayer,
        newPlayer,
        props.tournamentId,
        store.currentRound
      );
    }

    async function handleDragChange(column: string): Promise<void> {
      if (column === 'left') {
        const draggedPlayerInd = playersColumnRight.value.findIndex(
          (player) => player.column !== 'right'
        );
        if (draggedPlayerInd !== -1) changeRightColumn(draggedPlayerInd);
        else {
          const draggedPlayerInd = unmatchedPlayers.value.findIndex(
            (player) => player.column !== 'unmatched'
          );
          if (draggedPlayerInd !== -1) changeUnmatchedColumn(draggedPlayerInd);
        }
      } else if (column === 'right') {
        const draggedPlayerInd = playersColumnLeft.value.findIndex(
          (player) => player.column !== 'left'
        );
        if (draggedPlayerInd !== -1) changeLeftColumn(draggedPlayerInd);
        else {
          const draggedPlayerInd = unmatchedPlayers.value.findIndex(
            (player) => player.column !== 'unmatched'
          );
          if (draggedPlayerInd !== -1) changeUnmatchedColumn(draggedPlayerInd);
        }
      } else if (column === 'unmatched') {
        console.log('tusam');
        const draggedPlayerInd = playersColumnLeft.value.findIndex(
          (player) => player.column !== 'left'
        );
        if (draggedPlayerInd !== -1) changeLeftColumn(draggedPlayerInd);
        else {
          const draggedPlayerInd = playersColumnRight.value.findIndex(
            (player) => player.column !== 'right'
          );
          console.log('sad ovo');
          if (draggedPlayerInd !== -1) changeRightColumn(draggedPlayerInd);
        }
      }

      updateMatchups();
    }

    const handleEditClick = (player: Player, column: string) => {
      editedPlayerColumn.value = column;
      store.editPlayer(player);
    };

    const updatePlayers = () => {
      playersColumnLeft.value = []; //uvijek kada učitavam igrače iz baze u tablice prvo počistim svaku tablicu prije jer sam možda switchao između kola
      playersColumnRight.value = [];
      unmatchedPlayers.value = [];

      store.players.forEach((player) => {
        if (player.column === 'left') playersColumnLeft.value.push(player);
        else if (player.column === 'right')
          playersColumnRight.value.push(player);
        else if (player.column === 'unmatched')
          unmatchedPlayers.value.push(player);
      });

      updateMatchups();
    };

    const addPlayer = () => {
      if (store.playerToAdd) unmatchedPlayers.value.push(store.playerToAdd);
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

    async function handleDeleteClick(delPlayer: Player, column: string) {
      if (column === 'right') {
        const index = playersColumnRight.value.findIndex(
          (player) => player.id === delPlayer.id
        );
        playersColumnRight.value.splice(index, 1);
      }
      if (column === 'left') {
        const index = playersColumnLeft.value.findIndex(
          (player) => player.id === delPlayer.id
        );
        playersColumnLeft.value.splice(index, 1);
      }
      if (column === 'unmatched') {
        const index = unmatchedPlayers.value.findIndex(
          (player) => player.id === delPlayer.id
        );
        unmatchedPlayers.value.splice(index, 1);
      }
      await removePlayer(delPlayer, props.tournamentId, store.currentRound);
    }

    const generate = async () => {
      // Calculate the midpoint of the array
      const midpoint = Math.ceil(unmatchedPlayers.value.length / 2);

      // Move the first half of the players to the 'right-column'
      const rightPlayers = unmatchedPlayers.value.splice(0, midpoint);
      for (let i = 0; i < rightPlayers.length; i++) {
        console.log('Right player index:', i);
        playersColumnRight.value.push(rightPlayers[i]);
        const draggedPlayerInd = playersColumnRight.value.findIndex(
          (player) => player.column !== 'right'
        );
        await changeRightColumn(draggedPlayerInd);
      }

      // Move the second half of the players to the 'left-column'
      const leftPlayers = unmatchedPlayers.value.splice(0); // splice with no second argument removes all remaining elements
      for (let i = 0; i < leftPlayers.length; i++) {
        console.log('Left player index:', i);
        playersColumnLeft.value.push(leftPlayers[i]);
        const draggedPlayerInd = playersColumnLeft.value.findIndex(
          (player) => player.column !== 'left'
        );
        await changeLeftColumn(draggedPlayerInd);
      }

      updateMatchups();

      // Clear the 'unmatched-column'
      //unmatchedPlayers.value = [];
      //console.log(playersColumnRight.value);
      //console.log(playersColumnLeft.value);
      //console.log(unmatchedPlayers.value);
    };

    const removeElementsFromRightAndLeft = async () => {
      console.log('removeElementsFromRightAndLeft');
      for (let i = 0; i < playersColumnLeft.value.length; i++) {
        unmatchedPlayers.value.push(playersColumnLeft.value[i]);
        const draggedPlayerInd = unmatchedPlayers.value.findIndex(
          (player) => player.column !== 'unmatched'
        );
        await changeUnmatchedColumn(draggedPlayerInd);
      }
      playersColumnLeft.value = [];
      for (let i = 0; i < playersColumnRight.value.length; i++) {
        unmatchedPlayers.value.push(playersColumnRight.value[i]);
        const draggedPlayerInd = unmatchedPlayers.value.findIndex(
          (player) => player.column !== 'unmatched'
        );
        await changeUnmatchedColumn(draggedPlayerInd);
      }
      playersColumnRight.value = [];
      updateMatchups();
    };

    return {
      playersColumnLeft,
      playersColumnRight,
      unmatchedPlayers,
      updateMatchups,
      handleEditClick,
      matchups,
      num_of_matchups,
      PlayerOneWon,
      PlayerTwoWon,
      Draw,
      handleDeleteClick,
      handleDragChange,
      generate,
      removeElementsFromRightAndLeft,
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

.button-container {
  display: flex;
  justify-content: center;
  align-items: center; /* Adjust the height based on your layout */
  margin-bottom: 20px;
}
.button {
  background-color: rgba(246, 122, 21, 0.92);
  font-size: 1.5rem;
  color: white;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  width: 10vw;
  border-radius: 14px;
  border: none;
  padding: 0.7rem 1.2rem;
  max-width: 250px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 500px) {
  .button {
    font-size: 1.2rem;
    min-width: 150px;
  }
}
</style>
