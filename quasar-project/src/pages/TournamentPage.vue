<template>
   <send-mail style="background-color: #303030;" />
  <input-screen v-if="creatorId !== ''" :tournamentId="tournamentId" />
  <tournament-schedule />
</template>

<style></style>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { Tournament, Player, AppState } from 'src/models/models';
import { getTournamentPlayers } from 'src/firebase/init';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import InputScreen from '../components/InputScreen.vue';
import TournamentSchedule from 'src/components/TournamentSchedule.vue';
import { usePlayersStore } from 'app/utils/store';
import Mail from '../components/SendMail.vue'

export default defineComponent({
  name: 'TournamentPage',
  components: {
    'input-screen': InputScreen, //komponenta koja je container za forme za unose igraca
    'tournament-schedule': TournamentSchedule, //komponenta koja implementira sparivanje igraca
    'send-mail':Mail
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
      if (route.params.creatorId)
        creatorId.value = route.params.creatorId as string;
      //iz rute mozemo dobiti i creatorId, kaze Boris da nije problem ako bude creatorId unutar rute,al localStorage je cisto onda backup ako admin izbrise slucajno iz rute taj Id
      else if (localStorage.getItem('creatorId') !== null)
        creatorId.value = localStorage.getItem('creatorId') as string;
      else creatorId.value = '';
      tournamentPlayers = await getTournamentPlayers(tournamentId.value); //dohvati igrace turnira koji su pohranjeni na firestore-u
      if (tournamentPlayers) store.setPlayers(tournamentPlayers); //pohrani igrace u globalni state igraca
    });

    return {
      tournamentId,
      creatorId,
    };
  },
});
</script>
