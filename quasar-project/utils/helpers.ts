import { Color, colorsRgba ,NamedColor} from "quasar";
import { Matchup, Player } from "src/models/models";
import { setCssVar } from 'quasar'


//helpers je datoteka u koju stavljamo neke funkcije koje nam pomažu a ne želimo ih staviti u neku drugu
//datoteku da nebi prenatrpali kod
//helpers funkcije mogu biti i neke koje koriste više komponenti pa ih želimo vući s jednog mjesta

export function getColor(value: number, player: Player) : string{ //funkcija koja procjenjuje u koju boju treba obojati igrača
  
    if (value < 0) {
        if (
          player.rating.includes('k') &&
          parseInt(player.rating) > Math.abs(value)
          
        ) {
          return 'rgb(37, 124, 159)'
        } else {
          return 'rgb(63, 185, 69)'
        }
      } else {
        if (
          player.rating.includes('d') &&
          parseInt(player.rating) > Math.abs(value)
        ) {
          return 'rgb(63, 185, 69)'
        } else {
          return 'rgb(37, 124, 159)'
        }
      }
}

export function savePlayerColor(players: Player[], value: number) : Player[]{ //funkcija koja uzima polje igrača i svakog igrača oboji te vrati polje obojanih igrača
    players.forEach((player: Player) => {
        player.color = getColor(value, player);
    });
    return players;
}

export function getWinner(playerWonId: string | null, playerId: string) : boolean{

  if (!playerWonId)
  return false;

  return playerWonId === playerId;
}
