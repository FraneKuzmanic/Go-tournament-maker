import { defineStore } from 'pinia'
import { Ref, computed, ref } from 'vue'
import { Player, AppState } from 'src/models/models'

//ovo nam je takozvani store, sluzi za globalni state managment, ako ne znate sta je to proucite malo
//ugl buduci da sam kod organizirao tako da s podacima o igracima baratamo kroz nekoliko komponenti onda je
//nepovoljno da se mucimo s prosljedivanjem propsa kroz vise komponenti i zato je uvijek kod toga dobro uvest
//globalni state s kojim mozemo lako igracima pristupat iz bilo koje komponente,bez parent->child prosljedivanja propsa
export const usePlayersStore = defineStore('players', {
    state: (): AppState => {
        return {
          players: [], //ova varijabla nam služi samo da bi iz nje povukli sve igrače iz baze prilikom učitavanja turnira 
          playerToAdd: undefined, //u ovoj varijabli pohranjujemo trenutnog igrača koji se želi dodati u turnir
          playerToEdit: undefined, //u ovoj varijabli pohranjujemo trenutnog igrača kojeg želimo ažurirati
          editedPlayer: undefined, //ovdje spremamo ažuriranog igrača
        }
    },
    actions: {
        addNewPlayer(newPlayer: Player) {
            this.playerToAdd = newPlayer;
            this.players[this.players.length] = newPlayer;
        },

        setPlayers(initPlayers: Player[]){
            this.players = initPlayers;
        },

        editPlayer(player: Player){
            this.playerToEdit = player;
        },
        resetEditPlayer() {
            this.playerToEdit = undefined; 
        }
    }
})