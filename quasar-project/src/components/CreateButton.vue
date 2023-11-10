<template>
  <button @click="createTournament" class="button">Get started!</button>
</template>

<style>
.button {
  background-color: rgba(246, 122, 21, 0.92);
  font-size: 1.5rem;
  color: white;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  width: 35vw;
  border-radius: 14px;
  border: none;
  padding: 0.7rem 1.2rem;
  max-width: 250px;
  cursor: pointer;
}

@media (max-width: 500px) {
  .button {
    font-size: 1.2rem;
    min-width: 150px;
  }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { firebaseConfig, addNewTournament } from '../firebase/init';
import { doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export default defineComponent({
  name: 'ExampleComponent',
  methods: {
    async createTournament(event: Event) {
      const creatorId: string =
        Date.now().toString(36) + Math.random().toString(36).substring(2);
      const players: string[] = ['mate', 'boris', 'igor', 'mario'];

      const tournamentId: string = await addNewTournament({
        creatorId: creatorId,
        players: players,
      });

      this.$router.push({
        name: 'tournamentDetail',
        params: { tournamentId: tournamentId, creatorId: creatorId },
      });
    },
  },
});
</script>
