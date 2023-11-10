<template>
    <div>
        <q-form v-if="showcomponent" @submit="onSubmit">
            <q-input filled v-model.trim="name" :disable="addedToDB" label="IME" :rules="[val => !!val || 'Ime je obavezno']" />
            <q-input filled v-model.trim="lastname" :disable="addedToDB" label="PREZIME" :rules="[val => !!val || 'Prezime je obavezno']" />
            <q-input v-if="notFound || found" filled v-model.trim="rating" :disable="addedToDB" label="RATING" :rules="[val => !!val || 'Rating je obavezan']" />
            <q-btn :disable="addedToDB" @click="searchEGD" label="TRAŽI" />
            <q-btn :disable="!found && !notFound" label="DODAJ" type="submit"/>
            <q-btn @click="remove" label="UKLONI" />
            <q-dialog v-model="notFound2">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Alert</div>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        Igrač nije pronađen u bazi. Provjerite je li uneseno ispravno ime i prezime ili upišite rating i kliknite na gumb DODAJ
                    </q-card-section>
                    <q-card-actions>
                        <q-btn flat label="OK" color="primary" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </q-form>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { firebaseConfig } from '../firebase/init';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useQuasar } from 'quasar';

export default defineComponent({
    name: 'PlayerInput',
    setup() {
        
        const $q = useQuasar()

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const dbRef = doc(db, 'tournaments', 'ReDengcyBiDlampShGwD')

        const name = ref(null)
        const lastname = ref(null)
        const found = ref(false)
        const notFound = ref(false)
        const notFound2 = ref(false)
        const rating = ref()
        const showcomponent = ref(true)
        const addedToDB = ref(false)

        async function searchEGD() {
            const res =  await fetch('https://www.europeangodatabase.eu/EGD/GetPlayerDataByData.php?lastname='+lastname.value+'&name='+name.value, {
                method: 'GET'
            })
            const data = await res.json()
            if (data.players === undefined || data.players.length > 1){
                notFound.value = true
                notFound2.value = true
            } else {
                rating.value = data.players[0].Grade
                found.value = true
            }
        }
        async function onSubmit() {
            addedToDB.value = true
            const playerForDB = {
                name: name.value,
                lastname: lastname.value,
                rating: rating.value
            }
            await updateDoc(dbRef, {
                players: arrayUnion(playerForDB)
            });
            showNotif()
        }
        async function remove() {
            showcomponent.value = false
            const playerForDB = {
                name: name.value,
                lastname: lastname.value,
                rating: rating.value
            }
            if (addedToDB.value) {
                await updateDoc(dbRef, {
                    players: arrayRemove(playerForDB)
                });
            }
            
        }
        function showNotif() {
            $q.notify({
                message: "Igrač je uspješno dodan.",
                color: 'green'
            })
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
            remove
        }
    }
})


</script>