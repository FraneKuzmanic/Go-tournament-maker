<template>
  <div class="q-pa-md" >
    <q-badge v-if="standard < 0" color="blue">
      Current: {{ Math.abs(standard) }}k Choose the rating
    </q-badge>
    <q-badge v-else color="blue" >
      Current: {{ Math.abs(standard) }}d Choose the rating
    </q-badge>

    <q-slider
      v-model="standard"
      :min="-30"
      :max="5"
      :step="1"
      snap
      label
      :label-value = "Math.abs(standard)"
      color="blue"
      track-color="green"
      @update:model-value="changeColor"
    />
  </div></template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import { Player } from 'src/models/models'
import { getTournamentPlayers } from 'src/firebase/init'



export default defineComponent({
    name: 'colorPicker',


    props : {
        tournamentId: {
      type: String,
      required: true,
      
    },
    },
    setup(props) {
    const players: Ref<Player[]> = ref([]);
    const input : Ref<number> = ref(1);
    const changeColor = async () => {
      try {
        const result = await getTournamentPlayers(props.tournamentId);
   
        if (result !== undefined) {
          players.value = result;
          players.value.forEach((player) => {
            if(input.value < 0){
              const div = document.getElementById(player.id);

            if(player.rating.includes('k') && parseInt(player.rating) > Math.abs(input.value)){

                if(div != null){
                    div.style.backgroundColor = 'blue';
                }
            }
            else{
              if(div != null){
                    div.style.backgroundColor = 'green';
                }
            }
        }
            else{
              const div = document.getElementById(player.id);
                if(player.rating.includes('d') && parseInt(player.rating) > Math.abs(input.value)){
                
                    
                if(div != null){
                    div.style.backgroundColor = 'green';
                }
            }
                else{
                  if(div != null){
                    div.style.backgroundColor = 'blue';
                }
                }
            }
        
          });

          return ; 
        } else {
          console.error('getTournamentPlayers returned undefined');
        }
      } catch (error) {
        console.error('Error fetching tournament players:', error);
      }
    };

    return {
      standard: ref(input),
      changeColor,
      input: input,
      
    };
  },
  methods: {
   
  }
  
})

</script>