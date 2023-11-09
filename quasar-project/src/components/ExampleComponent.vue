<template>
  <meta charset="UTF8">

  <h1>Players lesgooo</h1>
  <div id="main-container">
    <div class="player-group" id="left-column">
      <draggable v-model="playersColumnLeft" tag="ul" group="players" item-key="id" >
        <template #item="{ element: player }">
          <li @click="updateMatchups">{{ player.name }} {{ player.surname[0] }}.</li>
        </template>
      </draggable>
    </div>

    <div class="player-group" id="right-column">
      <draggable v-model="playersColumnRight" tag="ul" group="players" item-key="id">
        <template #item="{ element: player }">
          <li>{{ player.name }} {{ player.surname[0] }}.</li>
        </template>
      </draggable>
    </div>
  </div>
  
  <div id="unmatched-drawer">
    <div class="player-group" id="unmatched-column">
      <draggable v-model="unmatchedPlayers" tag="ul" group="players" item-key="id">
        <template #item="{ element: player }">
          <li>{{ player.name }} {{ player.surname[0] }}.</li>
        </template>
      </draggable>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Todo, Meta } from './models';
import { firebaseConfig } from '../firebase/init';
import { onMounted } from 'vue'; // Import onMounted from Vue 3
import { doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import draggable from 'vuedraggable';







export default defineComponent({
  name: 'ExampleComponent',
  props: {
    title: {
      type: String,
      required: true,
    },
    todos: {
      type: Array as PropType<Todo[]>,
      default: () => [],
    },
    meta: {
      type: Object as PropType<Meta>,
      required: true,
    },
    active: {
      type: Boolean,
    },

  },  
  components : {draggable},
  setup(props) {
    //dohvaćanje korisnika iz firestore-a, provjera rada
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const playersColumnLeft = ref([
      {id: 0, name: 'Boris', surname: 'Milasinovic', rank: 5, pts: 2},
      {id: 1, name: 'Evil Boris', surname: 'Milasinovic', rank: 5, pts: 2},
      {id: 2, name: 'Igor', surname: 'Mekterovic', rank: 4, pts: 1.5},
      {id: 3, name: 'Ljiljana', surname: 'Brkic', rank: 4, pts: 1.5},
    ])

    const playersColumnRight = ref([
      {id: 4, name: 'Mario', surname: 'Kusek', rank: 3, pts: 1},
      {id: 5, name: 'Kristijan', surname: 'Kilassa', rank: 3, pts: 1},
      {id: 6, name: 'Hrvoje', surname: 'Pandzic', rank: 2, pts: 1.5},
      {id: 7, name: 'Petar', surname: 'Mostarac', rank: 2, pts: 1.5},
    ])

    const unmatchedPlayers = ref([])
    // Have all the players in one array
    // Make the first split of arrays to be computed

    var matchups = ref()
    

    const updateMatchups = () => {
      var _matchups = []
      const leftColumnLength = playersColumnLeft.value.length
      const rightColumnLength = playersColumnRight.value.length
      var shorterArray
      //iterate over the shorter array
      if(leftColumnLength < rightColumnLength)
        shorterArray = leftColumnLength
      else
        shorterArray = rightColumnLength

      for(var i=0; i<shorterArray; i++){
          _matchups[i] = {player1: playersColumnLeft.value[i], player2: playersColumnRight.value[i]}
      }

      console.log(_matchups)
      matchups.value = _matchups
    }


    onMounted(async () => {
      try {
        const usersCollection = doc(db, 'users', 'urekkLRIn5YTqhYMezPx'); // Replace 'users' with your actual collection name
        const usersSnapshot = await getDoc(usersCollection);

        console.log('Document data:', usersSnapshot.data());
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    });

    return { playersColumnLeft, playersColumnRight, unmatchedPlayers, updateMatchups, matchups }
  },
});
</script>
