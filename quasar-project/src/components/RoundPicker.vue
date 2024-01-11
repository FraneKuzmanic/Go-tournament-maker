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
          <q-tab name="PrvoKolo" label="Prvo kolo" :disable="isLoading" />
          <q-tab name="DrugoKolo" label="Drugo kolo" :disable="isLoading" />
          <q-tab name="TrećeKolo" label="Treće kolo" :disable="isLoading" />
        </q-tabs>
        <q-separator />
        <q-card class="q-pa-md">
          <tournament-schedule
            :tournamentId="tournamentId"
            :creatorId="creatorId"
            :isLoading="isLoading"
            @update-load="handleLoadProp"
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
    const isLoading: Ref<boolean> = ref(false);

    function updateRound() {
      if (tab.value === 'PrvoKolo') store.setRound(RoundNumber.FIRST);
      else if (tab.value === 'DrugoKolo') store.setRound(RoundNumber.SECOND);
      else store.setRound(RoundNumber.THIRD);
    }

    const handleLoadProp = (newValue: boolean) => {
      isLoading.value = newValue;
    };

    watch(
      () => tab.value,
      () => {
        updateRound();
      }
    );

    return {
      tab,
      isLoading,
      handleLoadProp,
    };
  },
});
</script>
