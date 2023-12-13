import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getFirestore, collection, doc, getDoc, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Tournament, Player } from "src/models/models";

//konfiguracija za povezivanje s nasim firebaseom
export const firebaseConfig = {
  apiKey: 'AIzaSyCEsNFcDTkfUErW9I7C4s4su2hJ-jNg81E',
  authDomain: 'swiss-system-tournament.firebaseapp.com',
  projectId: 'swiss-system-tournament',
  storageBucket: 'swiss-system-tournament.appspot.com',
  messagingSenderId: '694342341232',
  appId: '1:694342341232:web:343d28366fcabf62701ab5',
  measurementId: 'G-KLHW70YZ6G'
};

//inicijalizacija samog firebase-a
const app = initializeApp(firebaseConfig);

//ovo je inicijalizacija objekta samog firestore-a
const db = getFirestore(app);

//funkcija za stvaranje novog turnira na firestore-u
export const addNewTournament = async (tournament: Tournament): Promise<string> => {

  try {
    const docRef = await addDoc(collection(db, "tournaments"), {
      creatorId: tournament.creatorId,
      players: tournament.players,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  return "";
}

//funkcija za dohvat igraca iz firestore-a
export const getTournamentPlayers = async (tournamentId: string): Promise<Player[] | undefined> => {

  const docRef = doc(db, "tournaments", tournamentId);
  const docSnap = await getDoc(docRef);

  let tournament: Tournament | undefined;

  if (docSnap.exists()) {
    tournament = docSnap.data() as Tournament;
  } else {
    console.log("Tournament doesn't exist!");
  }

  return tournament?.players;
}

export const addNewPlayer = async(player: Player, tournamentId: string): Promise<void> => {

  const dbRef = doc(db, 'tournaments', tournamentId);

  await updateDoc(dbRef, {
    players: arrayUnion(player)
  });

}

export const removePlayer = async(player: Player, tournamentId: string): Promise<void> => {

  const dbRef = doc(db, 'tournaments', tournamentId);

  await updateDoc(dbRef, {
    players: arrayRemove(player)
  });

}

//OVDJE PISEMO SVE FUNKCIJE KOJE KOMUNICIRAJU S FIREBASEOM, PUNO JE ELEGANTNIJE I LAKSE ODE IH NAPISAT 
//JER ONDA SAMO JEDAN PUT MORAMO INICIJALIZIRAT FIRESTORE I OSTALE STVARI ZA FB