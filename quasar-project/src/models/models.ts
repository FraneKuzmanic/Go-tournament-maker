//ovo su blueprintovi za ovjekte ,svi atributi koje moraju imati, imat cemo ih jos sigurno do kraja projekta

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

export interface Round{
    players: Player[];
}

export interface Player{ //sigurno da cemo doradit neke modele jer ja ni sam ne znam jos sta nam sve treba znat za playera 
    id: string,
    name: string;
    lastname: string;
    rating: string ;
    column: string | undefined;
    color: Color;
}

export interface Matchup{
    id: number,
    playerOne: Player,
    playerTwo: Player,
}

export interface AppState{
    players: Player[],
    playerToAdd: Player | undefined,
    playerToEdit: Player | undefined,
    editedPlayer: Player |undefined,
    currentRound: RoundNumber,
    colorValue: number | undefined,
}
