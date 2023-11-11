<template>
  <q-layout class="form-container">
    <q-page-container>
      <q-page>
        <div class="q-pa-md row justify-center">
          <q-btn
            class="q-mb-md"
            color="white"
            text-color="black"
            @click="addForm"
            label="NOVI IGRAČ"
          />
        </div>
        <player-input
          v-for="index in count"
          :key="index"
          :tournamentId="tournamentId"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import PlayerInput from './PlayerInput.vue';
import { Player } from 'src/models/models';

export default defineComponent({
  name: 'InputScreen',
  components: {
    PlayerInput,
  },
  props: {
    tournamentId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const count = ref(1);

    function addForm() {
      count.value++;
    }
    return {
      count,
      addForm,
    };
  },
});
</script>
