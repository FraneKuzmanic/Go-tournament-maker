<template>
  <div class="color-picker">
    <!-- <q-badge v-if="standard < 0" color="blue">
      Current: {{ Math.abs(standard) }}k Choose the rating
    <q-badge v-if="inputVal < 0" color="blue">
      Current: {{ Math.abs(inputVal) }}k Choose the rating
    </q-badge>
    <q-badge v-else color="blue">
      Current: {{ Math.abs(standard) }}d Choose the rating
    </q-badge> 
      Current: {{ Math.abs(inputVal) }}d Choose the rating
    </q-badge>-->

    <q-slider
      v-model="inputVal"
      :disable="isLoading"
      :min="-30"
      :max="5"
      :step="1"
      snap
      label
      :label-value="Math.abs(inputVal)"
      color="blue"
      track-color="green"
      @change="changeColor"
      style="width: 300px; margin-right: 10px"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from 'vue';
import {
  getTournamentPlayers,
  putColorSliderValue,
  getColorSliderValue,
  changePlayersColor,
} from 'src/firebase/init';
import { useQuasar } from 'quasar';
import { usePlayersStore } from 'app/utils/store';
import { savePlayerColor } from '../../utils/helpers';

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
    const inputVal: Ref<number> = ref(0);
    const isLoading: Ref<boolean> = ref(false); //ovo nam služi kao naznaka kad promijenimo boju da se sve spremilo u bazu, pa tek onda ponovno možemo slideati color slider

    const changeColor = async () => {
      //kad god slideamo color slider i stanemo na neku vrijednost aktivira se ova funkcija
      try {
        isLoading.value = true;
        const players = await getTournamentPlayers(
          props.tournamentId,
          store.currentRound
        );

        await putColorSliderValue(inputVal.value, props.tournamentId); //spremamo trenutnu vrijednost slidera na firestore
        store.setColorValue(inputVal.value); //spremamo vrijednost slidera u store kako bi dali signal drugim komponentama da se vrijednost promijenila

        if (players) {
          const coloredPlayers = savePlayerColor(players, inputVal.value); // funkcija nam vraća obojane igrače
          store.setPlayers(coloredPlayers); //postavljamo obojane igrače
          await changePlayersColor(inputVal.value, props.tournamentId); //ažuriranje boja na firebaseu
        } else {
          console.error('getTournamentPlayers returned undefined');
        }
        isLoading.value = false;
      } catch (error) {
        console.error('Error fetching tournament players:', error);
      } finally {
        showNotifAdd();
      }
    };
    function showNotifAdd() {
      $q.notify({
        message: 'Uspješno odabran rating',
        color: 'green',
      });
    }

    onMounted(async (): Promise<void> => {
      //ova funkcija se aktivira prilikom učitavanja slidera i služi za dohvat trenutne vrijednosti slidera iz baze
      const val = await getColorSliderValue(props.tournamentId);

      if (val) {
        inputVal.value = val;
        store.setColorValue(val);
      }
    });

    return {
      inputVal,
      changeColor,
      isLoading,
    };
  },
  methods: {},
});
</script>
<style>
.color-picker {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
