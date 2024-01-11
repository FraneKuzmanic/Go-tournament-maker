import { defineStore } from 'pinia'
import { Player, AppState } from 'src/models/models'
import { RoundNumber } from 'src/enums/rounds'

//ovo nam je takozvani store, sluzi za globalni state managment, ako ne znate sta je to proucite malo
//Sve ove varijable u AppStateu nam služe kao varijable koje koristimo u više komponenti, a pošto je u vue.js teško
//pristupati takvim varijablama s više mjesta moramo definirati nekakav globalni appState i spremiti ih negdje
//odakle možemo lako pristupati iz svih komponenti, i zato koristimo playerStore

//playerStore se sastoji od  varijabli, one funkcioniraju kao Refovi ali na globalnoj razini, znači ako
//promijenimo njihovu vrijednost re-renderaju se sve komponente koje koriste tu varijablu

//osim varijabli imamo i akcije, one nam služe za promijenu vrijednosti tih varijabli
//poanta ovih akcija je kad one promijene neku varijablu, neka druga komponenta osluškuje tu promjenu
//pomoću takozvanih "watchera" i onda na tu promjenu komponenta reagira i obavi neku radnju

export const usePlayersStore = defineStore('players', {
    state: (): AppState => {
        return {
          players: [], //ova varijabla nam služi samo da bi iz nje povukli sve igrače iz baze prilikom učitavanja turnira, i još je koristimo kad obojamo igrače pa ih u ovu varijablu učitamo, nemoramo u nju spremati nove igrače ili micati prilikom deletanja, samo je koristimo prilikom učitavanja iz baze ili bojanja da signaliziramo komponenti tournament-schedule da su igrači učitani pa da ih ona može preuzeti
          playerToAdd: undefined, //u ovoj varijabli pohranjujemo trenutnog igrača koji se želi dodati u turnir
          playerToEdit: undefined, //u ovoj varijabli pohranjujemo trenutnog igrača kojeg želimo ažurirati
          editedPlayer: undefined, //ovdje spremamo ažuriranog igrača
          currentRound: RoundNumber.FIRST, //ovo je broj runde koja je trenutno prikazana korisniku u aplikaciji, inicijalno je prva runda jer će se ona prva prikazati kad učitamo aplikaciju
          colorValue: undefined, //ovo je vrijednost color slidera koju povlačimo iz baze prilikom učitavanja i spremamo ovdje
          tablePlayers: [], //ova nam vrijednost služi za igrače u tablici stanja igrača
        }
    },
    actions: {
        addNewPlayer(newPlayer: Player) {
            this.playerToAdd = newPlayer;
        },

        setPlayers(initPlayers: Player[]){
            this.players = initPlayers;
        },

        editPlayer(player: Player){
            this.playerToEdit = player;
        },
        resetEditPlayer() {
            this.playerToEdit = undefined; 
        },
        setRound(roundNo: RoundNumber){
            this.currentRound = roundNo;
        },
        setColorValue(val: number){
            this.colorValue = val;
        },
        setTablePlayers(players: Player[]){
            this.tablePlayers = players;
        }
    }
})