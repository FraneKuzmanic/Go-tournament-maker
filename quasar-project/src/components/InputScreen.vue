<template>
    <q-layout>
        <q-page-container>
            <q-page padding style="padding-bottom: 45px;">
                <player-input v-for="index in count" :key="index"/>
                <q-page-sticky position="bottom">
                    <q-btn color="white" text-color="black" @click="addForm" label="NOVI IGRAČ"/>
                </q-page-sticky>
            </q-page>
        </q-page-container>
    </q-layout>
    
</template>



<script lang="ts">
import { defineComponent, ref } from 'vue';
import PlayerInput from './PlayerInput.vue';


export default defineComponent({
    name: 'InputScreen',
    components: {
        PlayerInput
    },
    setup() {
        const count = ref(1);

        function addForm() {
            count.value++;
        }
        return {
            count,
            addForm
        }
    }
})


</script>