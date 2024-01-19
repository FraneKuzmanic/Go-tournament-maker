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
          :disabled="creatorId === '' || isLoading"
          v-model="playersColumnLeft"
          tag="ul"
          group="players"
          item-key="id"
          @end="handleDragChange('left')"
        >
          <template #item="{ element: player }">
            <div
              :class="{
                'disable-fields': player.played_against !== null,
              }"
              class="player-card"
            >
              <li
                :draggable="false"
                :id="player.id"
                :style="{ backgroundColor: player.color }"
              >
                <div class="player-info">
                  <p>
                    {{ player.name }} {{ player.lastname }},
                    {{ player.rating }}, adv: {{ player.stone_advantage }}
                  </p>
                </div>
                <q-btn
                  color="accent"
                  round
                  flat
                  icon="more_vert"
                  class="options-button"
                >
                  <q-menu cover auto-close>
                    <q-list>
                      <q-item clickable>
                        <q-item-section @click="handleAdvChange(player, 1)"
                          >adv +1</q-item-section
                        >
                      </q-item>
                      <q-item clickable>
                        <q-item-section @click="handleAdvChange(player, -1)"
                          >adv -1</q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </li>
            </div>
          </template>
        </draggable>
      </div>

      <div class="outcome-buttons">
        <ul>
          <li v-for="matchup in matchups" :key="matchup.matchupId">
            <OutcomeButton
              @playerOneWon="PlayerOneWon(matchup)"
              :class="{ 'disable-btn': isLoading || creatorId === '' }"
              @player-two-won="PlayerTwoWon(matchup)"
              @switch-columns="SwitchColumns(matchup)"
              @cancelWin="CancelWin(matchup)"
              :leftPlayerWon="
                getWinner(matchup.playerWonId, matchup.playerOneId) //ova funkcija nam provjerava je li partija već odigrana ili ne, i onda tu informaciju šaljemo outcomeButtonu koji će ovisno o vrijednosti požutjeti pehar ili neće
              "
              :rightPlayerWon="
                getWinner(matchup.playerWonId, matchup.playerTwoId)
              "
            >
            </OutcomeButton>
          </li>
        </ul>
      </div>

      <div class="player-group" id="right-column" style="">
        <draggable
          :disabled="creatorId === '' || isLoading"
          v-model="playersColumnRight"
          tag="ul"
          group="players"
          item-key="id"
          @end="handleDragChange('right')"
        >
          <template #item="{ element: player }">
            <div
              :class="{
                'disable-fields': player.played_against !== null,
              }"
              class="player-card"
            >
              <li :id="player.id" :style="{ backgroundColor: player.color }">
                <div class="player-info">
                  <p>
                    {{ player.name }} {{ player.lastname }}, {{ player.rating }}
                  </p>
                </div>
                <!-- <q-btn
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
                /> -->
              </li>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { useQuasar } from 'quasar';
import OutcomeButton from './OutcomeButton.vue';
import { Player, Matchup } from 'src/models/models';
import { usePlayersStore } from 'app/utils/store';
import { getWinner } from 'app/utils/helpers';
import {
  removePlayer,
  editSinglePlayer,
  getTournamentPlayers,
  getTournamentMatchups,
  addMatchups,
  removeMatchups,
  updateSingleMatchup,
  addPlayers,
} from '../firebase/init';
import { Console } from 'console';

export default defineComponent({
  name: 'TournamentSchedule',
  components: { draggable: draggable, OutcomeButton: OutcomeButton },
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

    //FUNKCIJE ZA OPERACIJE NAD IGRAČIMA:

    async function getRoundPlayers(): Promise<void> {
      const tournamentPlayers = await getTournamentPlayers(
        props.tournamentId,
        store.currentRound
      ); //dohvati igrace za odredjeno kolo turnira koji su pohranjeni na firestore-u
      if (tournamentPlayers) {
        store.setPlayers(tournamentPlayers); //postavlja igrače u playerStore te se onda opet poziva funkcija updateplayers, jer se aktivirao watcher za store.players
        console.log("table players");
        console.log(store.tablePlayers);
        store.setTablePlayers(store.tablePlayers);
        //store.tableChange = !store.tableChange;
      }
    }

    async function changeLeftColumn(ind: number): Promise<void> {
      //ova funkcija mijenja igraču njegov column atribut u 'left' i poziva funkciju koja će tu promjenu pohraniti u firestore
      const oldPlayer: Player = { ...playersColumnLeft.value[ind] };
      playersColumnLeft.value[ind].column = 'left';
      const newPlayer: Player = { ...playersColumnLeft.value[ind] };
      await editSinglePlayer(
        //funkcija editSinglePlayer ažurira u bazi igrača, ali samo za određeno kolo
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
      await editSinglePlayer(
        //funkcija editSinglePlayer ažurira u bazi igrača, ali samo za određeno kolo
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
      unmatchedPlayers.value[ind].stone_advantage = 0; // resetiramo stone advantage za igrača kojeg stavimo u unmatched column
      const newPlayer: Player = { ...unmatchedPlayers.value[ind] };
      await editSinglePlayer(
        //funkcija editSinglePlayer ažurira u bazi igrača, ali samo za određeno kolo
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

      emit('update-load', !props.isLoading); //preventiva kojom onemogućujemo druge buttone dok ova operacija ne završi da ne bi došlo do problema sa spremanjem podataka tijekom asinkronih poziva, objašnjeno u funkciji generate
      await updateMatchups();
      emit('update-load', !props.isLoading); //preventiva kojom onemogućujemo druge buttone dok ova operacija ne završi da ne bi došlo do problema sa spremanjem podataka tijekom asinkronih poziva
    }

    const handleEditClick = (player: Player, column: string) => {
      //kad kliknemo na ikonicu za edit aktivira se ova funkcija
      editedPlayerColumn.value = column;
      store.editPlayer(player);
    };

    const handleAdvChange = async (
      player: Player,
      adv: number
    ): Promise<void> => {
      const temp = { ...player };

      if (player.stone_advantage >= 0 && player.stone_advantage < 9 && adv > 0)
        player.stone_advantage += adv;
      else if (
        player.stone_advantage > 0 &&
        player.stone_advantage <= 9 &&
        adv < 0
      )
        player.stone_advantage += adv;

      await editSinglePlayer(
        temp,
        player,
        props.tournamentId,
        store.currentRound
      );
    };

    const PutPLayersInColumns = async (): Promise<void> => {
      //prilikom učitavanja apliakcije ili kola uvijek prvo učitavamo igrače u stupce
      playersColumnLeft.value = []; //uvijek kada učitavam igrače iz baze u tablice prvo počistim svaku tablicu prije jer sam možda switchao između kola
      playersColumnRight.value = [];
      unmatchedPlayers.value = [];
      matchups.value = [];

      const currentPlayers = store.players;

      await getMatchups(); //dohvaćamo matchupove i raspoređujemo ih po indexima skupa s igračima
    };

    const addPlayer = () => {
      //funkcija za lokalno dodavanje igrača u stupce i u tablicu stanja
      if (store.playerToAdd) unmatchedPlayers.value.push(store.playerToAdd);

      /* const currentPlayers = [
        ...playersColumnLeft.value,
        ...playersColumnRight.value,
        ...unmatchedPlayers.value,
      ]; */
      const temp = store.tablePlayers;
      if(store.playerToAdd){
        temp.push(store.playerToAdd);
      }
      console.log(temp);
      store.setTablePlayers(temp);
      console.log(store.tablePlayers);
     // store.setTablePlayers(currentPlayers); //postavljamo opet igrače u tablicu stanja s novim igračem ovaj put
    };

    const updateEditedPlayer = () => {
      //funkcija za lokalno ažuriranje nekog igrača (lokalno znači na frontendu)
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
      /* const currentPlayers = [
        ...playersColumnLeft.value,
        ...playersColumnRight.value,
        ...unmatchedPlayers.value,
      ]; */
      const index = store.tablePlayers.findIndex((player) => player.id === store.editedPlayer?.id)
      if(store.editedPlayer){
        store.tablePlayers.splice(index,1,store.editedPlayer); //postavljamo tablicu stanja ovaj put s ažuriranim igračem
      }
    };

    async function handleDeleteClick(delPlayer: Player, column: string) {
      //ova funkcija se aktivira kad stisnemo na ikonicu za brisanje, briše lokalno igrača i onda poziva funkciju za brisanje igrača u bazi
      //trenutno, brisanje se može ionako izvesti samo za igrače u unmatched stupcu pa nam ova prva dva ifa nisu ni potrebna ali nema veze ostavit ćemo ovako
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
      const index = store.tablePlayers.findIndex((player) => player.id === delPlayer.id)
      
      store.tablePlayers.splice(index,1); //postavljamo tablicu stanja ovaj put s ažuriranim igračem
      
      await removePlayer(delPlayer, props.tournamentId); //ažuriramo tablicu stanja ovaj put s izbrisanim igračem manje
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    //FUNKCIJE OUTCOME BUTTONA:

    //ova funkcija se aktivira kada se klikne na liijevi pehar bilo koje partije, tada ažuriramo točno tu partiju te oba igrača koja su sudjelovala u partiji, i na frontendu i u bazi
    async function PlayerOneWon(matchup: Matchup): Promise<void> {
      const ind = matchup.tableIndex;

      const oldPlayerLeft = { ...playersColumnLeft.value[ind] };
      const oldPlayerRight = { ...playersColumnRight.value[ind] };
      const oldMatchup = { ...matchup };

      emit('update-load', !props.isLoading); //preventiva kojom onemogućujemo druge buttone dok ova operacija ne završi da ne bi došlo do problema sa spremanjem podataka tijekom asinkronih poziva, objašnjeno u funkciji generate

      playersColumnLeft.value[ind].num_of_wins++; //povećavamo broj pobjeda lijevom igraču (lijevi igrač je uvijek playerOne)

      playersColumnLeft.value[ind].played_against = matchup.playerTwoId; //ažuriramo i atribut played_against za svakog igrača
      playersColumnRight.value[ind].played_against = matchup.playerOneId;

      matchups.value[ind].playerWonId = matchup.playerOneId; //ažuriramo i matchup

      const winner = playersColumnLeft.value[ind];
      const loser = playersColumnRight.value[ind];
      const editedMatchup = matchups.value[ind];

      await updateSingleMatchup(
        //ažuriramo promjene u matchupu u bazi, za to smo morali sačuvati oldMatchup, to je matchup kakav je bio prije odigrane partije, i ažurirani matchup kakav se odigra
        props.tournamentId,
        store.currentRound,
        oldMatchup,
        editedMatchup
      );

      await editSinglePlayer(
        //ažuriramo promjene na igračima i u bazi, za to smo morali sačuvati oldPlayerLeft i oldPlayerRight koje su stara izdanja igrača, jer prvo moramo njih ukloniti iz baze pa ubacimo ažurirane verzije
        oldPlayerLeft,
        winner,
        props.tournamentId,
        store.currentRound
      );

      await editSinglePlayer(
        oldPlayerRight,
        loser,
        props.tournamentId,
        store.currentRound
      );
      let winnerIndex = store.tablePlayers.findIndex(p => p.id === winner.id);
      console.log(winnerIndex);
      if (winnerIndex !== -1) {
          console.log("prije");
          console.log(store.tablePlayers);
          store.tablePlayers[winnerIndex].num_of_wins++;
          store.tableChange = !store.tableChange;
          console.log("posli");
          console.log(store.tablePlayers);
      }

      

      emit('update-load', !props.isLoading); //preventiva kojom onemogućujemo druge buttone dok ova operacija ne završi da ne bi došlo do problema sa spremanjem podataka tijekom asinkronih poziva, objašnjeno u funkciji generate
    }

    //ova funkcija se aktivira kad se pritisne desni pehar bilo koje partije, objasnio sam kako funkcionira za playerOneWon a isti princip vrijedi i za playerTwoWon
    async function PlayerTwoWon(matchup: Matchup): Promise<void> {
      const ind = matchup.tableIndex;

      const oldPlayerLeft = { ...playersColumnLeft.value[ind] };
      const oldPlayerRight = { ...playersColumnRight.value[ind] };
      const oldMatchup = { ...matchup };

      emit('update-load', !props.isLoading);

      playersColumnRight.value[ind].num_of_wins++;

      playersColumnLeft.value[ind].played_against = matchup.playerTwoId;
      playersColumnRight.value[ind].played_against = matchup.playerOneId;

      matchups.value[ind].playerWonId = matchup.playerTwoId;

      const winner = playersColumnRight.value[ind];
      const loser = playersColumnLeft.value[ind];
      const editedMatchup = matchups.value[ind];

      await updateSingleMatchup(
        props.tournamentId,
        store.currentRound,
        oldMatchup,
        editedMatchup
      );

      await editSinglePlayer(
        oldPlayerLeft,
        loser,
        props.tournamentId,
        store.currentRound
      );

      await editSinglePlayer(
        oldPlayerRight,
        winner,
        props.tournamentId,
        store.currentRound
      );
      let winnerIndex = store.tablePlayers.findIndex(p => p.id === winner.id);
      console.log(winnerIndex);
      if (winnerIndex !== -1) {
          console.log("prije");
          console.log(store.tablePlayers);
          store.tablePlayers[winnerIndex].num_of_wins++;
          store.tableChange = !store.tableChange;
          console.log("posli");
          console.log(store.tablePlayers);
      }
      emit('update-load', !props.isLoading);
    }

    //ova funkcija se aktivira kad se stisne gumb za zamjenu stupaca parova kod partije
    async function SwitchColumns(oldMatchup: Matchup): Promise<void> {
      const playerLeft = playersColumnLeft.value.find(
        //pronađi mi lijevog igrača iz te partije
        (player) => player.id === oldMatchup.playerOneId
      );
      const playerRight = playersColumnRight.value.find(
        //pronađi mi desnog igrača iz te partije
        (player) => player.id === oldMatchup.playerTwoId
      );

      const newMatchup = {
        ...oldMatchup,
        playerOneId: oldMatchup.playerTwoId,
        playerTwoId: oldMatchup.playerOneId,
      };

      emit('update-load', !props.isLoading); //preventiva kojom onemogućujemo druge buttone dok ova operacija ne završi da ne bi došlo do problema sa spremanjem podataka tijekom asinkronih poziva, objašnjeno u funkciji generate

      matchups.value.splice(oldMatchup.tableIndex, 1, newMatchup); //pošto smo zamijenili stupcei gračima moramo ažurirati i sam matchup

      if (playerLeft && playerRight) {
        playersColumnLeft.value.splice(oldMatchup.tableIndex, 1, playerRight); //ažuriramo atribut stupca igrača na frontendu
        playersColumnRight.value.splice(oldMatchup.tableIndex, 1, playerLeft);

        await changeRightColumn(oldMatchup.tableIndex); //ažuriramo atribut stupca igrača u bazi
        await changeLeftColumn(oldMatchup.tableIndex);
      }

      await updateSingleMatchup(
        //ažuriramo matchup u bazi
        props.tournamentId,
        store.currentRound,
        oldMatchup,
        newMatchup
      );

      emit('update-load', !props.isLoading); //ugasi preventivu
    }

    //ova funkcija se aktivira kad se ugasi pehar, tj poništi pobjeda, onda moramo ažurirati taj matchup i moramo ažurirati atribute igrača kao što su num_of_wins i playedAgainst...
    async function CancelWin(matchup: Matchup) {
      const ind = matchup.tableIndex;
      const oldMatchup = { ...matchup }; //zašto nisam napisao oldMatchup=matchup, zato što su to objekti i kasnije kad budem ažurirao matchup promijenit će mi se i oldMatchup a to ne želim
      const oldPlayerLeft = { ...playersColumnLeft.value[ind] };
      const oldPlayerRight = { ...playersColumnRight.value[ind] };
      let winnerId: string;
      emit('update-load', !props.isLoading); //preventiva kojom onemogućujemo druge buttone dok ova operacija ne završi da ne bi došlo do problema sa spremanjem podataka tijekom asinkronih poziva, objašnjeno u funkciji generate

      if (matchup.playerWonId === matchup.playerOneId){
        //oduzimamo pobjedu onome tko je pobijedio s obizrom da smo gašenjem pehara maknuli ishod same partije
        playersColumnLeft.value[ind].num_of_wins--;
        winnerId = playersColumnLeft.value[ind].id;
      }
      else{
        playersColumnRight.value[ind].num_of_wins--;
        winnerId = playersColumnRight.value[ind].id;
      } 

      playersColumnLeft.value[ind].played_against = null; //ažuriramo i played against na frontendu za oba igrača
      playersColumnRight.value[ind].played_against = null;

      matchups.value[ind].playerWonId = null;

      const editedMatchup = matchups.value[ind];
      const leftPlayer = playersColumnLeft.value[ind];
      const rightPlayer = playersColumnRight.value[ind];

      await updateSingleMatchup(
        //ažuriranje matchupa u bazi
        props.tournamentId,
        store.currentRound,
        oldMatchup,
        editedMatchup
      );

      await editSinglePlayer(
        //ažuriranje jednog igrača u bazi
        oldPlayerLeft,
        leftPlayer,
        props.tournamentId,
        store.currentRound
      );

      await editSinglePlayer(
        // Ažuriranje drugog igrača u bazi
        oldPlayerRight,
        rightPlayer,
        props.tournamentId,
        store.currentRound
      );
      let winnerIndex = store.tablePlayers.findIndex(p => p.id === winnerId);
      console.log(winnerIndex);
      if (winnerIndex !== -1) {
          console.log("prije");
          console.log(store.tablePlayers);
          store.tablePlayers[winnerIndex].num_of_wins--;
          store.tableChange = !store.tableChange;
          console.log("posli");
          console.log(store.tablePlayers);
      }

      emit('update-load', !props.isLoading); //ugasi preventivu
    }

    //////////////////////////////////////////////////////////////////////////////

    //FUNKCIJE ZA GENERIRANJE I PONIŠTAVANJE PAROVA

    const generate = async (): Promise<void> => {
      //generate je funkcija koja se aktivira klikom na gumb generate, raspoređuje igrače iz neraspoređenog stupca u lijeve i desne nakon čega se generiraju i partije
      if (unmatchedPlayers.value.length > 0) {
        // Calculate the midpoint of the array
        const midpoint = Math.ceil(unmatchedPlayers.value.length / 2);

        // Move the first half of the players to the 'right-column'
        let rightPlayers: Player[] = unmatchedPlayers.value.splice(0, midpoint);

        rightPlayers = rightPlayers.map((player) => ({
          ...player,
          column: 'right',
        }));

        for (let i = 0; i < rightPlayers.length; i++) {
          playersColumnRight.value.push(rightPlayers[i]);
        }

        // Move the second half of the players to the 'left-column'
        let leftPlayers = unmatchedPlayers.value.splice(0); // splice with no second argument removes all remaining elements

        leftPlayers = leftPlayers.map((player) => ({
          ...player,
          column: 'left',
        }));

        for (let i = 0; i < leftPlayers.length; i++) {
          playersColumnLeft.value.push(leftPlayers[i]);
        }

        const players = [
          //kad kliknemo na generate svi igrači kola su zapravo oni iz lijevog stupca plus oni iz desnog
          ...playersColumnLeft.value,
          ...playersColumnRight.value,
        ];

        //promjenu u stupcima moramo pohraniti i u bazi, međutim taj proces može potrajati i možda ne završi a mi smo krenuli nešto drugo raditi, zato koristimo isLoading varijablu koja će onemogućiti bilo kakvu interakciju sa stupcima dok spremanje generiranih parova ne završi
        emit('update-load', !props.isLoading);
        await addPlayers(players, props.tournamentId, store.currentRound);
        await updateMatchups(); //budući da smo premjestili igrače u stupce lijevo ili desno sljedeći korak je pravljenje parova
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
        const leftPlayers = playersColumnLeft.value.map((player) => ({
          ...player,
          num_of_wins: 0,
          played_against: null,
          column: 'unmatched',
        }));
        const rightPlayers = playersColumnRight.value.map((player) => ({
          ...player,
          num_of_wins: 0,
          played_against: null,
          column: 'unmatched',
        }));

        unmatchedPlayers.value = [
          //kad poništimo parove svi igrači kola su zapravo su iz unmatched columna
          ...unmatchedPlayers.value,
          ...leftPlayers,
          ...rightPlayers,
        ];
        playersColumnLeft.value = [];
        playersColumnRight.value = [];

        matchups.value = []; //kad poništimo parove nema ni matchupova više

        emit('update-load', !props.isLoading); //preventiva
        await addPlayers(
          unmatchedPlayers.value,
          props.tournamentId,
          store.currentRound
        );
        emit('update-load', !props.isLoading);
        //isto kao i kod funkcije generate, koristimo emitiranje i koristimo isLoading prop pa pogledajte kako sam to tamo objasnio

        await removeMatchups(props.tournamentId, store.currentRound); //uklanjanje matchupova mora slijediti budući da smo poništili igrače iz stupaca

        showNotifCancel();
      }
    };

    /////////////////////////////////////////////////////////////////////////////

    //MATCHUP FUNKCIJE:

    //Ova funkcija je nastavak na funkciju putPlayersInColumns jer se aktivira pri inicijalnom učitavanju kola, učitavamo sve igrače i sve partije iz baze i onda ih rasporedimo u odgovarajuće varijable
    const getMatchups = async (): Promise<void> => {
      const _matchups = await getTournamentMatchups(
        //dohvat matchupova iz baze
        props.tournamentId,
        store.currentRound
      );

      const left: Player[] = [];
      const right: Player[] = [];
      const unmatched: Player[] = [];

      store.players.forEach((player) => {
        if (player.column === 'left') left.push(player);
        else if (player.column === 'right') right.push(player);
        else if (player.column === 'unmatched') unmatched.push(player);
      });

      if (_matchups) {
        //mathcupove sortiramo po tableIndexu, on nam govori u kojem retku se nalazi matchup i onda po tome smještamo igrače u stupce kako bi položaj partije odgovarao položaju igrača u stupcima
        _matchups.sort((a, b) => a.tableIndex - b.tableIndex);
        matchups.value = _matchups;
      }

      //ovo što vidite s ovim leftColumnSorted i rightColumnSorted nam služi kako bi u isti redak postavili određeni matchup i točno one igrače koji su ga igrali, jer u firebaseu ti podatci nisu sortirani ili uređeni po rasporedu, mi ih dobijemo razbacane i moramo ih sami složiti

      let leftColumnSorted: Player[] = [];
      let rightColumnSorted: Player[] = [];

      for (let i = 0; i < matchups.value.length; i++) {
        const playerLeft = left.find(
          (player) => player.id === matchups.value[i].playerOneId
        );
        const playerRight = right.find(
          (player) => player.id === matchups.value[i].playerTwoId
        );

        if (playerLeft) leftColumnSorted.push(playerLeft);

        if (playerRight) rightColumnSorted.push(playerRight);
      }

      leftColumnSorted = [
        ...leftColumnSorted,
        ...left.filter(
          (unpairPlayer) =>
            !leftColumnSorted.some((player) => player.id === unpairPlayer.id)
        ),
      ];

      rightColumnSorted = [
        ...rightColumnSorted,
        ...right.filter(
          (unpairPlayer) =>
            !rightColumnSorted.some((player) => player.id === unpairPlayer.id)
        ),
      ];

      playersColumnLeft.value = leftColumnSorted;
      playersColumnRight.value = rightColumnSorted;
      unmatchedPlayers.value = unmatched;
    };

    //ova funkcija se aktivira svaki put kad povučemo nekog igrača mišem iz jednog stupca u drugi, ali i unutar stupca, tada se ažuriraju parovi jer se promijenio nekakav raspored, poanta je da oni parovi koji su odigrali partiju su zaključani, tj oni više nisu draggable
    const updateMatchups = async (): Promise<void> => {
      const _matchups: Matchup[] = []; //ovdje ćemo upisivati sve parove prilikom ažuriranja parova
      const leftColumnLength = playersColumnLeft.value.length;
      const rightColumnLength = playersColumnRight.value.length;
      let shorterArray; //uzimamo stupac s manjim brojem igrača i onda po njemu iteriramo i sparujemo s igračima iz drugog stupca

      if (leftColumnLength < rightColumnLength) shorterArray = leftColumnLength;
      else shorterArray = rightColumnLength;

      if (matchups.value.length > shorterArray)
        //ovaj if je tu radi jednog rubnog slučaja koji se zna dogodit prilikom premještanja igrača,ali taj rubni slučaj bi vam uživo morao pokazati jer je teško objasnit
        shorterArray = matchups.value.length;

      for (let i = 0; i < shorterArray; i++) {
        //iteriramo po kraćem stupcu i provjeravamo po indexu za taj redak u stupcu je li postoji već definirana partija, i je li određen ishod partije, jer ako je neželimo mijenjati tu partiju i stvarati novu, već je samo upišemo u novo polje parova _matchups
        if (matchups.value[i]?.playerWonId) {
          const matchup = matchups.value[i];

          if (
            matchup.playerOneId === playersColumnLeft.value[i]?.id && //također moramo provjeriti ako i je određen ishod postojeće partije jesu li s lijeve strane i desne u njenom retku odgovarajući igrači jer se zbog tog jednog rubnog slučaja zna i to poremetiti
            matchup.playerTwoId === playersColumnRight.value[i]?.id
          )
            _matchups[i] = matchups.value[i];
          else {
            const leftInd = playersColumnLeft.value.findIndex(
              (player) => player.id === matchup.playerOneId
            );
            const rightInd = playersColumnRight.value.findIndex(
              (player) => player.id === matchup.playerTwoId
            );

            if (leftInd !== -1 && rightInd !== -1) {
              const leftPlayerOld = { ...playersColumnLeft.value[leftInd] };
              const rightPlayerOld = { ...playersColumnRight.value[rightInd] };

              const leftPlayerNew = {
                ...leftPlayerOld,
                num_of_wins: 0,
                played_against: null,
              };
              const rightPlayerNew = {
                ...rightPlayerOld,
                num_of_wins: 0,
                played_against: null,
              };

              playersColumnLeft.value.splice(leftInd, 1, leftPlayerNew);
              playersColumnRight.value.splice(rightInd, 1, rightPlayerNew);

              if (playersColumnLeft.value[i] && playersColumnRight.value[i])
                _matchups[i] = {
                  matchupId: Math.random().toString(36).substring(7),
                  tableIndex: i,
                  playerOneId: playersColumnLeft.value[i].id,
                  playerTwoId: playersColumnRight.value[i].id,
                  playerWonId: null,
                };

              await editSinglePlayer(
                leftPlayerOld,
                leftPlayerNew,
                props.tournamentId,
                store.currentRound
              );
              await editSinglePlayer(
                rightPlayerOld,
                rightPlayerNew,
                props.tournamentId,
                store.currentRound
              );
            }
          }
        } else if (playersColumnLeft.value[i] && playersColumnRight.value[i])
          //ako ishod partije nije određen onda samo stvorimo novu partiju za taj redak
          _matchups[i] = {
            matchupId: Math.random().toString(36).substring(7),
            tableIndex: i,
            playerOneId: playersColumnLeft.value[i].id,
            playerTwoId: playersColumnRight.value[i].id,
            playerWonId: null,
          };
      }

      matchups.value = _matchups; //ažuriramo ref od matchupa na frontendu

      await addMatchups(props.tournamentId, store.currentRound, _matchups); //ažuriramo matchupove u bazi, tj dodamo ih
    };

    ///////////////////////////////////////////////////////////////////////////////////

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
      handleEditClick,
      matchups,
      PlayerOneWon,
      PlayerTwoWon,
      SwitchColumns,
      handleDeleteClick,
      handleDragChange,
      generate,
      removeElementsFromRightAndLeft,
      CancelWin,
      getWinner,
      handleAdvChange,
    };
  },
});
</script>

<style>
.disable-fields {
  pointer-events: none;
}

.disable-btn {
  pointer-events: none;
  opacity: 0.8;
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
