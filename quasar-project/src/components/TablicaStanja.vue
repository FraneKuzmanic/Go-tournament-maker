<template>
  <div>
    <q-table
      :rows="rowsWithIndex"
      :columns="columns"
      row-key="id"
      flat
      bordered
      title="Tablica poretka"
      :virtual-scroll="true"
      :pagination="{}"
      style="width: 80%; max-width: 1200px; margin: 0 auto; overflow-x: auto"
    />
  </div>
</template>

<script lang="ts">
import { watch } from 'vue';
import { defineComponent, ref } from 'vue';
import { usePlayersStore } from '../../utils/store';
import { Player, ExtendedPlayer } from '../models/models';

export default defineComponent({
  name: 'TablicaStanja',
  setup() {
    const store = usePlayersStore();
    const rows = ref<ExtendedPlayer[]>(store.tablePlayers);
    const rowsWithIndex = ref<ExtendedPlayer[]>([]);
    
    watch(
      () => store.tablePlayers,
      () => {
        // Sortiraj podatke prije nego što se pozove updateRowsWithIndex
        const sortedPlayers = [...store.tablePlayers].sort((a, b) => b.num_of_wins - a.num_of_wins);
        rows.value = sortedPlayers;
        updateRowsWithIndex();
      }
    );

    watch(
      () => store.tableChange,
      () => {
        // Sortiraj podatke prije nego što se pozove updateRowsWithIndex
        const sortedPlayers = [...store.tablePlayers].sort((a, b) => b.num_of_wins - a.num_of_wins);
        rows.value = sortedPlayers;
        updateRowsWithIndex();
      }
    );

    const columns = ref<
      Array<{
        name: string;
        label: string;
        field: string | ((row: any) => any);
        required?: boolean;
        align?: 'left' | 'center' | 'right';
        sortable?: boolean;
        sort?: (a: any, b: any, rowA: any, rowB: any) => number;
      }>
    >([
      {
        name: 'index',
        required: true,
        label: 'Poredak',
        align: 'left',
        field: 'index',
        sortable: false,
      },
      {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: (row: ExtendedPlayer) => row.name + ' ' + row.lastname,
        sortable: false,
      },
      {
        name: 'rating',
        label: 'Rating',
        align: 'center',
        field: (row: ExtendedPlayer) => row.rating,
        sortable: false,
      },
      {
        name: 'NBW',
        label: 'NBW',
        align: 'center',
        field: (row: ExtendedPlayer) => row.num_of_wins,
        sortable: true,
      },
       {
        name: 'SOS',
        label: 'SOS',
        align: 'center',
        field: (row: ExtendedPlayer) => row.opponentwins,
        sortable: true,
      },
      {
        name: 'firstRound',
        label: 'Prvo kolo',
        align: 'center',
        field: (row: ExtendedPlayer) => {
            const firstRoundMatch = row.playedMatches.length > 0 ? row.playedMatches[0] : null;
            return firstRoundMatch ? firstRoundMatch.opponent : '';
          },
        sortable: false,
      },
      {
        name: 'secondRound',
        label: 'Drugo kolo',
        align: 'center',
        field: (row: ExtendedPlayer) => {
            const firstRoundMatch = row.playedMatches.length > 0 ? row.playedMatches[1] : null;
            return firstRoundMatch ? firstRoundMatch.opponent : '';
          },
        sortable: false,
      },
      {
        name: 'thirdRound',
        label: 'Treće kolo',
        align: 'center',
        field: (row: ExtendedPlayer) => {
            const firstRoundMatch = row.playedMatches.length > 0 ? row.playedMatches[2] : null;
            return firstRoundMatch ? firstRoundMatch.opponent : '';
          },
        sortable: false,
      },
    ]);

    function updateRowsWithIndex() {
      rowsWithIndex.value = rows.value.map((player, index) => ({
        ...player,
        index: index + 1,
      }));
    }

    return {
      columns,
      rows,
      rowsWithIndex,
    };
  },
});
</script>