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
    const rows = ref<Player[]>(store.players);
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
        field: (row: Player) => row.name + " " + row.lastname,
        sortable: true,
      },
      {
        name: 'rating',
        label: 'Rating',
        align: 'center',
        field: (row: Player) => row.rating,
        sortable: true,
      },
    ]);

    watch(
      () => store.players,
      () => {
        (rows.value = store.players), updateRowsWithIndex();
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
