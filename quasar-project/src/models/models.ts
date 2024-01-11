//ovo su blueprintovi za ovjekte ,svi atributi koje moraju imati, ovo su kao klase, samo nisu instance klasa već blueprintovi

import { Color, colorsRgba } from "quasar";
import { RoundNumber } from "src/enums/rounds";

//ove "interfaceove" koristimo cesto u typescriptu da bi odredili kojeg tipa moraju biti neki nasi podatci, tj modeliramo nase objekte
export interface Tournament{
    creatorId: string;
    colorValue: number;
    firstRound: Round;
    secondRound: Round;
    thirdRound: Round;
}

//svako kolo od moguća tri sadrži igrače tog kola i partije(matchupove) za to kolo
export interface Round{
    players: Player[];
    matchups: Matchup[];
}

export interface Player{ 
    id: string,
    name: string;
    lastname: string;
    rating: string ;
    column: string | undefined; //ovo je informacija u kojem se trenutno stupcu igrač nalazi
    color: Color;
}

//Matchup će morati imati i informaciju o indexu u polju matchupova, i ishod matchupova pa to treba dodati kasnije
export interface Matchup{
    id: number,
    playerOne: Player,
    playerTwo: Player,
}

//U AppState pohranjujemo sve varijable koje čuvamo u store-u, kako bismo im mogli lako pristupati iz bilo koje komponente
export interface AppState{
    players: Player[], //ova varijabla nam služi samo da bi iz nje povukli sve igrače iz baze prilikom učitavanja turnira, i to je to, nemoramo u nju spremati nove igrače ili micati prilikom deletanja, samo je koristimo prilikom učitavanja iz baze da signaliziramo komponenti tournament-schedule da su igrači učitani pa da ih ona može preuzeti
    playerToAdd: Player | undefined, //u ovoj varijabli pohranjujemo trenutnog igrača koji se želi dodati u turnir
    playerToEdit: Player | undefined,//u ovoj varijabli pohranjujemo trenutnog igrača kojeg želimo ažurirati
    editedPlayer: Player |undefined, //ovdje spremamo ažuriranog igrača
    currentRound: RoundNumber, //ovo je broj runde koja je trenutno prikazana korisniku u aplikaciji, inicijalno je prva runda jer će se ona prva prikazati kad učitamo aplikaciju
    colorValue: number | undefined, //ovo je vrijednost color slidera koju povlačimo iz baze prilikom učitavanja i spremamo ovdje
    tablePlayers: Player[]; //ovo je lista igrača koja je prikazana u tablici stanja igrača
}
//Sve ove varijable u AppStateu nam služe kao varijable koje koristimo u više komponenti, a pošto je u vue.js teško
//pristupati takvim varijablama s više mjesta moramo definirati nekakav globalni appState i spremiti ih negdje
//odakle možemo lako pristupati iz svih komponenti, i zato koristimo playerStore
