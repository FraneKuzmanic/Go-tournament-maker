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
          players: [],
          currentPlayer: undefined,
        }
    },
    actions: {
        addNewPlayer(newPlayer: Player) {
            this.players.push(newPlayer);
            this.currentPlayer = newPlayer;
        },

        setPlayers(initPlayers: Player[]){
            this.players = initPlayers;
        },

        removePlayer(delPlayer: Player){
            this.players = this.players.filter((player: Player) => player.id !== delPlayer.id);
            this.currentPlayer = delPlayer;
        }
    }
})