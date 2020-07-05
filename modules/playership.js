const Player = require("./player");

class Playership {
    get length() {
        return this._players.length;
    }
    get players() {
        return this._players;
    }

    set players(value) {
        this._players = value;
    }

    constructor() {
        this._players = [];
    }


    addPlayer(pName){
        let tempPlayer = new Player(pName, this.length);
        this._players.push(tempPlayer);
    }

    getPlayerByName(pName){
        for (let i = 0; i < this.length; i++) {
            if (this._players[i].name === pName){
                return this.players[i];
            }
        }
    }

    getPlayerByPosition(pPosition){
        return this._players[pPosition];
    }

    getNameByPosition(pPosition){
        return this._players[pPosition].name;
    }

    getPositionByName(pName){
        return this.getPlayerByName(pName).position;
    }

    getHandByName(pName){
        return this.getPlayerByName(pName).hand;
    }

    addCardByName(pCard, pName){
        this.getPlayerByName(pName).addToHand(pCard);
    }

    getReceivingCardByName(pName){
        return this.getPlayerByName(pName).receivingCard;
    }

    setReceivingCardByName(pCard, pName){
        this.getPlayerByName(pName).receivingCard = pCard;
    }

    getHandByPosition(pPosition){
        return this._players[pPosition].hand;
    }

    getLengthByPosition(pPosition){
        return this._players[pPosition].length;
    }

    addCardByPosition(pCard, pPosition){
        this._players[pPosition].addToHand(pCard);
    }

    getReceivingCardByPosition(pPosition){
        return this._players[pPosition].receivingCard;
    }

    setReceivingCardByPosition(pCard, pPosition){
        this._players[pPosition].receivingCard = pCard;
    }

    addReceivingCards(){
        this._players.forEach(oPlayer => {
            oPlayer.addReceivingCard();
        });
    }

    //überprüft ob für jeden eine Karte gewählt wurde
    allHaveReceivingCards(){
        for (let i = 0; i < this.length; i++) {
            if (!this.getPlayerByPosition(i).hasReceivingCard()){
                return false;
            }
        }
        return true;
    }

    resetAllHands(){
        for (const player of this.players) {
            player.hand = [];
        }
    }

    setPlayerOrder(pPLayerOrder){
        let tempPlayerArray = [];
        for (let i = 0; i < this.length; i++) {
            tempPlayerArray.push(this.getPlayerByName(pPLayerOrder[i]));
            tempPlayerArray[i].position = i;
        }
        this._players = tempPlayerArray;
    }

    //Narr-Funktion
    switchCards(oStats){
        let temp = this._players[0].hand;
        for (let i = 0; i < this.length - 1; i++) {
            oStats.savePlayerData(this.getNameByPosition(i),"lostByNarr", this.getPlayerByPosition(i).hand);
            this.getPlayerByPosition(i).hand = this.getPlayerByPosition(i + 1).hand;
            oStats.savePlayerData(this.getNameByPosition(i),"gotByNarr", this.getPlayerByPosition(i).hand);
        }
        oStats.savePlayerData(this.getNameByPosition(this.length - 1),"lostByNarr", this.getPlayerByPosition(this.length - 1).hand);
        this.getPlayerByPosition(this.length - 1).hand = temp;
        oStats.savePlayerData(this.getNameByPosition(this.length - 1),"gotByNarr", this.getPlayerByPosition(this.length - 1).hand);
    }

    getComesoutData(){
        let arrRet = [];
        for (let i = 0; i < this._players.length; i++) {
            arrRet.push(this._players[i].bComesout());
        }
        return arrRet;
    }

    kickPlayer(playername){
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].name === playername){
                this.players.splice(i,1);
                break;
            }
        }
        // Positionen berichtigen
        for (let i = 0; i < this.players.length; i++) {
            this.players[i]._position = i;
        }
    }
}

module.exports = Playership;
