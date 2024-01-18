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
      pagination.sync="false"
      style="width: 80%; max-width: 1200px; margin: 0 auto; overflow-x: auto"
    />
  </div>
</template>

<script lang="ts">
import { watch } from 'vue';
import { defineComponent, ref } from 'vue';
import { usePlayersStore } from '../../utils/store';
import { Player } from '../models/models';

export default defineComponent({
  name: 'TablicaStanja',
  setup() {
    const store = usePlayersStore();
    const rows = ref<Player[]>(store.tablePlayers);
    // Kreiranje kopije polja igrača s dodanim rednim brojem
    const rowsWithIndex = ref<Player[]>([]);
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
        label: 'Pozicija',
        align: 'left',
        field: 'index',
        sortable: false,
      },
      {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: (row: Player) => row.name + ' ' + row.lastname,
        sortable: true,
      },
      {
        name: 'rating',
        label: 'Rating',
        align: 'center',
        field: (row: Player) => row.rating,
        sortable: true,
      },
      {
        name: 'NBW',
        label: 'NBW',
        align: 'center',
        field: (row: Player) => row.num_of_wins,
        sortable: true,
      },
      {
        name: 'firstRound',
        label: 'Prvo kolo',
        align: 'center',
        field: (row: Player) => (row.column == 'right' ? 'w' : 'b'),
        sortable: true,
      },
      {
        name: 'secondRound',
        label: 'Drugo kolo',
        align: 'center',
        field: (row: Player) => (row.column == 'right' ? 'w' : 'b'),
        sortable: true,
      },
      {
        name: 'thirdRound',
        label: 'Treće kolo',
        align: 'center',
        field: (row: Player) => (row.column == 'right' ? 'w' : 'b'),
        sortable: true,
      },
    ]);
      
    watch(
      () => store.tablePlayers,
      () => {
        (rows.value = store.tablePlayers), updateRowsWithIndex();
      }
    );
    function updateRowsWithIndex() {
      rowsWithIndex.value = rows.value.map((player, index) => ({
        ...player,
        index: index + 1,
      }));
    }

    return {
      columns,
      rows,
      rowsWithIndex, // Vraćanje tablice s rednim brojem
    };
  },
});
</script>
