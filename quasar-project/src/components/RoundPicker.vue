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
          <q-tab disabled="true" name="DrugoKolo" label="Drugo kolo" />
          <q-tab disabled="true" name="TrećeKolo" label="Treće kolo" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="PrvoKolo">
            <tournament-schedule
              :tournamentId="tournamentId"
              :creatorId="creatorId"
            />
          </q-tab-panel>

          <q-tab-panel name="DrugoKolo" disabled="true">
            <tournament-schedule
              :tournamentId="tournamentId"
              :creatorId="creatorId"
            />
          </q-tab-panel>

          <q-tab-panel name="TrećeKolo" disabled="true">
            <tournament-schedule
              :tournamentId="tournamentId"
              :creatorId="creatorId"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import TournamentSchedule from './TournamentSchedule.vue';
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
    return {
      tab: ref('PrvoKolo'),
    };
  },
});
</script>
