import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getFirestore, collection, doc, getDoc, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Tournament, Player, Round } from "src/models/models";
import { RoundNumber } from "src/enums/rounds";

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
      firstRound: tournament.firstRound,
      secondRound: tournament.secondRound,
      thirdRound: tournament.thirdRound,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  return "";
}

//funkcija za dohvat igraca iz firestore-a
export const getTournamentPlayers = async (tournamentId: string, roundNo: RoundNumber): Promise<Player[] | undefined> => {

  const docRef = doc(db, "tournaments", tournamentId);
  const docSnap = await getDoc(docRef);

  let tournament: Tournament | undefined;

  if (docSnap.exists()) {
    tournament = docSnap.data() as Tournament;
  } else {
    console.log("Tournament doesn't exist!");
  }

  if (roundNo == RoundNumber.FIRST)
  return tournament?.firstRound.players
  else if (roundNo == RoundNumber.SECOND)
  return tournament?.secondRound.players
  else
  return tournament?.thirdRound.players

  
}

export const addNewPlayer = async(player: Player, tournamentId: string, roundNo: RoundNumber): Promise<void> => {

  const dbRef = doc(db, 'tournaments', tournamentId);

  if (roundNo == RoundNumber.FIRST)
  await updateDoc(dbRef, {
    'firstRound.players': arrayUnion(player),
  });
  else if (roundNo == RoundNumber.SECOND)
  await updateDoc(dbRef, {
    'secondRound.players': arrayUnion(player),
  });
  else
  await updateDoc(dbRef, {
    'thirdRound.players': arrayUnion(player),
  });

}

export const removePlayer = async(player: Player, tournamentId: string, roundNo: RoundNumber): Promise<void> => {

  const dbRef = doc(db, 'tournaments', tournamentId);

  if (roundNo == RoundNumber.FIRST)
  await updateDoc(dbRef, {
    'firstRound.players': arrayRemove(player),
  });
  else if (roundNo == RoundNumber.SECOND)
  await updateDoc(dbRef, {
    'secondRound.players': arrayRemove(player),
  });
  else
  await updateDoc(dbRef, {
    'thirdRound.players': arrayRemove(player),
  });

}

export const updatePlayerColumn = async(oldPlayer: Player, newPlayer: Player, tournamentId: string, roundNo: RoundNumber): Promise<void> => {

  const dbRef = doc(db, 'tournaments', tournamentId);

  if (roundNo == RoundNumber.FIRST){
    await updateDoc(dbRef, {
      'firstRound.players': arrayRemove(oldPlayer)
    });

    await updateDoc(dbRef, {
      'firstRound.players': arrayUnion(newPlayer)
    });
  }else if (roundNo == RoundNumber.SECOND){
    await updateDoc(dbRef, {
      'secondRound.players': arrayRemove(oldPlayer)
    });
  
    await updateDoc(dbRef, {
      'secondRound.players': arrayUnion(newPlayer)
    });
  }else{
    await updateDoc(dbRef, {
      'thirdRound.players': arrayRemove(oldPlayer)
    });
  
    await updateDoc(dbRef, {
      'thirdRound.players': arrayUnion(newPlayer)
    });
  }

}

//OVDJE PISEMO SVE FUNKCIJE KOJE KOMUNICIRAJU S FIREBASEOM, PUNO JE ELEGANTNIJE I LAKSE ODE IH NAPISAT 
//JER ONDA SAMO JEDAN PUT MORAMO INICIJALIZIRAT FIRESTORE I OSTALE STVARI ZA FB