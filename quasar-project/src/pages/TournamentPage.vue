<template>
  <send-mail v-if="creatorId !== ''" style="background-color: #303030" />
  <input-screen v-if="creatorId !== ''" :tournamentId="tournamentId" />
  <colorPicker v-if="creatorId !== ''" :tournamentId="tournamentId" />
  <RoundPicker :tournamentId="tournamentId" :creatorId="creatorId" />
</template>

<style></style>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Player } from 'src/models/models';
import { getTournamentPlayers } from 'src/firebase/init';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import InputScreen from '../components/InputScreen.vue';
import { usePlayersStore } from 'app/utils/store';
import Mail from '../components/SendMail.vue';
import ColorPicker from 'src/components/ColorPicker.vue';
import RoundPicker from 'src/components/RoundPicker.vue';
import { RoundNumber } from 'src/enums/rounds';

export default defineComponent({
  name: 'TournamentPage',
  components: {
    'input-screen': InputScreen, //komponenta koja je container za forme za unose igraca
    //komponenta koja implementira sparivanje igraca
    'send-mail': Mail,
    colorPicker: ColorPicker,
    RoundPicker: RoundPicker,
  },
  methods: {},
  setup() {
    const store = usePlayersStore(); //ovo tu je store objekt preko kojeg pristupamo globalnom polju u kojem su pohranjeni igraci
    const route = useRoute();
    let tournamentPlayers: Player[] | undefined;
    const tournamentId: Ref<string> = ref(''); //ref je najobicniji state, a ovo sta vidite npr Ref<string> to je samo radi typescripta radi prepoznavanja tipova podataka
    const creatorId: Ref<string> = ref('');

    onMounted(async (): Promise<void> => {
      //ova se funkcija poziva odmah pri učitavanju komponente
      tournamentId.value = route.params.tournamentId as string; //iz rute uzimamo id turnira

      if (route.params.creatorId) {
        creatorId.value = route.params.creatorId as string;
        localStorage.setItem('creatorId', creatorId.value);
        //iz rute mozemo dobiti i creatorId, kaze Boris da nije problem ako bude creatorId unutar rute,al localStorage je cisto onda backup ako admin izbrise slucajno iz rute taj Id
      } else if (localStorage.getItem('creatorId') !== null)
        creatorId.value = localStorage.getItem('creatorId') as string;
      else creatorId.value = '';
      tournamentPlayers = await getTournamentPlayers(
        tournamentId.value,
        RoundNumber.FIRST
      ); //dohvati igrace turnira prvog kola koji su pohranjeni na firestore-u, zašto prvog, pa zato što će se ono prvo pojaviti kad učitamo aplikaciju
      if (tournamentPlayers) store.setPlayers(tournamentPlayers); //pohrani igrace u globalni state igraca
    });

    return {
      tournamentId,
      creatorId,
    };
  },
});
</script>
