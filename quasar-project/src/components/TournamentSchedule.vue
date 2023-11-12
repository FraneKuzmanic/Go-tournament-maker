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
          <li @click="updateMatchups" :id="player.id" > 
            {{ player.name }} {{ player.lastname }}, {{ player.rating }}
          </li>
        </template>
      </draggable>
    </div>

    <div class="player-group" id="right-column">
      <draggable
        v-model="playersColumnRight"
        tag="ul"
        group="players"
        item-key="id"
      >
        <template #item="{ element: player }">
          <li :id="player.id">{{ player.name }} {{ player.lastname }}, {{ player.rating }}</li>
        </template>
      </draggable>
    </div>
  </div>

  <div id="unmatched-drawer">
    <div class="player-group" id="unmatched-column">
      <draggable
        v-model="unmatchedPlayers"
        tag="ul"
        group="players"
        item-key="id"
      >
        <template #item="{ element: player }" >
          <li :id="player.id">{{ player.name }} {{ player.lastname }}, {{ player.rating }}</li>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts">
//Ovo je Gabrijele tvoja komponenta,samo sam je preimenova
import { defineComponent, ref, Ref, watch } from 'vue';
import { onMounted } from 'vue'; // Import onMounted from Vue 3
import draggable from 'vuedraggable';
import { Player, Matchup } from 'src/models/models';
import { usePlayersStore } from 'app/utils/store';

export default defineComponent({
  name: 'TournamentSchedule',
  components: { draggable: draggable },
  setup() {
    const store = usePlayersStore();

    const playersColumnLeft: Ref<Player[]> = ref([]); //doda sam ove Ref<> oznake radi typescripta,a i smanjujemo sansu za pogrijesit jer nas tako typescript cuva, ili nazivcira

    const playersColumnRight: Ref<Player[]> = ref([]);

    const unmatchedPlayers: Ref<Player[]> = ref([]);
    // Have all the players in one array
    // Make the first split of arrays to be computed

    const matchups: Ref<Matchup[]> = ref([]);

    onMounted(async (): Promise<void> => {
      //prilikom ucitavanja komponente dohvacaju se svi igraci iz store-a i  stavljaju u unmatched players
      unmatchedPlayers.value = store.players; //kasnije cemo smislit kako cemo pamtit parove i kola, zasad se sve stavlja u unmatched na pocetku
    });

    watch(
      () => store.players,
      () => {
        updatePlayers(); //ova watch funkcija dolazi iz samo vue-a i ona prati stanje igraca, kad god se promjeni stanje igraca, npr doda ili makne igrac, aktivirat ce funkcija updatePlayers()
      }
    )
  

    const updatePlayers = () => {
      //ova funkcija bi na svaku promjenu s igracima(dodavanje,uklanjanje,premjestanje) trebala azurirati state ove komponente i preraspodijeliti u kojem se stupcu koji igraci nalaze, medjutim trenutno nije potpuno ispravna
      unmatchedPlayers.value = store.players;
      const playersIds = store.players.map((player: Player) => player.id);
      playersColumnLeft.value = playersColumnLeft.value.filter(
        (player: Player) => playersIds.includes(player.id)
      );
      playersColumnRight.value = playersColumnRight.value.filter(
        (player: Player) => playersIds.includes(player.id)
      );
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
          playerOne: playersColumnLeft.value[i],
          playerTwo: playersColumnRight.value[i],
        };
      }

      console.log(_matchups);
      matchups.value = _matchups;
    };

    return {
      playersColumnLeft,
      playersColumnRight,
      unmatchedPlayers,
      updateMatchups,
      matchups,
    };
  },
});
</script>
