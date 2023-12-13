<template>
  <q-form
    class="form q-col-md-5 q-pa-sm"
    @submit="onSubmit"
    v-if="showcomponent"
  >
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
      <q-btn
        :disable="(!found && !notFound) || addedToDB"
        label="DODAJ"
        type="submit"
      />
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
  <q-form class="form q-col-md-5 q-pa-sm" @submit="onSubmitEdit" v-if="isEdit">
    <!-- ovo je forma koja ce se prikazat ako izaberemo editanje igrača -->
    <q-input
      filled
      v-model.trim="name"
      :rules="[(val) => !!val || 'Ime je obavezno']"
    />
    <q-input
      filled
      v-model.trim="lastname"
      :rules="[(val) => !!val || 'Prezime je obavezno']"
    />
    <q-input
      filled
      v-model.trim="rating"
      :rules="[(val) => !!val || 'Rating je obavezan']"
    />
    <div class="center-buttons">
      <q-btn @click="searchEGD" label="TRAŽI" />
      <q-btn label="SPREMI" type="submit" />
      <q-btn @click="removeEditForm" label="PONIŠTI" />
    </div>
    <q-dialog v-model="notFound2">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Igrač nije pronađen u bazi. Provjerite je li uneseno ispravno ime i
          prezime ili upišite rating
        </q-card-section>
        <q-card-actions>
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<style>
.center-buttons {
  display: flex;
  justify-content: center;
}
</style>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { addNewPlayer, removePlayer } from '../firebase/init';
import { useQuasar } from 'quasar';
import type { Ref } from 'vue';
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
    const isEdit: Ref<boolean> = ref(false); // je li korisnik odabrao edit opciju forme
    const playerToEditData: Ref<Player | undefined> = ref(undefined); // ovdje spremamo editirane podatke iz forme

    watch(
      () => store.playerToEdit, //kad god se promijeni u store-u igrac koji se zeli editati znaci da dodajemo edit formu
      () => {
        addEditForm();
      }
    );

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
      showcomponent.value = false;
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
    function showNotifEdit() {
      $q.notify({
        message: 'Igrač je uspješno ažuriran.',
        color: 'green',
      });
    }

    function addEditForm() {
      isEdit.value = true;
      showcomponent.value = false;
      playerToEditData.value = store.playerToEdit;

      if (playerToEditData.value) {
        //popunit ćemo edit formu s trenutnim podatcima igrača kojeg editamo
        name.value = playerToEditData.value.name;
        lastname.value = playerToEditData.value.lastname;
        rating.value = playerToEditData.value.rating;
      }
    }

    function removeEditForm() {
      isEdit.value = false;
    }

    async function onSubmitEdit() {
      if (playerToEditData.value) {
        const editedPlayer: Player = {
          // ovo su nam novi podatci koje je korisnik unio prilikom editanja, osim id-a, to ostaje isto
          id: playerToEditData.value.id,
          name: name.value,
          lastname: lastname.value,
          rating: rating.value,
        };
        store.editedPlayer = editedPlayer; //pohranjujemo u store.ts trenutnog ažuriranog igrača
        await removePlayer(playerToEditData.value, props.tournamentId); //uklanjamo staru verziju igrača u firestoreu
        await addNewPlayer(editedPlayer, props.tournamentId); // dodajemo ažuriranog igrača u firestore
      }
      removeEditForm();
      showNotifEdit();
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
      isEdit,
      playerToEditData,
      removeEditForm,
      onSubmitEdit,
    };
  },
});
</script>
