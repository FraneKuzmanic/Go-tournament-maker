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
                  <q-btn color="accent" round flat icon="more_vert" class="options-button">
                    <q-menu cover auto-close>
                        <q-list>
                            <q-item clickable>
                                <q-item-section @click="handleAdvChange(player, 1)">adv +1</q-item-section>
                            </q-item>
                            <q-item clickable>
                                <q-item-section @click="handleAdvChange(player, -1)">adv -1</q-item-section>
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
                getWinner(matchup.playerWonId, matchup.playerOneId)
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
  // removePlayers,
} from '../firebase/init';
// import { RoundNumber } from 'src/enums/rounds';


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
      console.log('dohvati igrace');
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
      await editSinglePlayer(
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
      await editSinglePlayer(
        oldPlayer,
        newPlayer,
        props.tournamentId,
        store.currentRound
      );
    }

    async function handleDragChange(column: string): Promise<void> {
      console.log('handleam drag change');
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

      emit('update-load', !props.isLoading);
      await updateMatchups();
      emit('update-load', !props.isLoading);
    }

    const handleEditClick = (player: Player, column: string) => {
      //kad kliknemo na ikonicu za edit aktivira se ova funkcija
      editedPlayerColumn.value = column;
      store.editPlayer(player);
    };

    const handleAdvChange = (player: Player, adv: number) => {
      var temp = {...player}
      if(player.stone_advantage >= 0 && player.stone_advantage < 9 && adv > 0)
        player.stone_advantage += adv
      else if(player.stone_advantage > 0 && player.stone_advantage <= 9 && adv < 0)
        player.stone_advantage += adv
      editSinglePlayer(temp, player, props.tournamentId, store.currentRound)
    }

    const PutPLayersInColumns = async (): Promise<void> => {
      //prilikom učitavanja apliakcije ili kola uvijek prvo učitavamo igrače u stupce
      playersColumnLeft.value = []; //uvijek kada učitavam igrače iz baze u tablice prvo počistim svaku tablicu prije jer sam možda switchao između kola
      playersColumnRight.value = [];
      unmatchedPlayers.value = [];
      matchups.value = [];

      const currentPlayers = store.players;

      await getMatchups(); //dohvaćamo matchupove i raspoređujemo ih po indexima skupa s igračima

      store.setTablePlayers(currentPlayers); //postavljamo sve trenutne igrače u kolu u tablicu stanja igrača
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
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    //FUNKCIJE OUTCOME BUTTONA:

    async function PlayerOneWon(matchup: Matchup): Promise<void> {
      const ind = matchup.tableIndex;

      const oldPlayerLeft = { ...playersColumnLeft.value[ind] };
      const oldPlayerRight = { ...playersColumnRight.value[ind] };
      const oldMatchup = { ...matchup };

      emit('update-load', !props.isLoading);

      playersColumnLeft.value[ind].num_of_wins++;

      playersColumnLeft.value[ind].played_against = matchup.playerTwoId;
      playersColumnRight.value[ind].played_against = matchup.playerOneId;

      matchups.value[ind].playerWonId = matchup.playerOneId;

      const winner = playersColumnLeft.value[ind];
      const loser = playersColumnRight.value[ind];
      const editedMatchup = matchups.value[ind];

      await updateSingleMatchup(
        props.tournamentId,
        store.currentRound,
        oldMatchup,
        editedMatchup
      );

      await editSinglePlayer(
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

      emit('update-load', !props.isLoading);

      console.log('player one won');
      console.log(winner);
      console.log(loser);
    }

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

      emit('update-load', !props.isLoading);

      console.log('player two won');
      console.log(winner);
      console.log(loser);
    }

    async function SwitchColumns(oldMatchup: Matchup): Promise<void> {
      const playerLeft = playersColumnLeft.value.find(
        (player) => player.id === oldMatchup.playerOneId
      );
      const playerRight = playersColumnRight.value.find(
        (player) => player.id === oldMatchup.playerTwoId
      );

      const newMatchup = {
        ...oldMatchup,
        playerOneId: oldMatchup.playerTwoId,
        playerTwoId: oldMatchup.playerOneId,
      };

      emit('update-load', !props.isLoading);

      matchups.value.splice(oldMatchup.tableIndex, 1, newMatchup);

      if (playerLeft && playerRight) {
        playersColumnLeft.value.splice(oldMatchup.tableIndex, 1, playerRight);
        playersColumnRight.value.splice(oldMatchup.tableIndex, 1, playerLeft);

        await changeRightColumn(oldMatchup.tableIndex);
        await changeLeftColumn(oldMatchup.tableIndex);
      }

      await updateSingleMatchup(
        props.tournamentId,
        store.currentRound,
        oldMatchup,
        newMatchup
      );

      emit('update-load', !props.isLoading);
    }

    async function CancelWin(matchup: Matchup) {
      const ind = matchup.tableIndex;
      const oldMatchup = { ...matchup };
      const oldPlayerLeft = { ...playersColumnLeft.value[ind] };
      const oldPlayerRight = { ...playersColumnRight.value[ind] };

      emit('update-load', !props.isLoading);

      if (matchup.playerWonId === matchup.playerOneId)
        playersColumnLeft.value[ind].num_of_wins--;
      else playersColumnRight.value[ind].num_of_wins--;

      playersColumnLeft.value[ind].played_against = null;
      playersColumnRight.value[ind].played_against = null;

      matchups.value[ind].playerWonId = matchup.playerOneId;

      matchups.value[ind].playerWonId = null;

      const editedMatchup = matchups.value[ind];
      const leftPlayer = playersColumnLeft.value[ind];
      const rightPlayer = playersColumnRight.value[ind];

      await updateSingleMatchup(
        props.tournamentId,
        store.currentRound,
        oldMatchup,
        editedMatchup
      );

      await editSinglePlayer(
        oldPlayerLeft,
        leftPlayer,
        props.tournamentId,
        store.currentRound
      );

      await editSinglePlayer(
        oldPlayerRight,
        rightPlayer,
        props.tournamentId,
        store.currentRound
      );

      emit('update-load', !props.isLoading);

      console.log('Nobody won');
    }

    //////////////////////////////////////////////////////////////////////////////

    //FUNKCIJE ZA GENERIRANJE I PONIŠTAVANJE PAROVA

    const generate = async (): Promise<void> => {
      //generate je funkcija koja bi trebala provoditi algoritam kad ga implementiramo
      //trenutno uzima pola igrača iz unamtched stupca i grupira parove s drugom polovicom
      if (unmatchedPlayers.value.length > 0) {
        // Calculate the midpoint of the array
        const midpoint = Math.ceil(unmatchedPlayers.value.length / 2);

        // playersColumnLeft.value = playersColumnLeft.value.map((player) => ({
        //   ...player,
        //   num_of_wins: 0,
        //   played_against: null,
        // }));
        // playersColumnRight.value = playersColumnRight.value.map((player) => ({
        //   ...player,
        //   num_of_wins: 0,
        //   played_against: null,
        // }));

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
          ...unmatchedPlayers.value,
          ...leftPlayers,
          ...rightPlayers,
        ];
        playersColumnLeft.value = [];
        playersColumnRight.value = [];

        matchups.value = [];

        emit('update-load', !props.isLoading);
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

    const createMatchups = async (): Promise<void> => {
      //funkcija za stvaranje matchupova, gleda koji od dva stupca ima manje igrača i onda redom spaja igrača iz jednog s igračem iz
      //drugog stupca
      const _matchups: Matchup[] = [];
      const leftColumnLength = playersColumnLeft.value.length;
      const rightColumnLength = playersColumnRight.value.length;
      let shorterArray;

      if (leftColumnLength < rightColumnLength) shorterArray = leftColumnLength;
      else shorterArray = rightColumnLength;

      for (let i = 0; i < shorterArray; i++) {
        _matchups[i] = {
          matchupId: Math.random().toString(36).substring(7),
          tableIndex: i,
          playerOneId: playersColumnLeft.value[i].id,
          playerTwoId: playersColumnRight.value[i].id,
          playerWonId: null,
        };
      }

      matchups.value = _matchups;

      await addMatchups(props.tournamentId, store.currentRound, _matchups);
    };

    const getMatchups = async (): Promise<void> => {
      const _matchups = await getTournamentMatchups(
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
        _matchups.sort((a, b) => a.tableIndex - b.tableIndex);
        matchups.value = _matchups;
      }

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

    const updateMatchups = async (): Promise<void> => {
      const _matchups: Matchup[] = [];
      const leftColumnLength = playersColumnLeft.value.length;
      const rightColumnLength = playersColumnRight.value.length;
      let shorterArray;

      if (leftColumnLength < rightColumnLength) shorterArray = leftColumnLength;
      else shorterArray = rightColumnLength;

      if (matchups.value.length > shorterArray)
        shorterArray = matchups.value.length;

      for (let i = 0; i < shorterArray; i++) {
        if (matchups.value[i]?.playerWonId) {
          const matchup = matchups.value[i];

          if (
            matchup.playerOneId === playersColumnLeft.value[i]?.id &&
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
          _matchups[i] = {
            matchupId: Math.random().toString(36).substring(7),
            tableIndex: i,
            playerOneId: playersColumnLeft.value[i].id,
            playerTwoId: playersColumnRight.value[i].id,
            playerWonId: null,
          };
      }

      matchups.value = _matchups;

      await addMatchups(props.tournamentId, store.currentRound, _matchups);
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
      createMatchups,
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
