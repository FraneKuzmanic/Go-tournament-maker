<template>
  <div class="turnir">
    <h1>Tournament Details</h1>
    <p>ID tournament: {{ tournamentId }}</p>
    <p v-if="creatorId !== ''">ID creator: {{ creatorId }}</p>
    <p v-else>ID creator: this is regular user, it is not a creator</p>
    <p>Players:</p>
    <ul>
      <li v-for="(player, index) in tournament?.players" :key="index">
        {{ player }}
      </li>
    </ul>
    <p>
      nemojte da vas zbuni ako vidite neke igrace, to so samo zahardkodirani
      podaci za provjeru jel dobro povlaci podatke iz turnira na firestore-u
    </p>
  </div>
</template>

<style>
.turnir {
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Tournament } from 'src/models/models';
import { getTournament } from 'src/firebase/init';
import type { Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'ExampleComponent',
  methods: {},
  setup() {
    const route = useRoute();
    const tournament: Ref<Tournament | undefined> = ref();
    const tournamentId: Ref<string> = ref('');
    const creatorId: Ref<string> = ref('');

    onMounted(async (): Promise<void> => {
      tournamentId.value = route.params.tournamentId as string;
      creatorId.value = route.params.creatorId
        ? (route.params.creatorId as string)
        : '';
      tournament.value = await getTournament(tournamentId.value);
    });

    return {
      tournament,
      tournamentId,
      creatorId,
    };
  },
});
</script>
