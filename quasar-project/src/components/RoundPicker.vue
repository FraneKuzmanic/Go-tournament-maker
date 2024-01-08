<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="PrvoKolo" label="Prvo kolo" />
          <q-tab name="DrugoKolo" label="Drugo kolo" />
          <q-tab name="TrećeKolo" label="Treće kolo" :disable="false" />
        </q-tabs>
        <q-separator />
        <q-card class="q-pa-md">
          <tournament-schedule
            :tournamentId="tournamentId"
            :creatorId="creatorId"
          />
        </q-card>
      </q-card>
    </div>
  </div>
</template>
<script lang="ts">
import { Ref, defineComponent, ref, watch } from 'vue';
import TournamentSchedule from './TournamentSchedule.vue';
import { usePlayersStore } from 'app/utils/store';
import { RoundNumber } from 'src/enums/rounds';

export default defineComponent({
  name: 'RoundPicker',
  components: {
    'tournament-schedule': TournamentSchedule,
  },
  props: {
    tournamentId: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const store = usePlayersStore();

    const tab: Ref<string> = ref('PrvoKolo');

    function updateRound() {
      if (tab.value === 'PrvoKolo') store.setRound(RoundNumber.FIRST);
      else if (tab.value === 'DrugoKolo') store.setRound(RoundNumber.SECOND);
      else store.setRound(RoundNumber.THIRD);
    }

    watch(
      () => tab.value,
      () => {
        updateRound();
      }
    );

    return {
      tab,
    };
  },
});
</script>
