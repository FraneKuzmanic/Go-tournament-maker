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
import { addNewTournament } from '../firebase/init';

export default defineComponent({
  name: 'CreateButton',
  methods: {
    async createTournament() {
      const creatorId: string =
        Date.now().toString(36) + Math.random().toString(36).substring(2); //stvaranje jedinstvenog identifikatora za kreatora turnira, inace to nije dobro na frontendu radit, al nez kako to napravit iz firebase-a, citaj "nije mi se dalo saznat kako"

      const tournamentId: string = await addNewTournament({
        creatorId: creatorId,
        colorValue: 0,
        firstRound: { players: [], matchups: [] },
        secondRound: { players: [], matchups: [] },
        thirdRound: { players: [], matchups: [] },
      }); //početna inicijalizacija podataka turnira

      this.$router.push({
        name: 'TournamentPage',
        params: { tournamentId: tournamentId, creatorId: creatorId },
      }); //nakon stvaranja turnira prebacujemo URL na URL za taj turnir i rendera se komponenta turnira

      localStorage.setItem('creatorId', creatorId); //spremamo id kreatora u njegov local storage
    },
  },
});
</script>
