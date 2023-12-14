<template>
  <q-btn
    class="q-mb-md"
    color="white"
    text-color="black"
    @click="isInput=true"
    label="NOVI IGRAČ"
  />
  <q-dialog v-model="isInput">
    <q-card>
      <q-form
        class="form q-col-md-5 q-pa-sm"
        @submit="onSubmit"
      >
    <q-input
      filled
      v-model.trim="name"
      label="IME"
      :rules="[(val) => !!val || 'Ime je obavezno']"
    />
    <q-input
      filled
      v-model.trim="lastname"
      label="PREZIME"
      :rules="[(val) => !!val || 'Prezime je obavezno']"
    />
    <q-input
      v-if="notFound || found"
      filled
      v-model.trim="rating"
      label="RATING"
      :rules="ratingValidation"
    />
    <div class="center-buttons">
      <q-btn @click="searchEGD" label="TRAŽI" />
      <q-btn
        label="DODAJ"
        type="submit"
      />
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
    </q-card>
    
  </q-dialog>
  <q-dialog v-model="isEdit" @before-hide="resetEditPlayer" @hide="visible=false">
    <q-card>
      <q-form class="form q-col-md-5 q-pa-sm" @submit="onSubmitEdit">
    <!-- ovo je forma koja ce se prikazat ako izaberemo editanje igrača -->
    <q-input
      filled
      v-model.trim="nameEdit"
      :rules="[(val) => !!val || 'Ime je obavezno']"
    />
    <q-input
      filled
      v-model.trim="lastnameEdit"
      :rules="[(val) => !!val || 'Prezime je obavezno']"
    />
    <q-input
      filled
      v-model.trim="ratingEdit"
      :rules="ratingValidation"
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
  </q-card>  
  </q-dialog>
  
</template>

<style>
.center-buttons {
  display: flex;
  justify-content: center;
}
</style>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
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
    const rating: Ref<string> = ref('');
    const nameEdit: Ref<string> = ref('');
    const lastnameEdit: Ref<string> = ref('');
    const ratingEdit: Ref<string> = ref('');
    const found: Ref<boolean> = ref(false);
    const notFound: Ref<boolean> = ref(false);
    const notFound2: Ref<boolean> = ref(false);
    
    const visible: Ref<boolean> = ref(false);
    const isEdit: Ref<boolean> = ref(false); // je li korisnik odabrao edit opciju forme
    const isInput: Ref<boolean> = ref(false);
    const playerToEditData: Ref<Player | undefined> = ref(undefined); // ovdje spremamo editirane podatke iz forme

    watch(
      () => store.playerToEdit, //kad god se promijeni u store-u igrac koji se zeli editati znaci da dodajemo edit formu
      () => {
        addEditForm();
      }
    );

    function parseString(str: string): string {
      str = str.replaceAll('č', 'c');
      str = str.replaceAll('ć', 'c');
      str = str.replaceAll('ž', 'z');
      str = str.replaceAll('š', 's');
      str = str.replaceAll('đ', 'd');
      str = str.replaceAll(' ', '_');
      return str;
    }
    const ratingValidation = computed(() => {
      return [
        (val: string) => /^(0?[1-9]|[12]\d|30)k$/.test(val) || /^(0?[1-7])d$/.test(val) ||
                          /^(0?[1-9])p$/.test(val) ? true : 'Unesite rating u ispravnom formatu'
      ];
    })

    async function searchEGD(): Promise<void> {
      name.value = parseString(name.value);
      lastname.value = parseString(lastname.value);
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
      const playerForDB: Player = {
        id: uuidv4(name.value + lastname.value + rating.value),
        name: name.value,
        lastname: lastname.value,
        rating: rating.value,
        column: 'unmatched',
      };
      id.value = playerForDB.id;
      await addNewPlayer(playerForDB, props.tournamentId);
      showNotifAdd();
      store.addNewPlayer(playerForDB); //osim na firestore, nove igrace pohranjujemo i u globalni state da bi se odmah azurirali njihovi prikazi na turniru
      resetInputForm();

      
    }

    function resetEditPlayer(): void {
      store.resetEditPlayer();
    }

    function resetInputForm(): void {
      name.value = '';
      lastname.value = '';
      rating.value = '';
      found.value = false;
      notFound.value = false;
      isInput.value = false;
    }

    function remove(): void {
      //pošto nećemo više uklanjati igrače preko forme, ne treba nam ova funkcija
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
      if (!(visible.value)) {
        isEdit.value = true;
        visible.value = true;
        playerToEditData.value = store.playerToEdit;

        if (playerToEditData.value) {
          //popunit ćemo edit formu s trenutnim podatcima igrača kojeg editamo
          nameEdit.value = playerToEditData.value.name;
          lastnameEdit.value = playerToEditData.value.lastname;
          ratingEdit.value = playerToEditData.value.rating;
        }
      }
      
    }

    function removeEditForm() {
      isEdit.value = false;
    }

    async function onSubmitEdit() {
      if (playerToEditData.value) {
        nameEdit.value = parseString(nameEdit.value);
        lastnameEdit.value = parseString(lastnameEdit.value);
        const editedPlayer: Player = {
          // ovo su nam novi podatci koje je korisnik unio prilikom editanja, osim id-a, to ostaje isto
          id: playerToEditData.value.id,
          name: nameEdit.value,
          lastname: lastnameEdit.value,
          rating: ratingEdit.value,
          column: playerToEditData.value.column,
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
      nameEdit,
      lastnameEdit,
      ratingEdit,
      visible,
      notFound2,
      ratingValidation,
      searchEGD,
      onSubmit,
      remove,
      isEdit,
      isInput,
      playerToEditData,
      removeEditForm,
      onSubmitEdit,
      resetEditPlayer
    };
  },
});
</script>
