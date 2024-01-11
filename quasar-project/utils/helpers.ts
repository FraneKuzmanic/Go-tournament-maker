import { Color } from "quasar";
import { Player } from "src/models/models";

export function getColor(value: number, player: Player) : Color{
    if (value < 0) {
        if (
          player.rating.includes('k') &&
          parseInt(player.rating) > Math.abs(value)
        ) {
          return 'blue'
        } else {
          return 'green'
        }
      } else {
        if (
          player.rating.includes('d') &&
          parseInt(player.rating) > Math.abs(value)
        ) {
          return 'green'
        } else {
          return 'blue'
        }
      }
}

export function savePlayerColor(players: Player[], value: number) : Player[]{
    players.forEach((player: Player) => {
        player.color = getColor(value, player);
    });
    return players;
}