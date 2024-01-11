<template>
  <q-layout class="form-container">
    <q-page-container>
      <div style="margin-left: 1.5rem; margin-top: 1rem">
      </div>
      <q-page class="q-pa-md row">
        <player-input
          :tournamentId="tournamentId"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style>
.forms-container {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.q-layout.form-container {
  min-height: auto !important;
  width: fit-content;
}

.q-page.row {
  min-height: auto !important;
}
</style>

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
