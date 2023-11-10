//ovo je blueprint za objekt Turnira,svi atributi koje mora imati, trenutno nisu svi koji bi trebali bit
//ove "interfaceove" koristimo cesto u typescriptu da bi odredili kojeg tipa moraju biti neki nasi podatci
export interface Tournament{
    creatorId: string;
    players: string[];
}