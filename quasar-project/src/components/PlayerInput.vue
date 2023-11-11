<template>
  <div>
    <q-form class="form" v-if="showcomponent" @submit="onSubmit">
      <q-input
        filled
        v-model.trim="name"
        :disable="addedToDB"
        label="IME"
        :rules="[(val) => !!val || 'Ime je obavezno']"
      />
      <q-input
        filled
        v-model.trim="lastname"
        :disable="addedToDB"
        label="PREZIME"
        :rules="[(val) => !!val || 'Prezime je obavezno']"
      />
      <q-input
        v-if="notFound || found"
        filled
        v-model.trim="rating"
        :disable="addedToDB"
        label="RATING"
        :rules="[(val) => !!val || 'Rating je obavezan']"
      />
         <div class="center-buttons">
        <q-btn :disable="addedToDB" @click="searchEGD" label="TRAŽI" />
        <q-btn :disable="!found && !notFound" label="DODAJ" type="submit" />
        <q-btn @click="remove" label="UKLONI" />
      </div>
      <q-dialog v-model="notFound2">
        <q-card>
          <q-card-section>
            <div class="text-h6">Alert</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            Igrač nije pronađen u bazi. Provjerite je li uneseno ispravno ime i
            prezime ili upišite rating i kliknite na gumb DODAJ
          </q-card-section>
          <q-card-actions>
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-form>
  </div>
</template>

<style>
.center-buttons {
  display: flex;
  justify-content: center;
  margin-top: 1rem; /* Adjust margin as needed */
  margin-bottom: 1.5rem;
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { addNewPlayer, removePlayer } from '../firebase/init';
import { useQuasar } from 'quasar';
import type { PropType, Ref } from 'vue';
import { Player } from '../models/models.ts';
import { usePlayersStore } from 'app/utils/store';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  name: 'PlayerInput',
  props: {
    tournamentId: {
      //tournamentId dobijemo kao propse od njezinih roditeljskih komponenti
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const store = usePlayersStore();
    const id: Ref<string> = ref('');
    const name: Ref<string> = ref('');
    const lastname: Ref<string> = ref('');
    const found: Ref<boolean> = ref(false);
    const notFound: Ref<boolean> = ref(false);
    const notFound2: Ref<boolean> = ref(false);
    const rating: Ref<string> = ref('');
    const showcomponent: Ref<boolean> = ref(true);
    const addedToDB: Ref<boolean> = ref(false);

    async function searchEGD(): Promise<void> {
      const res = await fetch(
        'https://www.europeangodatabase.eu/EGD/GetPlayerDataByData.php?lastname=' +
          lastname.value +
          '&name=' +
          name.value,
        {
          method: 'GET',
        }
      );
      const data = await res.json();
      if (data.players === undefined || data.players.length > 1) {
        notFound.value = true;
        notFound2.value = true;
      } else {
        rating.value = data.players[0].Grade;
        found.value = true;
      }
    }
    async function onSubmit(): Promise<void> {
      addedToDB.value = true;
      const playerForDB: Player = {
        id: uuidv4(name.value + lastname.value + rating.value),
        name: name.value,
        lastname: lastname.value,
        rating: rating.value,
      };
      id.value = playerForDB.id;
      await addNewPlayer(playerForDB, props.tournamentId);
      showNotifAdd();
      store.addNewPlayer(playerForDB); //osim na firestore, nove igrace pohranjujemo i u globalni state da bi se odmah azurirali njihovi prikazi na turniru
    }
    async function remove() {
      showcomponent.value = false;
      const playerForDB: Player = {
        id: id.value,
        name: name.value,
        lastname: lastname.value,
        rating: rating.value,
      };
      if (addedToDB.value) {
        await removePlayer(playerForDB, props.tournamentId);
        showNotifDel();
        store.removePlayer(playerForDB);
      }
    }
    function showNotifAdd() {
      $q.notify({
        message: 'Igrač je uspješno dodan.',
        color: 'green',
      });
    }
    function showNotifDel() {
      $q.notify({
        message: 'Igrač je uspješno izbrisan.',
        color: 'green',
      });
    }

    return {
      name,
      lastname,
      notFound,
      found,
      rating,
      showcomponent,
      addedToDB,
      notFound2,
      searchEGD,
      onSubmit,
      remove,
    };
  },
});
</script>
