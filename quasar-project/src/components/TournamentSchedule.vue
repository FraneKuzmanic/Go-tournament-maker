<template>
  <meta charset="UTF8" />
  <div v-if="creatorId !== ''" class="button-container">
    <q-btn
      push
      color="primary"
      text-color="accent"
      label="Generiraj parove"
      @click="generate"
      style="margin-right: 20px"
      :disable="isLoading"
    />
    <q-btn
      push
      color="negative"
      text-color="accent"
      label="Ponisti parove"
      @click="removeElementsFromRightAndLeft"
      :disable="isLoading"
    />
  </div>

  <main :class="{ 'disable-fields': isLoading }">
    <!-- klasa 'disable-fields' onemogućuje bilo kakvu interakciju s komponentom kada je isLoading true-->
    <div id="unmatched-drawer">
      <div
        class="player-group"
        id="unmatched-column"
        style="overflow-y: scroll; max-height: 6rem"
      >
        <draggable
          :disabled="creatorId === ''"
          v-model="unmatchedPlayers"
          tag="ul"
          group="players"
          item-key="id"
          @end="handleDragChange('unmatched')"
        >
          <template #item="{ element: player }">
            <li
              :id="player.id"
              class="igrac"
              :style="{ backgroundColor: player.color }"
            >
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

    <div id="main-columns-container">
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
            <div class="player-card">
              <!-- Ovo je samo dok development traje, za sada nije spremno -->
              <!-- <PlayerCardLeft 
                :player_name="player.name"
                :player_lastname="player.lastname"
                :player_rating="player.rating"
                :points="player.num_of_wins"
                :stone_advantage="player.num_of_wins"
                @editPlayer="handleEditClick(player, 'left')"
                @deletePlayer="handleDeleteClick(player, 'left')"
              /> -->
              <li
                :draggable="false"
                :id="player.id"
                :style="{ backgroundColor: player.color }"
              >
                <div class="player-info">
                  <p> {{ player.name }} {{ player.lastname }}, {{ player.rating }}</p>
                </div>
              
              </li>
            </div>
          </template>
        </draggable>
      </div>

      <div class="outcome-buttons">
        <ul>
          <li v-for="matchupId in num_of_matchups" :key="matchupId">
            <OutcomeButton
              @playerOneWon="PlayerOneWon(matchupId)"
              @player-two-won="PlayerTwoWon(matchupId)"
              @switch-columns="SwitchColumns(matchupId)"
            >
            </OutcomeButton>
          </li>
        </ul>
      </div>

      <div class="player-group" id="right-column" style="">
        <draggable
          :disabled="creatorId === ''"
          v-model="playersColumnRight"
          tag="ul"
          group="players"
          item-key="id"
          @end="handleDragChange('right')"
        >
          <template #item="{ element: player }">
            <div class="player-card">
              <li
                :id="player.id"
                :style="{ backgroundColor: player.color }"
            >
                <div class="player-info">
                  <p> {{ player.name }} {{ player.lastname }}, {{ player.rating }}</p>
                </div>
              
              </li>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import { useQuasar } from 'quasar';
import OutcomeButton from './OutcomeButton.vue';
import { Player, Matchup } from 'src/models/models';
import { usePlayersStore } from 'app/utils/store';
import {
  removePlayer,
  updatePlayerColumn,
  getTournamentPlayers,
} from '../firebase/init';

// import PlayerCardLeft from './PlayerCardLeft.vue'

export default defineComponent({
  name: 'TournamentSchedule',
  components: { draggable: draggable, OutcomeButton: OutcomeButton},
  emits: ['update-load'],
  props: {
    tournamentId: {
      //prop za tournamentId
      type: String,
      required: true,
    },
    creatorId: {
      //prop za id kreatora turnira
      type: String,
      required: true,
    },
    isLoading: {
      //isLoading postaje true kada stisnemo gumb "generiraj parove" ili "poništi parove" te onemogućuje klikanje bilo čega na stupcima, razlog tomu je što prvo čekamo da se generiranje ili poništavanje obavi do kraja pa onda omogućujemo interakciju s tablicom jer inače je dolazilo do nepredviđenih dupliciranja igrača
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    //emit je povezan s isLoading prop-om i kada se isLoading vrijednost promijeni emit emitira taj događaj parent komponenti RoundPickeru kako bi komponenta znala da se to dogodilo i reagirala nekom funkcijom
    const store = usePlayersStore(); //ovo nam je store varijbla preko koje pristupamo playerStore-u

    const editedPlayerColumn: Ref<string> = ref('');

    const playersColumnLeft: Ref<Player[]> = ref([]); //doda sam ove Ref<> oznake radi typescripta,a i smanjujemo sansu za pogrijesit jer nas tako typescript cuva, ili nazivcira

    const playersColumnRight: Ref<Player[]> = ref([]);

    const unmatchedPlayers: Ref<Player[]> = ref([]);

    const matchups: Ref<Matchup[]> = ref([]);

    const $q = useQuasar();

    let num_of_matchups = computed(() => matchups.value.length);

    watch(
      () => store.players,
      () => {
        PutPLayersInColumns(); //ova watch funkcija dolazi iz samog vue-a i ona prati promjenu players varijable u store-u. Players varijabla u storeu nam služi samo za učitavanje igrača iz baze kada se prebacujemo s kola na kolo ili učitavamo aplikaciju
      }
    );

    watch(
      () => store.editedPlayer,
      () => {
        updateEditedPlayer(); //pratimo promjenu editedPlayer varijable u koju se sprema ažurirana verzija nekog igrača i onda s funkcijom updateEditedPlayer lokalno ažuriramo tog igrača
      }
    );

    watch(
      () => store.playerToAdd,
      () => {
        addPlayer(); //pratimo promjenu playerToAdd varijable u koju se sprema igrač koji se želi dodati, te ga onda lokalno i dodamo.
      }
    );

    watch(
      () => store.currentRound,
      () => {
        getRoundPlayers(); //pratimo promjenu currentRound varijable i kad se ona promijeni to nam je znak da trebamo dohvatiti igrače za to određeno kolo
      }
    );

    async function getRoundPlayers(): Promise<void> {
      const tournamentPlayers = await getTournamentPlayers(
        props.tournamentId,
        store.currentRound
      ); //dohvati igrace za odredjeno kolo turnira koji su pohranjeni na firestore-u
      if (tournamentPlayers) store.setPlayers(tournamentPlayers); //postavlja igrače u playerStore te se onda opet poziva funkcija updateplayers, jer se aktivirao watcher za store.players
    }

    async function changeLeftColumn(ind: number): Promise<void> {
      //ova funkcija mijenja igraču njegov column atribut u 'left' i poziva funkciju koja će tu promjenu pohraniti u firestore
      const oldPlayer: Player = { ...playersColumnLeft.value[ind] };
      playersColumnLeft.value[ind].column = 'left';
      const newPlayer: Player = { ...playersColumnLeft.value[ind] };
      await updatePlayerColumn(
        oldPlayer,
        newPlayer,
        props.tournamentId,
        store.currentRound
      );
    }

    async function changeRightColumn(ind: number): Promise<void> {
      //ova funkcija mijenja igraču njegov column atribut u 'right' i poziva funkciju koja će tu promjenu pohraniti u firestore
      const oldPlayer: Player = { ...playersColumnRight.value[ind] };
      playersColumnRight.value[ind].column = 'right';
      const newPlayer: Player = { ...playersColumnRight.value[ind] };
      await updatePlayerColumn(
        oldPlayer,
        newPlayer,
        props.tournamentId,
        store.currentRound
      );
    }

    async function changeUnmatchedColumn(ind: number): Promise<void> {
      //ova funkcija mijenja igraču njegov column atribut u 'unmatched' i poziva funkciju koja će tu promjenu pohraniti u firestore
      const oldPlayer: Player = { ...unmatchedPlayers.value[ind] };
      unmatchedPlayers.value[ind].column = 'unmatched';
      const newPlayer: Player = { ...unmatchedPlayers.value[ind] };
      await updatePlayerColumn(
        oldPlayer,
        newPlayer,
        props.tournamentId,
        store.currentRound
      );
    }

    async function handleDragChange(column: string): Promise<void> {
      //ova funkcija se aktivira kad god mišem pomaknemo nekog igrača iz jednog stupca u drugi ili kad mu promjenimo poredak unutar stupca
      //unutar funkcije detektiramo ukoliko je došlo do promjene iz jednog stupca u drugi da tu istu promjenu i spremimo
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
        const draggedPlayerInd = playersColumnLeft.value.findIndex(
          (player) => player.column !== 'left'
        );
        if (draggedPlayerInd !== -1) changeLeftColumn(draggedPlayerInd);
        else {
          const draggedPlayerInd = playersColumnRight.value.findIndex(
            (player) => player.column !== 'right'
          );
          if (draggedPlayerInd !== -1) changeRightColumn(draggedPlayerInd);
        }
      }

      updateMatchups(); //nakon svake promjene kod stupaca moramo ažurirati i matchupove jer su se možda ispremještali i neki parovi
    }

    const handleEditClick = (player: Player, column: string) => {
      //kad kliknemo na ikonicu za edit aktivira se ova funkcija
      editedPlayerColumn.value = column;
      store.editPlayer(player);
    };

    const PutPLayersInColumns = () => {
      //prilikom učitavanja apliakcije ili kola uvijek prvo učitavamo igrače u stupce
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

      const currentPlayers = [
        ...playersColumnLeft.value,
        ...playersColumnRight.value,
        ...unmatchedPlayers.value,
      ];
      store.setTablePlayers(currentPlayers); //postavljamo sve trenutne igrače u kolu u tablicu stanja igrača
      updateMatchups(); //ažuriramo i matchupove jer smo učitali igrače u stupce
    };

    const addPlayer = () => {
      //funkcija za lokalno dodavanje igrača u stupce i u tablicu stanja
      if (store.playerToAdd) unmatchedPlayers.value.push(store.playerToAdd);

      const currentPlayers = [
        ...playersColumnLeft.value,
        ...playersColumnRight.value,
        ...unmatchedPlayers.value,
      ];
      store.setTablePlayers(currentPlayers); //postavljamo opet igrače u tablicu stanja s novim igračem ovaj put
    };

    const updateEditedPlayer = () => {
      //funkcija za lokalno ažuriranje nekog igrača
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
      const currentPlayers = [
        ...playersColumnLeft.value,
        ...playersColumnRight.value,
        ...unmatchedPlayers.value,
      ];
      store.setTablePlayers(currentPlayers); //postavljamo tablicu stanja ovaj put s ažuriranim igračem
    };

    const updateMatchups = () => {
      //funkcija za stvaranje matchupova, gleda koji od dva stupca ima manje igrača i onda redom spaja igrača iz jednog s igračem iz
      //drugog stupca, ova funkcija će se morati doraditi kad budemo matchupove detaljnije radili
      const _matchups: Matchup[] = [];
      const leftColumnLength = playersColumnLeft.value.length;
      const rightColumnLength = playersColumnRight.value.length;
      let shorterArray;

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
    // --------------------------------------------- VAZNO ------------------------------------------------
    // potrebno je inicijalizirati vrijednosti played_against na prazan niz i num_of_wins na 0 pri samom dodavanju igraca. Kod sam 
    // napisao, samo ga treba odkomentirati kada se to napravi, zakomentirao sam jer inace ne radi vizualni aspekt botuna
    function PlayerOneWon(matchup_id: number) {
      var id = matchup_id-1;
      const P1 = matchups.value[id].playerOne
      const P2 = matchups.value[id].playerTwo

      // P1.num_of_wins += 1                   // Pobjedniku azuriramo broj pobjeda
      // P1.played_against.push(P2)            // Obojici igraca azuriramo protiv koga je igrao
      // P2.played_against.push(P1)
      console.log(matchups.value[id].playerOne.name + 'won!');
    }

    function PlayerTwoWon(matchup_id: number) {
      var id = matchup_id-1;
      const P1 = matchups.value[id].playerOne
      const P2 = matchups.value[id].playerTwo

      // P2.num_of_wins += 1
      // P1.played_against.push(P2)            
      // P2.played_against.push(P1)

      console.log(matchups.value[id].playerTwo.name + 'won!');
    }

    function SwitchColumns(matchup_id: number) {
      var P1: Player = matchups.value[matchup_id-1].playerOne
      var P2: Player = matchups.value[matchup_id-1].playerTwo
      
      for(var i=0; i< playersColumnLeft.value.length; i++){
        if(playersColumnLeft.value[i] === P1){
          playersColumnLeft.value[i] = P2
          break
        }
      }

      for(var i=0; i< playersColumnRight.value.length; i++){
        if(playersColumnRight.value[i] === P2){
          playersColumnRight.value[i] = P1
          break
        }
      }

      // Ovi console logs su samo za debugging, mozemo ih maknuti poslije
      console.log("This is the left column after the switch: " + playersColumnLeft.value[0].name)
      console.log("This is the right column after the switch: " + playersColumnRight.value[0].name)
      updateMatchups()
      console.log("Switched Columns!");
    }

    async function handleDeleteClick(delPlayer: Player, column: string) {
      //ova funkcija se aktivira kad stisnemo na ikonicu za brisanje, briše lokalno igrača i onda poziva funkciju za brisanje igrača u bazi
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
      const currentPlayers = [
        ...playersColumnLeft.value,
        ...playersColumnRight.value,
        ...unmatchedPlayers.value,
      ];
      store.setPlayers(currentPlayers);

      await removePlayer(delPlayer, props.tournamentId); //ažuriramo tablicu stanja ovaj put s izbrisanim igračem manje

      updateMatchups(); //dogodila se promjena u stupcima jer smo makli igrača pa treba ažurirat i parove
    }

    const generate = async (): Promise<void> => {
      //generate je funkcija koja bi trebala provoditi algoritam kad ga implementiramo
      //trenutno uzima pola igrača iz unamtched stupca i grupira parove s drugom polovicom
      if (unmatchedPlayers.value.length > 0) {
        // Calculate the midpoint of the array
        const midpoint = Math.ceil(unmatchedPlayers.value.length / 2);

        // Move the first half of the players to the 'right-column'
        const rightPlayers = unmatchedPlayers.value.splice(0, midpoint);
        for (let i = 0; i < rightPlayers.length; i++) {
          playersColumnRight.value.push(rightPlayers[i]);
        }

        // Move the second half of the players to the 'left-column'
        const leftPlayers = unmatchedPlayers.value.splice(0); // splice with no second argument removes all remaining elements
        for (let i = 0; i < leftPlayers.length; i++) {
          playersColumnLeft.value.push(leftPlayers[i]);
        }

        updateMatchups(); //budući da smo premjestili igrače u stupce lijevo ili desno sljedeći korak je pravljenje parova

        //promjenu u stupcima moramo pohraniti i u bazi, međutim taj proces može potrajati i možda ne završi a mi smo krenuli nešto drugo raditi, zato koristimo isLoading varijablu koja će onemogućiti bilo kakvu interakciju sa stupcima dok spremanje generiranih parova ne završi
        emit('update-load', !props.isLoading);
        for (const [ind, player] of playersColumnLeft.value.entries()) {
          if (player.column !== 'left') await changeLeftColumn(ind);
        }

        for (const [ind, player] of playersColumnRight.value.entries()) {
          if (player.column !== 'right') await changeRightColumn(ind);
        }
        emit('update-load', !props.isLoading);
        //kad ažuriranje završi onda isLoading postaje opet false
        //emit funkcija se koristi kako bi tu promjenu isLoading emitirali i parent komponenti RoundPicker tako da onemogući da switchamo između kola dok ne završi operacija generiranja parova

        showNotifGenerate();
      }
    };

    const removeElementsFromRightAndLeft = async (): Promise<void> => {
      //ova funkcija služi za poništavanje parova, sve parove prebacuje u unmatched column
      if (
        playersColumnLeft.value.length > 0 ||
        playersColumnRight.value.length > 0
      ) {
        for (let i = 0; i < playersColumnLeft.value.length; i++) {
          unmatchedPlayers.value.push(playersColumnLeft.value[i]);
        }
        playersColumnLeft.value = [];
        for (let i = 0; i < playersColumnRight.value.length; i++) {
          unmatchedPlayers.value.push(playersColumnRight.value[i]);
        }
        playersColumnRight.value = [];

        updateMatchups(); //ažuriranje matchupova mora slijediti budući da smo poništili igrače iz stupaca

        emit('update-load', !props.isLoading);
        for (const [ind, player] of unmatchedPlayers.value.entries()) {
          if (player.column !== 'unmatched') await changeUnmatchedColumn(ind);
        }
        emit('update-load', !props.isLoading);
        //isto kao i kod funkcije generate, koristimo emitiranje i koristimo isLoading prop pa pogledajte kako sam to tamo objasnio

        showNotifCancel();
      }
    };

    function showNotifGenerate() {
      $q.notify({
        message: 'Uspješno izgenerirani parovi',
        color: 'green',
      });
    }

    function showNotifCancel() {
      $q.notify({
        message: 'Parovi poništeni',
        color: 'red',
      });
    }

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
      SwitchColumns,
      handleDeleteClick,
      handleDragChange,
      generate,
      removeElementsFromRightAndLeft,
    };
  },
});
</script>

<style>
.disable-fields {
  opacity: 0.8;
  pointer-events: none;
}

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
